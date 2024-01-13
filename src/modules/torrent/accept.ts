import { Request, Response } from "express";
import { torClient } from "../../utils/torrent/webtorrent.js";
import { Torrent } from "webtorrent";
import { METADATA_FETCH_TIMEOUT } from "../../config.js";
import { logger } from "../../utils/logger.js";
import { getRepository } from "../../utils/db.js";
import { MagnetRequests } from "../../entity/index.js";

export interface TorrentInfo{
    name: string;
      infoHash: string;
      magnetURI: string;
      peers: number
      created: Date
      createdBy: string
      comment: string
      announce: string[]
      files: {
        name: string
        size: number
        path: string
      }[],
}

export const constructData = (torrent: Torrent) :TorrentInfo => {
    const data = {
      name: torrent.name,
      infoHash: torrent.infoHash,
      magnetURI: torrent.magnetURI,
      peers: torrent.numPeers,
      created: torrent.created,
      createdBy: torrent.createdBy,
      comment: torrent.comment,
      announce: torrent.announce,
      files: torrent.files.map((file) => ({
        name: file.name,
        size: file.length,
        path: file.path,
      })),
    };
  
    return data;
  };


  export async function ifExists(info: TorrentInfo){
    const repo = getRepository(MagnetRequests)
    const available = await repo.findOne({where: {hash: info.infoHash}})
    return available
  }
  

export async function saveToTheDatabase(info: TorrentInfo){

    const repo = getRepository(MagnetRequests)
    const created = repo.create({
        link: info.magnetURI,
        name: info.name,
        size: -1,
        info: info,
        hash: info.infoHash
    })

    return repo.upsert(created, {
      conflictPaths: ['hash']
    })
}

/**
 * this function should accept  magnet url
 */

export async function AcceptTorrent(req: Request, res: Response){

    const parsedTorrent = req.parsedTorrent;

    const torrent = torClient().add(parsedTorrent, {
        destroyStoreOnDestroy: true,
    });

  // If the torrent doesn't have enough peers to retrieve metadata, return
  // limited info we get from parsing the magnet URI (the parsed metadata is guaranteed
  // to have `infoHash` field)
  const timeoutID = setTimeout(async () => {
    res.status(504).json({
      data: constructData(torrent),
      message:
        "The torrent provided doesn't seem to have enough peers to fetch metadata. Returning limited info.",
    });

    torClient().remove(torrent, {}, () => {
      logger.info("Timeout while fetching torrent metadata.");
    });
  }, METADATA_FETCH_TIMEOUT);


  torrent.on("metadata", () => {
    logger.info("Metadata parsed...");
    clearTimeout(timeoutID);
    const info = constructData(torrent)

    //submit info into the database
    saveToTheDatabase(info).then(() => {
      res.json({ data: info });

      torClient().remove(torrent, {}, () => {
          logger.info("Torrent removed.");
      });
    }).catch((e) => {
      logger.error(e)
      res.status(504).json({
        data: constructData(torrent),
        message:
          "something unwanted happen please try again or contact administrator.",
      });
    })

   
  });

}