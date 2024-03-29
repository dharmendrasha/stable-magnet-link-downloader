import { magnetDecode } from "@ctrl/magnet-link";
import { firestore, realtime, admin, app } from "./app.js";
import { randomUUID } from "crypto";
import { S3Util } from "../aws/s3/main.js";
import winston from "winston";
import { MagnetRequests, STATUS } from "../../entity/torrent.entity.js";
import { getRepository } from "../db.js";
import { Webhook } from "../Webhook.js";
import { SandboxedJob } from "bullmq";
import { WorkerData } from "../../modules/torrent/worker/run.js";

export type IUpdateData = {
  progress?: number;
  is_error?: boolean;
  updated_at?: number;
  message?: string;
  status?: STATUS;
  size?: number;
  torhash?: string;
  filename?: string;
  tree?: object | null;
};

export class NotFoundException extends Error {
  constructor(m: string) {
    super(m);
  }
}

export class TorService {
  protected repo = () => getRepository(MagnetRequests);

  constructor(
    private logger: winston.Logger,
    private job?: SandboxedJob<WorkerData>,
  ) {}

  private getCollection() {
    return firestore.collection("torrent");
  }

  private getRef() {
    return realtime.ref("torrent");
  }

  getHash() {
    return randomUUID();
  }

  save(hash: string, data: object) {
    const doc = this.getCollection().doc(hash);

    return doc.set(data);
  }

  async updateInprogressInDb(hash: string) {
    await this.repo().update({ id: hash }, { status: STATUS.IN_PROGRESS });
  }

  async update(hash: string, data: IUpdateData) {
    const doc = this.getCollection().doc(hash);

    // in progress

    // failed
    if (data.status === STATUS.FAILED) {
      await Promise.all([
        this.job
          ? Webhook.send(
              this.job.data.hash,
              STATUS.FAILED,
              data.message || "Job has failed",
            )
          : undefined,
        this.repo().update(
          { id: hash },
          { status: STATUS.FAILED, message: data.message },
        ),
      ]);
    }

    if (data.status === STATUS.TIMEDOUT) {
      await Promise.all([
        this.job
          ? Webhook.send(
              this.job.data.hash,
              STATUS.TIMEDOUT,
              data.message || "job has been timedout",
            )
          : undefined,
        this.repo().update(
          { id: hash },
          { status: STATUS.TIMEDOUT, message: data.message },
        ),
      ]);
    }

    if (data.status === STATUS.COMPLETED) {
      await Promise.all([
        this.job
          ? Webhook.send(
              this.job.data.hash,
              STATUS.COMPLETED,
              data.message || "job has been completed",
            )
          : undefined,
        this.repo().update(
          { id: hash },
          {
            status: STATUS.COMPLETED,
            message: data.message || "",
            tree: { ...data.tree },
            size: data.size,
          },
        ),
      ]);
    }
    // completed

    return doc.update(data);
  }

  find(hash: string) {
    const doc = this.getCollection().doc(hash);
    return doc.get();
  }

  deleteProgress(hash: string) {
    return this.getRef().child(hash).remove();
  }

  getPresignUrl(path: string) {
    return S3Util.createPresignUrl(path);
  }

  progress(
    hash: string,
    data: {
      progress?: number;
      downloadSpeed?: number;
      filesize?: number /* should be in bytes */;
    },
  ) {
    const ref = this.getRef().child(hash);
    return ref.set(data);
  }

  getProgress(hash: string) {
    return this.getRef().child(hash).get();
  }

  async saveMagnetData(url: string, id: string) {
    this.logger.debug(`processing the magnet url=${url}`);
    const parse = magnetDecode(url);
    const name = parse.name;
    // encode it base64
    const hash = id;
    this.logger.debug(`encoded to the hash=${hash}`);

    await Promise.allSettled([
      this.save(hash, {
        url,
        status: STATUS.IN_PROGRESS,
        filename: name || url,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
      this.progress(hash, { progress: 0 }),
    ]);

    this.logger.info(`updated the database.`);
  }

  async getInfo(id: string) {
    const data = await this.find(id);
    if (data.exists) {
      return data.data();
    }
    throw new NotFoundException(`id=${id} not found in the database.`);
  }

  async createFirebaseToken(hash: string) {
    const find = await this.find(hash);

    if (!find.exists) {
      throw new NotFoundException(`hash is invalid`);
    }

    return admin
      .auth(app)
      .createCustomToken(randomUUID(), { hash })
      .then((tok) => {
        return tok;
      })
      .catch((error) => {
        this.logger.log(error, "Error creating FB custom token:");
        return "";
      });
  }
}
