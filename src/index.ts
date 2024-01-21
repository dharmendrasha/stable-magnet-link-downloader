import "reflect-metadata";
import { ShutdownEvent } from "./shutdown.js";
import { app } from "./app.js";
import { APPLICATION_PORT, getDownloadPath } from "./config.js";
import { createLoggerWithContext, logger } from "./utils/logger.js";
import appDatasource from "./typeorm.config.js";
import { optimalNumThreads } from "./utils/calculate-worker-threads.js";
import { redis } from "./utils/queue/bull.js";

process.on("uncaughtException", function (err) {
  const logger = createLoggerWithContext("uncaughtException");
  // Handle the error safely
  logger.error(err);
});

process.on("unhandledRejection", (reason, promise) => {
  const logger = createLoggerWithContext("unhandledRejection");

  // Handle the error safely
  logger.error({ reason, promise });
});

appDatasource
  .initialize()
  .then(async () => {
    logger.info(`connected to the database`);

    logger.info(`download path ${getDownloadPath()}`);

    logger.info(`Optimal number of worker threads: ${optimalNumThreads}`);

    logger.info(`redis connection status=${redis.status}`);

    if (redis.status !== "ready") {
      await redis.connect();
    }

    const server = app.listen(APPLICATION_PORT, "0.0.0.0", () => {
      logger.info(
        `application started visit = http://0.0.0.0:${APPLICATION_PORT}`,
      );
      logger.info(
        `For the UI, open http://0.0.0.0:${APPLICATION_PORT}/admin/queues`,
      );
    });

    ShutdownEvent(server);
  })
  .catch((e) => {
    logger.error(`unable to connect with the database`, e);

    process.exit(1);
  });
