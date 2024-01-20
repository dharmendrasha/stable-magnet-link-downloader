import Express from "express";
import correlator from "express-correlation-id";
import { RequestMiddleware } from "./utils/middleware/request.middleware.js";
import BodyParser from "body-parser";
import { mainExprouter } from "./router/index.js";
import { errorHandler } from "./modules/torrent/middleware.js";
import { serverAdapter } from "./utils/queue/board.js";
import { BasicAuth } from "./utils/basicAuth.js";

const app = Express();
app.use(correlator());
app.use(RequestMiddleware);
app.disable("x-powered-by");
// parse application/x-www-form-urlencoded
app.use(BodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(BodyParser.json());

app.use(mainExprouter);

app.use("/admin/queues", BasicAuth, serverAdapter.getRouter());

app.use(errorHandler);
export { app };
