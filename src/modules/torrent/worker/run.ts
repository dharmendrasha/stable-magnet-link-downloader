import { Worker } from 'node:worker_threads'
import PQueue from 'p-queue'
import { optimalNumThreads } from '../../../utils/calculate-worker-threads.js'
import { logger } from '../../../utils/logger.js'
import { TORRENT_TIMEOUT } from '../../../config.js'
import { q, q_name } from '../../../utils/queue/bull.js'
import { Job } from 'bull'

export type WorkerData = { data: string, contextId: string}


const queue = new PQueue({ concurrency: optimalNumThreads })

q.process(q_name, optimalNumThreads, (job: Job<{filenameWithoutExtension: string, workerData: WorkerData}>) => {
  const data = job.data
  queue.add(async () => {
    job.progress(0)
    const worker = new Worker(new URL(`${data.filenameWithoutExtension}.js`), { workerData:data.workerData })

    const result = await new Promise((resolve, reject) => {
      worker.on('message', (value) => {
        logger.info(`worker sent a message ${value}`)
        logger.info(`worker sent a message of type ${typeof value}`)
        job.progress(100)
        resolve(value)
      })
      worker.on('error', (er) => {
        logger.error(`worker throws an error`, er)
        reject(er)
      })
      worker.on('exit', code => {
        logger.warn('worker exited code ' + code)
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`))
        }
      })
    })

    return result
  }, {timeout: TORRENT_TIMEOUT, throwOnTimeout: true})
})


export function runWorker(filenameWithoutExtension: URL, workerData: WorkerData) {
  return q.add(q_name, {filenameWithoutExtension, workerData}, { timeout: TORRENT_TIMEOUT})
}