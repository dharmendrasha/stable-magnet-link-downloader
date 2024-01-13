import { Router } from "express";
import { AcceptTorrent } from "./accept";
import multer from "multer";
import { isValidTorrentData } from "./middleware";
const upload = multer();

const router = Router()

router.post('/v1/accept', upload.single("torrent_file"), isValidTorrentData, AcceptTorrent)


export { router }