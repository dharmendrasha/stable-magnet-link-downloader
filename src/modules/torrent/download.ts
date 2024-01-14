import { Request, Response } from "express";
import { z } from 'zod'
import { GetMetaDataOfTorrent, ifExists } from "./accept.js";
import { STATUS } from "../../entity/torrent.entity.js";
import correlator from "express-correlation-id";
import { runWorker } from "./worker/run.js";

export const body = z.object({
    hash: z.string()
})

export const schema = z.object({
    body
})

export async function downloadTorrent(req: Request, res: Response){
    const bdy = req.body as z.infer<typeof body>

    // check in the database
    const available = await ifExists(bdy.hash)

    if(!available){
        return res.status(404).jsonp({body: null, message: 'hash not found'})
    }



    //reverify it
    await GetMetaDataOfTorrent(available.link).catch(() => {
        return res.status(405).jsonp({body: null, message: 'link seems to be expired or no peers left to download'})
    })

    if(![STATUS.NOTED, STATUS.PAUSED].includes(available.status)){
        return res.status(406).jsonp({body: null, message: `file cannot be downloaded because its already been ${available.status.toLocaleLowerCase()}`})
    }
    
    //https://github.com/piscinajs/piscina
    const result = await runWorker(
        new URL('./worker/download', import.meta.url),
        {
            data: available.link,
            contextId: correlator.getId()
        },
      )

      console.log(result)

    // start downloading the file
    // const worker = new Worker(resolve(__dirname, 'worker/download.js'), {
    //     workerData: {
    //         data: available.link,
    //         contextId: correlator.getId()
    //     }
    // })

    // worker.on('message', (val) => {
    //     logger.info(`got message from worker value = ${val}`);
    // })

    // worker.on('error', (err) => {
    //     logger.error(`received error from worker thread`, err)
    // })

    // worker.on('exit', (exitCode) => {
    //     logger.error(`worker has been exited by code `, exitCode)
    // })

    // worker.on('messageerror', (err) => {
    //     logger.error(`worker message error`, err)
    // })


    // worker.on('online', () => {
    //     logger.info(`worker is now online`)
    // })


    res.jsonp(bdy)
}
