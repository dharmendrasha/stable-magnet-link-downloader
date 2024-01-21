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
import { Worker, Job } from "bullmq";
import { MagnetRequests, STATUS } from "../../../entity/torrent.entity.js";

const workerLogger = createLoggerWithContext(q_name);

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
  await repo.update(
    { id: workerData.id },
    { job_id: job.id, status: STATUS.IN_QUEUE },
  );

  return job;
}

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
    autorun: true,
    limiter: {
      max: WORKER_LIMIER,
      duration: TORRENT_TIMEOUT,
    },
  },
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eventsType: any[] = [
  "active",
  "closed",
  "closing",
  "completed",
  "drained",
  "error",
  "failed",
  "paused",
  "progress",
  "ready",
  "resumed",
  "stalled",
];

for (const event of eventsType) {
  worker.on(event, (j: Job<WorkerData>) => {
    const data = j?.data;

    console.log(data);

    console.log(j);

    workerLogger.info(`got the event=${event}`);
  });
}
