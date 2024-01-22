import { Router } from "express";
import { AcceptTorrent } from "./accept.js";
import multer from "multer";
import { isValidTorrentData } from "./middleware.js";
import { validate } from "../../utils/validate.js";
import { downloadTorrent, schema } from "./download.js";
import { Info, schema as hashSchema } from "./info.js";
const upload = multer();

const router = Router();

router.post(
  "/v1/accept",
  upload.single("torrent_file"),
  isValidTorrentData,
  AcceptTorrent,
);
router.post("/v1/download", validate(schema), downloadTorrent);
router.get("/v1/info/:hash", validate(hashSchema), Info);

export { router };
