import { Worker } from 'node:worker_threads'
import PQueue from 'p-queue'
import { optimalNumThreads } from '../../../utils/calculate-worker-threads.js'
import { NODE_ENV } from '../../../config.js'

const queue = new PQueue({ concurrency: optimalNumThreads })

export function runWorker<T>(filenameWithoutExtension: URL, workerData?: unknown) {
  return queue.add(async () => {

    const worker =
        NODE_ENV === 'dev'
        ? new Worker(new URL(`${filenameWithoutExtension}.ts`), {
            workerData,
            execArgv: ['--import', 'tsx/esm']
          })
        : new Worker(new URL(`${filenameWithoutExtension}.js`), { workerData })

    const result = await new Promise<T>((resolve, reject) => {
      worker.on('message', resolve)
      worker.on('error', reject)
      worker.on('exit', code => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`))
        }
      })
    })

    return result
  })
}