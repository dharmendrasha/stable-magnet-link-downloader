import { Request, Response } from "express";
import { torClient } from "../../utils/torrent/webtorrent.js";
import { Torrent, TorrentFile } from "webtorrent";
import { METADATA_FETCH_TIMEOUT, getDownloadPath } from "../../config.js";
import { logger } from "../../utils/logger.js";
import { getRepository } from "../../utils/db.js";
import { MagnetRequests, STATUS } from "../../entity/index.js";

export interface TorrentInfo {
  name: string;
  size: number;
  infoHash: string;
  magnetURI: string;
  peers: number;
  created: Date;
  createdBy: string;
  comment: string;
  announce: string[];
  files: {
    name: string;
    size: number;
    path: string;
  }[];
}

export const getTotalFileSize = (torrent: TorrentFile[]) => {
  let totalSize = 0;
  for (let index = 0; index < torrent.length; index++) {
    const element = torrent[index];
    totalSize = totalSize + element.length;
  }

  return totalSize;
};

export const constructData = (torrent: Torrent): TorrentInfo => {
  const data = {
    name: torrent.name || "no name",
    infoHash: torrent.infoHash.toLowerCase(),
    magnetURI: torrent.magnetURI,
    peers: torrent.numPeers,
    created: torrent.created,
    createdBy: torrent.createdBy,
    comment: torrent.comment,
    announce: torrent.announce,
    size: getTotalFileSize(torrent.files),
    files: torrent.files.map((file) => ({
      name: file.name,
      size: file.length,
      path: file.path,
    })),
  };

  return data;
};

export async function getById(id: string) {
  const repo = getRepository(MagnetRequests);
  const available = await repo.findOne({ where: { id } });
  return available;
}

export async function ifExists(hash: string) {
  hash = hash.toLowerCase();
  const repo = getRepository(MagnetRequests);
  const available = await repo.findOne({ where: { hash } });
  return available;
}

export async function saveToTheDatabase(
  info: TorrentInfo,
  status?: STATUS,
  message?: string,
) {
  const repo = getRepository(MagnetRequests);
  const data = {
    link: info.magnetURI,
    name: info.name,
    size: info.size,
    info: info,
    hash: info.infoHash.toLowerCase(),
    status,
    message,
  };
  const created = repo.create(data);

  //check
  const check = await repo.findOne({ where: { hash: created.hash } });
  if (check) {
    //update

    await repo.update({ id: check.id }, data);
    return { ...check, ...data };
  }

  const saved = await repo.save(created);
  return saved;
}

export async function GetMetaDataOfTorrent(parsedTorrent: ParsedTorrent) {
  return new Promise((res, rej) => {
    const torrent = torClient().add(parsedTorrent, {
      destroyStoreOnDestroy: true,
      path: getDownloadPath() + "/tmp",
    });

    // If the torrent doesn't have enough peers to retrieve metadata, return
    // limited info we get from parsing the magnet URI (the parsed metadata is guaranteed
    // to have `infoHash` field)
    const timeoutID = setTimeout(async () => {
      const copyTorrent = constructData(torrent);

      torClient().remove(torrent, {}, () => {
        logger.info("Timeout while fetching torrent metadata.");
      });

      saveToTheDatabase(copyTorrent, STATUS.TIMEDOUT, "acceptance timed out")
        .then(() => {
          rej({
            data: copyTorrent,
            message:
              "The torrent provided doesn't seem to have enough peers to fetch metadata. Returning limited info.",
          });
        })
        .catch((e) => {
          logger.error(e);
          rej({
            data: copyTorrent,
            message:
              "The torrent provided doesn't seem to have enough peers to fetch metadata. Returning limited info.",
          });
        });
    }, METADATA_FETCH_TIMEOUT);

    torrent.on("metadata", () => {
      logger.info(`Metadata parsed for hash=${torrent.infoHash}`);
      clearTimeout(timeoutID);
      const info = constructData(torrent);

      //submit info into the database
      saveToTheDatabase(
        info,
        STATUS.NOTED,
        "noted and can start downloading request",
      )
        .then((val) => {
          torClient().remove(torrent, {}, () => {
            logger.info("Torrent removed.");
          });
          res({
            data: val,
            message:
              "torrent is correct and successfully parsed. Please try start command if you want to download it",
          });
        })
        .catch((e) => {
          logger.error(e);
          rej({
            data: null,
            message:
              "something unwanted happen please try again or contact administrator.",
          });
        });
    });
  });
}

/**
 * this function should accept  magnet url
 */

export async function AcceptTorrent(req: Request, res: Response) {
  const parsedTorrent = req.parsedTorrent;

  const hash = parsedTorrent["infoHash"];

  const alreadyDone = await ifExists(hash);

  if (alreadyDone) {
    res.status(303).jsonp({
      message: `this request has already processed by us please try another and its status=${alreadyDone.status}`,
      data: alreadyDone,
    });
    return;
  }

  GetMetaDataOfTorrent(parsedTorrent)
    .then((val) => {
      res.jsonp(val);
    })
    .catch((val) => {
      res.status(504).jsonp({ ...val, data: null });
    });
}
