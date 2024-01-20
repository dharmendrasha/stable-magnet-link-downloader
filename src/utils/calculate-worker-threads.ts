import * as os from "os";

export const AVAILABLE_CPUS = os.cpus().length;

export const threadMultiplier = 1.5; //avg max 2, min 1

export const optimalNumThreads = Math.ceil(AVAILABLE_CPUS * threadMultiplier);
