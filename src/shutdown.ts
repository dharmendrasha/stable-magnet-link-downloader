import { logger } from './utils/logger';
import { IncomingMessage, Server, ServerResponse } from 'http';

// @to-do: docker kill --signal="SIGHUP" [id] is not working
// enabled npm loglevel verbosity
export function ShutdownEvent(server: Server<typeof IncomingMessage, typeof ServerResponse>){
    const events = ["SIGTERM", "SIGINT", "SIGHUP"]
    for (const event of events){
        process.on(event, () => {
            logger.info(`${event} signal received`)
            logger.info(`'closing application and database'`)
            server.close((err) => {
                if(err){
                    logger.info(`'shutdown failed'`)
                    logger.error(err)
                    process.exit(1)
                }

                logger.info(`'application closed successfully.'`)
                process.exit(0)
            })
        })
    }
}