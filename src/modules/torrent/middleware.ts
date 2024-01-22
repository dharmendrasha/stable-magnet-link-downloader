import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import parseTorrent from "parse-torrent";
import { logger } from "../../utils/logger.js";

export const isValidTorrentData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    logger.info("Validating torrent query...");

    const hashOrURIQuery = req.body.query as string;
    const torrentFileQuery = req.file;

    if (!hashOrURIQuery && !torrentFileQuery) {
      res
        .status(400)
        .json({
          error:
            "Expected info hash, magnet URI or .torrent file, instead got nothing.",
        })
        .end();
      return;
    }

    if (hashOrURIQuery) {
      try {
        logger.info("Parsing hash or URI...");
        req.parsedTorrent = await parseTorrent(hashOrURIQuery);
      } catch (err) {
        logger.info(err);
        res
          .status(400)
          .json({
            error: "Invalid info hash or magnet URI.",
            query: hashOrURIQuery,
          })
          .end();
        return;
      }
    }

    if (torrentFileQuery) {
      try {
        logger.info("Parsing torrent file...");
        req.parsedTorrent = await parseTorrent(torrentFileQuery.buffer);
      } catch (err) {
        logger.info(err);
        if (typeof res.status === "function") {
          res
            .status(400)
            .json({
              error: "Torrent file is invalid.",
              query: torrentFileQuery.originalname,
            })
            .end();
          return;
        }

        res
          .jsonp({
            error: "Torrent file is invalid.",
            query: torrentFileQuery.originalname,
          })
          .end();

        return;
      }
    }

    logger.info("Validated torrent query.");
    next();
  } catch (e) {
    if (e instanceof Error) {
      logger.error(e.message, e.stack);
    } else {
      logger.error(`un handled error occured ${e}`);
    }

    res.status(500).json({
      error: "unidentified error.",
      query: null,
    });

    return;
  }
};

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  logger.error(
    `Error occurred while processing request ${err.message}`,
    err.stack,
  );
  res.status(500).json({ error: "Server error." });
};
