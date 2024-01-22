import { Queue } from "bullmq";
import {
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT,
  REDIS_USER,
} from "../../config.js";
import IoRedis from "ioredis";

export const redis = new IoRedis(REDIS_PORT, REDIS_HOST, {
  password: REDIS_PASSWORD || undefined,
  username: REDIS_USER || undefined,
  maxRetriesPerRequest: null,
  enableOfflineQueue: false, //Failing fast when Redis is down
});

export const q_name = "torrent_download";

export const q = new Queue(q_name, {
  connection: redis,
});
