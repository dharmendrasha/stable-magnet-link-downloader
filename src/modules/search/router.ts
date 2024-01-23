import { Router } from "express";
import { Search, schema } from "./search.js";
import { validate } from "../../utils/validate.js";
import { getProviders } from "./providers.js";

const router = Router();

router.get("/v1/search", validate(schema), Search);
router.get("/v1/providers", getProviders);

export { router };
