import { Request, Response } from "express";
import TorrentSearchApis from "torrent-search-api";

export async function getProviders(_: Request, res: Response) {
  const data = TorrentSearchApis.getProviders();
  res.jsonp({ data, message: "These are providers we use to search urls" });
}
