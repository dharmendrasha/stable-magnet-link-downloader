import wtfNode from "wtfnode";
wtfNode.init();
import "reflect-metadata";
import { app } from "./app.js";
import { APPLICATION_PORT, getDownloadPath } from "./config.js";
import { createLoggerWithContext, logger } from "./utils/logger.js";
import appDatasource from "./typeorm.config.js";
import { optimalNumThreads } from "./utils/calculate-worker-threads.js";
import { redis } from "./utils/queue/bull.js";
import gracefulShutdown from "http-graceful-shutdown";
import { worker } from "./modules/torrent/worker/run.js";
wtfNode.dump();

process.on("uncaughtException", function (err) {
  const logger = createLoggerWithContext("uncaughtException");
  // Handle the error safely
  console.log(err);
  logger.error(err);
});

process.on("unhandledRejection", (reason, promise) => {
  const logger = createLoggerWithContext("unhandledRejection");

  // Handle the error safely
  console.error(reason);
  logger.error({ reason, promise });
});

appDatasource
  .initialize()
  .then(async () => {
    logger.info(`connected to the database`);

    logger.info(`download path ${getDownloadPath()}`);

    logger.info(`Optimal number of worker threads: ${optimalNumThreads}`);

    logger.info(`redis connection status=${redis.status}`);

    const server = app.listen(APPLICATION_PORT, "0.0.0.0", () => {
      logger.info(
        `application started visit = http://0.0.0.0:${APPLICATION_PORT}`,
      );
      logger.info(
        `For the UI, open http://0.0.0.0:${APPLICATION_PORT}/admin/queues`,
      );
    });

    // ShutdownEvent(server);
    gracefulShutdown(server, {
      development: true,
      preShutdown: async (signal?: string) => {
        logger.info(`preShutdown: received signal ${signal}`);
      },
      onShutdown: async (sig?: string) => {
        logger.info(`onShutdown: received signal ${sig}`);
      },
      finally: () => {
        logger.info(`finally: application shutdown`);
      },
    });

    worker
      .run()
      .then(() => {
        logger.info(`worker: worker has started`);
      })
      .catch((e) => {
        logger.error(`worker: failed to start logger due to`, e);
      });
  })
  .catch((e) => {
    logger.error(`unable to connect with the database`, e);

    process.exit(1);
  });
