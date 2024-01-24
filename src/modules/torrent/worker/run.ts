import wtfNode from "wtfnode";
wtfNode.init();
import {
  MAX_RETRY,
  RETRY_DELAY,
  RETRY_STARATEGY,
  // TORRENT_TIMEOUT,
  // WORKER_CONCURRENCY,
  // WORKER_LIMIER,
} from "../../../config.js";
import { createLoggerWithContext } from "../../../utils/logger.js";
import { q, q_name, redis } from "../../../utils/queue/bull.js";
import { Worker, Job } from "bullmq";
import { MagnetRequests, STATUS } from "../../../entity/torrent.entity.js";
import { getRepository } from "../../../utils/db.js";
import { optimalNumThreads } from "../../../utils/calculate-worker-threads.js";

const workerLogger = createLoggerWithContext(q_name);

const repo = () => getRepository(MagnetRequests);

export async function addJob(workerData: WorkerData) {
  const job = await q.add(q_name, workerData, {
    attempts: MAX_RETRY,
    delay: 1, // delay for 1 sec
    backoff: {
      delay: RETRY_DELAY,
      type: RETRY_STARATEGY,
    },
  });
  await repo().update(
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
    concurrency: optimalNumThreads,
    useWorkerThreads: true,
    connection: redis,
    autorun: false,
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
  worker.on(event, async (j: Job<WorkerData>, err?: Error) => {
    const id = j?.id;

    if (event === "progress") {
      return;
    }
    workerLogger.info(`${event}: got the event=${event} id=${id}`);

    // update the db if paused

    if (event === "paused") {
      const data = j?.data;
      if (!data) {
        workerLogger.error(`paused: no data found`);
        return;
      }
      const id = data.id;
      await repo().update({ id }, { status: STATUS.PAUSED });
    }

    if (event === "completed") {
      const data = j?.data;
      if (!data) {
        workerLogger.error(`completed: no data found`);
        return;
      }
    }

    if (event === "failed") {
      const data = j?.data;
      if (!data) {
        workerLogger.error(`failed: no data found`);
        return;
      }
      const id = data.id;
      await repo().update(
        { id },
        { status: STATUS.FAILED, message: err?.message },
      );
    }
  });
}
