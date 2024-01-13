import { Router } from "express";
import { router as mainRouter } from "./main/router";
import { router as torrentRouter } from "./torrent/route";

const expressRouter = Router()

expressRouter.use(mainRouter)
expressRouter.use(torrentRouter)

export { expressRouter }