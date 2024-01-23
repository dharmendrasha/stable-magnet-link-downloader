import { Router } from "express";
import { router as mainRouter } from "./main/router.js";
import { router as torrentRouter } from "./torrent/route.js";
import { router as searchRouter } from "./search/router.js";

const expressRouter = Router();

expressRouter.use(mainRouter);
expressRouter.use(torrentRouter);
expressRouter.use(searchRouter);

export { expressRouter };
