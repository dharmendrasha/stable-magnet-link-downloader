import { worker } from "./modules/torrent/worker/run.js";
import { logger } from "./utils/logger.js";
import { IncomingMessage, Server, ServerResponse } from "http";
import { redis } from "./utils/queue/bull.js";

// @to-do: docker kill --signal="SIGHUP" [id] is not working
// enabled npm loglevel verbosity
export function ShutdownEvent(
  server: Server<typeof IncomingMessage, typeof ServerResponse>,
) {
  const events = ["SIGTERM", "SIGINT", "SIGHUP"];
  for (const event of events) {
    process.on(event, () => {
      logger.info(`${event} signal received`);
      worker
        .close()
        .then(() => {
          logger.info(`woker is closed`);
          logger.info(`closing application and database`);
          redis.disconnect();
          server.close((err) => {
            if (err) {
              logger.info(`shutdown failed`);
              logger.error(err);
              process.exit(-1);
            }

            logger.info(`application closed successfully.`);
            process.exit(0);
          });
        })
        .catch((e) => {
          logger.error(`couldnot closed worker due to `, e);
          process.exit(-1);
        });
    });
  }
}
