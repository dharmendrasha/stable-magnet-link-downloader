import { Request, Response } from "express";
import { z } from "zod";
import { ifExists } from "./accept.js";
import { STATUS } from "../../entity/torrent.entity.js";
import { TorService } from "../../utils/firebase/torrent.service.js";
import { logger } from "../../utils/logger.js";

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

  const available = await ifExists(hash.toLowerCase());
  if (!available) {
    res.status(404).jsonp({
      message: "id do not exist",
      data: null,
    });
    return;
  }

  const torService = new TorService(logger);

  //get the current progress
  let progress = 0;

  if (available.status === STATUS.IN_PROGRESS) {
    // find it in the firebase
    const firebaseProgress = await (
      await torService.getProgress(available.id)
    ).val();
    if (!firebaseProgress) {
      progress = 0;
    } else {
      progress = Number(firebaseProgress["progress"]);
    }
  }

  if (available.status === STATUS.COMPLETED) {
    progress = 100;
  }

  res.jsonp({ data: { ...available, progress }, message: "found" });
}
