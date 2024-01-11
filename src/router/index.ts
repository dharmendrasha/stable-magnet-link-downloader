import { Router } from "express";
import { expressRouter } from "../modules/router.combine";
const mainExprouter = Router()

mainExprouter.use(expressRouter)

export { mainExprouter }