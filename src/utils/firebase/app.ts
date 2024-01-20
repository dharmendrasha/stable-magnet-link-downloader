import { FIREBASE_FILE, FIREBASE_REALTIME } from "../../config.js";
import admin from "firebase-admin";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceFile = resolve(__dirname, "../../..", FIREBASE_FILE);

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceFile),
  databaseURL: FIREBASE_REALTIME,
});

const firestore = app.firestore();
firestore.settings({ ignoreUndefinedProperties: true });
const realtime = app.database();

export { app, firestore, realtime, admin };
