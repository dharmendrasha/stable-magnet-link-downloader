import { NextFunction, Request, Response } from "express";
import { ADMIN_PASS, ADMIN_USER } from "../config.js";

export function BasicAuth(req: Request, res: Response, next: NextFunction) {
  // -----------------------------------------------------------------------
  // authentication middleware

  const auth = { user: ADMIN_USER, password: ADMIN_PASS }; // change this

  // parse login and password from headers
  const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
  const [user, password] = Buffer.from(b64auth, "base64").toString().split(":");

  // Verify login and password are set and correct
  if (user && password && user === auth.user && password === auth.password) {
    // Access granted...
    return next();
  }

  // Access denied...
  res.set("WWW-Authenticate", 'Basic realm="401"'); // change this
  res.status(401).send("Authentication required."); // custom message
}
