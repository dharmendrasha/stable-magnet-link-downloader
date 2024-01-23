import { Request, Response } from "express";
import { defaultProviders } from "../../lib/search/providers/index.js";
import { search } from "../../lib/search/index.js";
import { z } from "zod";

const query = z.object({
  q: z.string(),
  catagory: z.string().optional(),
});

export const schema = z.object({
  query,
});

export async function Search(req: Request, res: Response) {
  const request = req.query as z.infer<typeof query>;
  const q = request.q;

  const find = await search(defaultProviders, q, {
    category: request.catagory,
  });

  res.json({ data: find, message: "torrent found" });
}
