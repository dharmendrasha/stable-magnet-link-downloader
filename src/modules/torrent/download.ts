import { Request, Response } from "express";
import { z } from "zod";
import { GetMetaDataOfTorrent, ifExists } from "./accept.js";
import { STATUS } from "../../entity/torrent.entity.js";
import correlator from "express-correlation-id";
import { addJob } from "./worker/run.js";

export const body = z.object({
  hash: z.string(),
});

export const schema = z.object({
  body,
});

export async function downloadTorrent(req: Request, res: Response) {
  const bdy = req.body as z.infer<typeof body>;

  if (!correlator.getId()) {
    throw new Error(`no correlator.getId() found`);
  }

  // check in the database
  const available = await ifExists(bdy.hash);

  if (!available) {
    return res.status(404).jsonp({ body: null, message: "hash not found" });
  }

  //reverify it
  await GetMetaDataOfTorrent(available.link).catch(() => {
    return res.status(405).jsonp({
      body: null,
      message: "link seems to be expired or no peers left to download",
    });
  });

  if (![STATUS.NOTED, STATUS.PAUSED].includes(available.status)) {
    return res.status(406).jsonp({
      body: null,
      message: `file cannot be downloaded because its already been ${available.status.toLocaleLowerCase()}`,
    });
  }

  await addJob({
    data: available.link,
    contextId: `req:${correlator?.getId()}`,
    id: available.id,
  });

  return res.jsonp(bdy);
}
