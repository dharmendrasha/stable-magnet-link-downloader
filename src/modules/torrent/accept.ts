import { Request, Response } from "express";
import { torClient } from "../../utils/torrent/webtorrent.js";
import { Torrent, TorrentFile } from "webtorrent";
import { METADATA_FETCH_TIMEOUT, getDownloadPath } from "../../config.js";
import { logger } from "../../utils/logger.js";
import { getRepository } from "../../utils/db.js";
import { MagnetRequests } from "../../entity/index.js";

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
    name: torrent.name,
    infoHash: torrent.infoHash,
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

export async function ifExists(hash: string) {
  const repo = getRepository(MagnetRequests);
  const available = await repo.findOne({ where: { hash } });
  return available;
}

export async function saveToTheDatabase(info: TorrentInfo) {
  const repo = getRepository(MagnetRequests);
  const created = repo.create({
    link: info.magnetURI,
    name: info.name,
    size: info.size,
    info: info,
    hash: info.infoHash,
  });

  return repo.upsert(created, {
    conflictPaths: ["hash"],
  });
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

      rej({
        data: copyTorrent,
        message:
          "The torrent provided doesn't seem to have enough peers to fetch metadata. Returning limited info.",
      });
    }, METADATA_FETCH_TIMEOUT);

    torrent.on("metadata", () => {
      logger.info(`Metadata parsed for hash=${torrent.infoHash}`);
      clearTimeout(timeoutID);
      const info = constructData(torrent);

      //submit info into the database
      saveToTheDatabase(info)
        .then(() => {
          torClient().remove(torrent, {}, () => {
            logger.info("Torrent removed.");
          });

          res({ data: info });
        })
        .catch((e) => {
          logger.error(e);
          rej({
            data: info,
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

  GetMetaDataOfTorrent(parsedTorrent)
    .then((val) => {
      res.jsonp(val);
    })
    .catch((val) => {
      res.status(504).jsonp(val);
    });
}
