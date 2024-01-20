import { FIREBASE_FILE, FIREBASE_REALTIME } from "../../config.js";
import admin from "firebase-admin";

const serviceFile = FIREBASE_FILE;

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceFile),
  databaseURL: FIREBASE_REALTIME,
});

const firestore = app.firestore();
firestore.settings({ ignoreUndefinedProperties: true });
const realtime = app.database();

export { app, firestore, realtime, admin };
