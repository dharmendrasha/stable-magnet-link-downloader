import correlator from 'express-correlation-id';
import winston from 'winston'

export function createLoggerWithContext(context?: string){
    const alignColorsAndTime = winston.format.combine(
        winston.format.colorize({
            all:true
        }),
        winston.format.label({
            label: context || correlator?.getId() || '[SMLD]'
        }),
        winston.format.timestamp({
            format:"YY-MM-DD HH:mm:ss"
        }),
        winston.format.printf(
            info => `${correlator?.getId() || ''} ${info['label']}  ${info['timestamp']}  ${info.level} : ${info.message}`.trim()
        )
    );
    
    const cLog = winston.createLogger({
        level: 'debug',
        transports: [
            new (winston.transports.Console)({
                format: winston.format.combine(winston.format.colorize(), alignColorsAndTime)
            })
        ],
      });

      return cLog
}

export const logger = createLoggerWithContext()
