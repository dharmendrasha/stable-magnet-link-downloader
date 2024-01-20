import { getRepository } from "../../../utils/db.js";
import {
  JOB_DELAY,
  MAX_RETRY,
  RETRY_DELAY,
  RETRY_STARATEGY,
  TORRENT_TIMEOUT,
  WORKER_CONCURRENCY,
  WORKER_LIMIER,
} from "../../../config.js";
import { createLoggerWithContext } from "../../../utils/logger.js";
import { q, q_name, redis } from "../../../utils/queue/bull.js";
import { Worker } from "bullmq";
import { MagnetRequests } from "../../../entity/torrent.entity.js";

const workerLogger = createLoggerWithContext(q_name);

export type WorkerData = {
  data: string;
  contextId: string;
  id: string;
  job_id?: string;
};

export const worker = new Worker(
  q_name,
  new URL("./download.js", import.meta.url),
  {
    connection: redis,
    //Amount of jobs that a single worker is allowed to work on
    concurrency: WORKER_CONCURRENCY,
    useWorkerThreads: true,
    stalledInterval: TORRENT_TIMEOUT,
    autorun: false,
    limiter: {
      max: WORKER_LIMIER,
      duration: TORRENT_TIMEOUT,
    },
  },
);

worker
  .run()
  .then(() => {
    workerLogger.info(`woker is running`);
  })
  .catch((e) => {
    workerLogger.error(`worker could not run because`, e);
  });

export async function addJob(workerData: WorkerData) {
  const repo = getRepository(MagnetRequests);

  const job = await q.add(q_name, workerData, {
    attempts: MAX_RETRY,
    delay: JOB_DELAY, // delay for 1 sec
    backoff: {
      delay: RETRY_DELAY,
      type: RETRY_STARATEGY,
    },
  });
  await repo.update({ id: workerData.id }, { job_id: job.id });

  return job;
}
