import { Router } from "express";
import { router as mainRouter } from "./main/router.js";
import { router as torrentRouter } from "./torrent/route.js";

const expressRouter = Router();

expressRouter.use(mainRouter);
expressRouter.use(torrentRouter);

export { expressRouter };
