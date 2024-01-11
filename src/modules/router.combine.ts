import { Router } from "express";
import { router } from "./main/router";

const expressRouter = Router()

expressRouter.use(router)
export { expressRouter }