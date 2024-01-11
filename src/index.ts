import { ShutdownEvent } from "./shutdown";
import { app } from "./app";
import { APPLICATION_PORT } from "./config";
import { logger } from "./utils/logger";

const server = app.listen(APPLICATION_PORT, '0.0.0.0', () => {
    return logger.info(`application started for the port ${APPLICATION_PORT} visit = http://0.0.0.0:${APPLICATION_PORT}`);
})


ShutdownEvent(server)