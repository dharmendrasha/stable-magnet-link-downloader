import { BackoffOptions } from "bullmq";
import { LoggerOptions } from "typeorm";
const { env } = process;

export const NODE_ENV = env["NODE_ENV"] || "dev";
export const LOG_WITH_COLOR = env["LOG_WITH_COLOR"] === "true";
export const LOG_LEVEL = env["LOG_LEVEL"] || "silly";
export const APPLICATION_PORT = Number(env["PORT"] || 3000);
export const DB_USER = env["DB_USER"] || "admin";
export const DB_PASSWORD = env["DB_PASSWORD"] || "pass";
export const DB_NAME = env["DB_NAME"] || "magnet";
export const DB_HOST = env["DB_HOST"] || "localhost";
export const DB_PORT = Number(env["DB_PORT"] || 5432);
export const DB_LOGGING = env["DB_LOGGING"] || "error";
export const METADATA_FETCH_TIMEOUT = Number(
  env["METADATA_FETCH_TIMEOUT"] || 6000,
); // in ms

export const TORRENT_TIMEOUT = Number(
  env["TORRENT_TIMEOUT"] || 86400000 /* one day */,
);

export const ADMIN_USER = env["ADMIN_USER"] || "user";
export const ADMIN_PASS = env["ADMIN_PASS"] || "pass";

export const REDIS_HOST = env["REDIS_HOST"] || "localhost";
export const REDIS_PORT = Number(env["REDIS_PORT"] || "6379");
export const REDIS_PASSWORD = env["REDIS_PASSWORD"] || undefined;
export const REDIS_USER = env["REDIS_USER"] || undefined;

export const dbLogging = (): LoggerOptions => {
  const shouldDbLog = DB_LOGGING;

  if (shouldDbLog == "false" || shouldDbLog == "true") {
    return shouldDbLog == "true";
  }

  if (shouldDbLog === "all") {
    return shouldDbLog;
  }

  return shouldDbLog.split(",").map((v) => v.trim()) as LoggerOptions;
};

export const getDownloadPath = () => {
  const dnldPath = env["DOWNLOAD_PATH"] || `${process.cwd()}/.downloads`;
  return dnldPath;
};

// Firebase
export const FIREBASE_FILE =
  env["FIREBASE_ADMIN_FILE"] || `${process.cwd()}/.firebase.json`;

export const FIREBASE_REALTIME = env["FIREBASE_REALTIME"];

//AWS
export const AWS_REGION = env["AWS_REGION"] || "ap-south-1";
export const AWS_ACCESS_ID = env["AWS_ACCESS_ID"] || "";
export const AWS_ACCESS_SECRET = env["AWS_ACCESS_SECRET"] || "";
export const AWS_BUCKET = env["AWS_BUCKET"] || "";

export const MAGNET_DOWNLOAD_PROCESS = "MAGNET_DOWNLOAD_PROCESS";

export const MAX_RETRY = Number(env["MAX_RETRY"] || 3);
export const RETRY_DELAY = Number(env["RETRY_DELAY"] || 1000); // milliseconds

export const RETRY_STARATEGY = String(
  env["RETRY_STARATEGY"] || "exponential",
) as BackoffOptions["type"];

export const JOB_DELAY = Number(env["JOB_DELAY"] || 1000);

export const WORKER_CONCURRENCY = Number(env["WORKER_CONCURRENCY"] || 1);

export const WORKER_LIMIER = Number(env["WORKER_LIMIER"] || 1);
