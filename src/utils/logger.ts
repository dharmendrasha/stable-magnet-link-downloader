import correlator from "express-correlation-id";
import winston from "winston";
import { LOG_LEVEL, LOG_WITH_COLOR } from "../config.js";

export function createLoggerWithContext(context?: string) {
  const colorize = LOG_WITH_COLOR
    ? winston.format.colorize({
        all: true,
      })
    : winston.format.uncolorize({ level: true, message: true, raw: true });

  const alignColorsAndTime = winston.format.combine(
    colorize,
    winston.format.label({
      label: context || correlator?.getId() || "[SMLD]",
    }),
    winston.format.timestamp({
      format: "YY-MM-DD HH:mm:ss",
    }),
    winston.format.printf((info) =>
      `${correlator?.getId() || ""} ${info["label"]} ${process.pid} ${info["timestamp"]}  ${info.level} : ${info.message}`.trim(),
    ),
  );

  const cLog = winston.createLogger({
    level: LOG_LEVEL,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          alignColorsAndTime,
          winston.format.errors({ stack: true }),
        ),
      }),
    ],
  });

  return cLog;
}

export const logger = createLoggerWithContext();
