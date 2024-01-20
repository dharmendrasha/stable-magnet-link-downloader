import { ErrorRequestHandler, RequestHandler } from "express";
import parseTorrent from "parse-torrent";
import { logger } from "../../utils/logger.js";

export const isValidTorrentData: RequestHandler = async (req, res, next) => {
  logger.info("Validating torrent query...");

  const hashOrURIQuery = req.body.query as string;
  const torrentFileQuery = req.file;

  if (!hashOrURIQuery && !torrentFileQuery) {
    return res.status(400).json({
      error:
        "Expected info hash, magnet URI or .torrent file, instead got nothing.",
    });
  }

  if (hashOrURIQuery) {
    try {
      logger.info("Parsing hash or URI...");
      req.parsedTorrent = await parseTorrent(hashOrURIQuery);
    } catch (err) {
      logger.info(err);
      return res.status(400).json({
        error: "Invalid info hash or magnet URI.",
        query: hashOrURIQuery,
      });
    }
  }

  if (torrentFileQuery) {
    try {
      logger.info("Parsing torrent file...");
      req.parsedTorrent = await parseTorrent(torrentFileQuery.buffer);
    } catch (err) {
      logger.info(err);
      return res.status(400).json({
        error: "Torrent file is invalid.",
        query: torrentFileQuery.originalname,
      });
    }
  }

  logger.info("Validated torrent query.");
  next();
};

export const errorHandler: ErrorRequestHandler = (err, _req, res) => {
  logger.error("Error occurred while processing request");
  console.error(err);
  res.status(500).json({ error: "Server error." });
};
