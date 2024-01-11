import Express from "express";
import correlator from "express-correlation-id";
import { RequestMiddleware } from "./utils/middleware/request.middleware";
import BodyParser from "body-parser";
import { mainExprouter } from "./router";

const app = Express()
app.use(correlator())
app.use(RequestMiddleware)
app.disable('x-powered-by');
// parse application/x-www-form-urlencoded
app.use(BodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(BodyParser.json())

app.use(mainExprouter)



export { app }