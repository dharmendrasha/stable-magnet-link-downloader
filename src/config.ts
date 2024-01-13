import { LoggerOptions } from 'typeorm'
const { env } = process


export const APPLICATION_PORT = Number(env['PORT'] || 3000)
export const DB_USER = env['DB_USER'] || 'admin'
export const DB_PASSWORD = env['DB_PASSWORD'] || 'pass'
export const DB_NAME = env['DB_NAME'] || 'magnet'
export const DB_HOST = env['DB_HOST'] || 'localhost'
export const DB_PORT = Number(env['DB_PORT'] || 5432)
export const DB_LOGGING = env['DB_LOGGING'] || 'error'

export const METADATA_FETCH_TIMEOUT = Number(env['METADATA_FETCH_TIMEOUT'] || 6000); // in ms



export const dbLogging = (): LoggerOptions => {
  
    const shouldDbLog = DB_LOGGING
  
    if (shouldDbLog == 'false' || shouldDbLog == 'true') {
      return shouldDbLog == 'true'
    }
  
    if (shouldDbLog === 'all') {
      return shouldDbLog
    }
  
    return shouldDbLog.split(',').map(v => v.trim()) as LoggerOptions
  }
  