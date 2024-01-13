import { Router } from "express";
import { expressRouter } from "../modules/router.combine.js";
const mainExprouter = Router()

mainExprouter.use(expressRouter)

export { mainExprouter }