import { isMainThread, parentPort } from "worker_threads";
import { createLoggerWithContext, logger } from "../../../utils/logger.js";
import correlator from "express-correlation-id";
import { MagnetQueue } from "../../../utils/torrent/start.js";
import { TorService } from "../../../utils/firebase/torrent.service.js";
import { WorkerData } from "./run.js";
import { SandboxedJob } from "bullmq";
import appDatasource from "../../../typeorm.config.js";

/*
 * this file should only be run in worker threads
 */
export default async function processTorrent(job: SandboxedJob) {
  if (isMainThread || !parentPort) {
    throw new Error(`this script should not be running in main threads`);
  }

  try {
    const data = job.data as WorkerData;

    await appDatasource.initialize();

    const logger = createLoggerWithContext(
      `worker:${data.contextId}:${data.id}` || correlator?.getId(),
    );

    logger.info(`sandbox_job=${job.id}`);

    const tor = new TorService(logger);
    await tor.saveMagnetData(data.data, data.id);

    const magnet = new MagnetQueue(tor, logger, job);
    const tree = await magnet.process({ url: data.data, hash: data.id });

    logger.info("processing is finished");
    return Promise.resolve(tree);
  } catch (e) {
    // parentPort.postMessage('error') // always sent one message when job is finished.
    logger.error(e);
    console.error(e);
    return Promise.reject(e);
  }
}
