import { Request, Response } from "express";
import { z } from "zod";
import { ifExists } from "./accept.js";

export const schema = z.object({
  params: z.object({
    hash: z.string(),
  }),
});

export async function Info(req: Request, res: Response) {
  const hash = req.params.hash;

  if (!hash) {
    res.status(404).jsonp({
      message: "no id found",
      data: null,
    });
    return;
  }

  const available = await ifExists(hash);

  res.jsonp({ data: available, message: "found" });
}
