export * from "./thepiratebay.js";
export * from "./1337x.js";
export * from "./nyaa.js";

import { ThePirateBayProvider } from "./thepiratebay.js";
import { X1337Provider } from "./1337x.js";
import { NyaaProvider } from "./nyaa.js";
import { isInBrowser } from "../services/utils.js";

export const defaultProviders = [
  new ThePirateBayProvider(),
  new NyaaProvider(),
  // These providers does not work in the browser
  ...(!isInBrowser ? [new X1337Provider()] : []),
];
