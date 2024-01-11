import correlator from 'express-correlation-id';
import winston from 'winston'

const alignColorsAndTime = winston.format.combine(
    winston.format.colorize({
        all:true
    }),
    winston.format.label({
        label: correlator?.getId() || '[SMLD]'
    }),
    winston.format.timestamp({
        format:"YY-MM-DD HH:mm:ss"
    }),
    winston.format.printf(
        info => ` ${correlator?.getId() || '[no-id]'} ${info['label']}  ${info['timestamp']}  ${info.level} : ${info.message}`
    )
);

const logger = winston.createLogger({
    level: 'debug',
    transports: [
        new (winston.transports.Console)({
            format: winston.format.combine(winston.format.colorize(), alignColorsAndTime)
        })
    ],
  });

export { logger }