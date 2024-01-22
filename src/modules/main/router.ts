import { Router } from "express";
import { Ping } from "./ping.js";

const router = Router();

router.get("/", (_, res) => res.send("invalid routes"));
router.get("/health", (_, res) => res.send("healthy"));
router.get("/ping", Ping);

export { router };
