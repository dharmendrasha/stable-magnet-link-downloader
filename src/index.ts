import "reflect-metadata";
import { ShutdownEvent } from "./shutdown.js";
import { app } from "./app.js";
import { APPLICATION_PORT } from "./config.js";
import { logger } from "./utils/logger.js";
import appDatasource from './typeorm.config.js';

appDatasource.initialize().then(() => {
    logger.info(`connected to the database`)
    const server = app.listen(APPLICATION_PORT, '0.0.0.0', () => {
        return logger.info(`application started for the port ${APPLICATION_PORT} visit = http://0.0.0.0:${APPLICATION_PORT}`);
    })
    ShutdownEvent(server)
}).catch(e => {
    logger.error(`unable to connect with the database`, e)
    process.exit(1)
})
