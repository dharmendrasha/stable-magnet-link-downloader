import { Router } from "express";
import { validate } from "../../utils/validate";
import { AcceptTorrent, schema } from "./accept";

const router = Router()

router.post('/v1/accept', validate(schema), AcceptTorrent)


export { router }