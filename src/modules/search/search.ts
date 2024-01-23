import { Request, Response } from "express";
import TorrentSearchApis from "torrent-search-api";
import { z } from "zod";

const query = z.object({
  q: z.string(),
  category: z.string(),
});

export const schema = z.object({
  query,
});

export async function Search(req: Request, res: Response) {
  const request = req.query as z.infer<typeof query>;
  const q = request.q;

  TorrentSearchApis.enableProvider("Yts");

  const search = TorrentSearchApis.search(q, request.category, 50);

  res.json(search);
}
