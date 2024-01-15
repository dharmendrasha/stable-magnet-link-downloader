import { isMainThread, parentPort, workerData } from 'worker_threads'
import { createLoggerWithContext } from '../../../utils/logger.js'
import correlator from 'express-correlation-id'

/*
 * this file should only be run in worker threads 
 */
async function processTorrent(){

    if(isMainThread || !parentPort){
        throw new Error(`this script should not be running in main threads`)
    }

    const data = workerData as { data: string, contextId: string}

    const logger = createLoggerWithContext(`worker:${data.contextId}` || correlator?.getId())

    logger.info(data)

    // complete download the file
    
    parentPort.postMessage('finished') // always sent one message when job is finished.
    
}


processTorrent()
