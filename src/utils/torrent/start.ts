import WebTorrent, { Torrent } from "webtorrent";
import winston from "winston";
import path from "path";
import {
  AWS_BUCKET,
  MAGNET_DOWNLOAD_PROCESS,
  METADATA_FETCH_TIMEOUT,
  getDownloadPath,
} from "../../config.js";
import { TorService } from "../firebase/torrent.service.js";
import { constructData, getById } from "../../modules/torrent/accept.js";
import fs from "fs";
import { S3Util } from "../aws/s3/main.js";
import { NotAcceptableException } from "../Error.js";
import { directoryTree } from "../directree.js";
import { SandboxedJob } from "bullmq";
import { STATUS } from "../../entity/torrent.entity.js";

export type FileStored = {
  files: string[];
  size: number;
  torHash: string;
  name: string;
  s3Path?: string;
};

export class MagnetQueue {
  constructor(
    protected readonly torService: TorService,
    protected readonly logger: winston.Logger,
    protected readonly job: SandboxedJob,
  ) {}

  protected torClient = () => {
    return new WebTorrent();
  };

  protected tempPath = getDownloadPath();

  constructData(torrent: Torrent) {
    return constructData(torrent);
  }

  protected async verifyIfExists(
    link: string,
    client: WebTorrent.Instance,
    logger: winston.Logger,
    hash: string,
  ) {
    return new Promise((rslv, rjt) => {
      const tor = client.add(link, {
        path: path.resolve(this.tempPath, hash),
        destroyStoreOnDestroy: true,
      });

      // If the torrent doesn't have enough peers to retrieve metadata, return
      // limited info we get from parsing the magnet URI (the parsed metadata is guaranteed
      // to have `infoHash` field)
      const timeoutID = setTimeout(async () => {
        client.remove(tor, {}, () => {
          logger.info("Timeout while fetching torrent metadata.");
          rjt(this.constructData(tor));
        });
      }, METADATA_FETCH_TIMEOUT);

      tor.on("metadata", () => {
        logger.info("Metadata parsed...");
        clearTimeout(timeoutID);

        client.remove(tor, {}, () => {
          logger.info("Torrent removed.");
          rslv(this.constructData(tor));
        });
      });
    });
  }

  protected async startMagnet(
    magnetLink: string,
    logger: winston.Logger,
    client: WebTorrent.Instance,
    context: string,
    hash: string,
  ) {
    const savedFiles: FileStored = await new Promise((resolve, reject) => {
      client.on("error", async (err) => {
        logger.error(err);
        await Promise.allSettled([
          this.torService.deleteProgress(hash),
          this.torService.update(hash, {
            progress: 100,
            is_error: true,
            message: typeof err === "string" ? err : err.message,
            status: STATUS.FAILED,
          }),
        ])
          .then(() => {
            reject(err);
          })
          .catch((e) => reject(e));
      });

      const filePath = path.resolve(this.tempPath, hash);

      client.add(magnetLink, { path: filePath }, async (torrent) => {
        logger.info(
          `Downloading: path=${filePath} name=${torrent.name} filesize=${torrent.length} hash=${torrent.infoHash}`,
        );

        await Promise.allSettled([
          this.torService.updateInprogressInDb(hash),
          this.torService.update(hash, {
            size: torrent.length,
            torhash: torrent.infoHash,
            filename: torrent.name,
            updated_at: Date.now(),
          }),
        ]);

        // Track download progress
        torrent.on("download", async () => {
          const percent = (torrent.progress * 100).toFixed(2);
          // logger.debug(`downloadProgress=${percent}%`);
          await Promise.allSettled([
            this.job.updateProgress(Number(percent)),
            this.torService.progress(hash, {
              progress: Number(percent),
              downloadSpeed: torrent.downloadSpeed,
              filesize: torrent.length,
            }),
          ]);
        });

        // When the torrent is fully downloaded
        torrent.on("done", async () => {
          logger.info(`Download finished`);
          const name = torrent.name;
          const size = torrent.length;
          const torHash = torrent.infoHash;
          const localfiles = torrent.files.map((v) => v.path);
          client.remove(torrent, {}, (err) => {
            if (err) {
              if (err instanceof Error) {
                logger.error(err.message, err.stack, `${context}x120`);
              } else {
                logger.error(err, `${context}x120`);
              }
            }
          });
          resolve({ files: localfiles, size, torHash, name });
        });

        torrent.on("error", (err) => {
          logger.error(err);
          client.remove(torrent, {}, (err) => {
            if (err) {
              if (err instanceof Error) {
                logger.error(err.message, err.stack, `${context}x120`);
              } else {
                logger.error(err, `${context}x120`);
              }
            }
            reject(err);
          });
        });
      });
    });
    return savedFiles;
  }

  protected async uploadFilesToS3(
    hash: string,
    savedFiles: FileStored,
    logger: winston.Logger,
  ) {
    const filePath = path.resolve(this.tempPath, hash);

    this.job.log(`UPLOADING: uploading files to the s3 bucket`);

    const remotePaths = await Promise.all(
      savedFiles.files.map(async (file) => {
        const remotePath = `torrent/${hash}/${savedFiles.torHash}/${file}`;

        const localfile = path.resolve(filePath, file);
        logger.debug(
          `localfilePath=${localfile} remoteFile=${remotePath} bucket=${AWS_BUCKET}`,
        );
        const fileRead = fs.createReadStream(localfile);
        this.job.log(`UPLOADING: started uploading file=${localfile}`);

        await S3Util.parrallelUpload(remotePath, fileRead);
        this.job.log(`UPLOADING: uploaded file=${localfile} to ${remotePath}`);

        fs.unlinkSync(localfile);
        this.job.log(`UPLOADING: deleted file=${localfile}`);

        const pRemotePath = `s3://${AWS_BUCKET}/${remotePath}`;

        return { s3Path: pRemotePath, file: file, bucket: AWS_BUCKET };
      }),
    );
    return remotePaths;
  }

  async process(data: { url: string; hash: string }) {
    const magnetLink = data.url;
    const hash = data.hash;
    const context = `${MAGNET_DOWNLOAD_PROCESS}:${hash}`;
    const logger = this.logger;

    try {
      logger.info(`download file path=${this.tempPath}`);
      this.job.log(`starting the progress`);

      const info = await getById(hash);

      if (!info) {
        throw new Error(`id=${hash} not found in the database`);
      }

      const client = this.torClient();

      const exists = await this.verifyIfExists(magnetLink, client, logger, hash)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        await Promise.allSettled([
          this.torService.deleteProgress(hash),
          this.torService.update(hash, {
            progress: 100,
            is_error: true,
            updated_at: Date.now(),
            message: "not enough peers found to download the file.",
            status: STATUS.TIMEDOUT,
          }),
          this.job.log(`FAILED: not enough peers found to download the file.`),
        ]);

        return false;
      }

      this.job.log(`validated the link`);

      const savedFiles = await this.startMagnet(
        magnetLink,
        logger,
        client,
        context,
        hash,
      ).catch(() => {
        return false;
      });

      if (typeof savedFiles === "boolean" && savedFiles === false) {
        await Promise.allSettled([
          this.torService.deleteProgress(hash),
          this.torService.update(hash, {
            progress: 100,
            is_error: true,
            updated_at: Date.now(),
            message: "unable to download the files due to connection errors",
            status: STATUS.FAILED,
          }),
          this.job.log(
            `FAILED: unable to download the files due to connection errors`,
          ),
        ]);

        return false;
      }

      if (typeof savedFiles === "boolean") {
        throw new NotAcceptableException(
          "type of boolean for savedFiles is not acceptables",
        );
      }

      const rPath = path.resolve(this.tempPath, hash, savedFiles.name);
      const sPath = path.resolve(rPath, "..");

      const s3Prefix = `s3://${AWS_BUCKET}/torrent/${hash}/${info.hash}`;

      // generate direct tree
      const tree = directoryTree(
        s3Prefix,
        rPath,
        undefined,
        sPath,
        {
          attributes: ["extension", "type", "size", "localpath", "remotepath"],
        },
        undefined,
        undefined,
        undefined,
      );

      // upload it to the remote path
      this.job.log("uploading: uploading files to s3");
      await this.uploadFilesToS3(hash, savedFiles, logger);

      await Promise.allSettled([
        this.job.updateProgress(100),
        this.torService.deleteProgress(hash),
        this.torService.update(hash, {
          size: savedFiles.size,
          progress: 100,
          torhash: savedFiles.torHash,
          tree: tree,
          status: STATUS.COMPLETED,
          updated_at: Date.now(),
        }),
        this.job.log("COMPLETED: job is completed"),
      ]);

      logger.info(`finished`);
      return Promise.resolve(tree);
    } catch (e) {
      if (e instanceof Error) {
        logger.error(e.message, e.stack);
      } else {
        logger.error(`error processing information`, e);
      }
      return Promise.reject(e);
    }
  }
}
