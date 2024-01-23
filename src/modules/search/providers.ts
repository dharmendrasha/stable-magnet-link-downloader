import { Request, Response } from "express";
import { defaultProviders } from "../../lib/search/providers/index.js";

export async function getProviders(_: Request, res: Response) {
  const data = defaultProviders;
  res.jsonp({ data, message: "These are providers we use to search urls" });
}
