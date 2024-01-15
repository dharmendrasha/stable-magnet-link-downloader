import { LoggerOptions } from 'typeorm'
const { env } = process

export const NODE_ENV = env['NODE_ENV'] || 'dev'
export const APPLICATION_PORT = Number(env['PORT'] || 3000)
export const DB_USER = env['DB_USER'] || 'admin'
export const DB_PASSWORD = env['DB_PASSWORD'] || 'pass'
export const DB_NAME = env['DB_NAME'] || 'magnet'
export const DB_HOST = env['DB_HOST'] || 'localhost'
export const DB_PORT = Number(env['DB_PORT'] || 5432)
export const DB_LOGGING = env['DB_LOGGING'] || 'error'
export const METADATA_FETCH_TIMEOUT = Number(env['METADATA_FETCH_TIMEOUT'] || 6000); // in ms

export const TORRENT_TIMEOUT = Number(env['TORRENT_TIMEOUT'] || 86400000 /* one day */)

export const ADMIN_USER = env['ADMIN_USER'] || 'user'
export const ADMIN_PASS = env['ADMIN_PASS'] || 'pass'

export const REDIS_HOST = env['REDIS_HOST'] || 'localhost'
export const REDIS_PORT = Number(env['REDIS_PORT'] || '6379')
export const REDIS_PASSWORD = env['REDIS_PASSWORD'] || ''

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

export const getDownloadPath = () => {
  const dnldPath = env['DOWNLOAD_PATH'] || `${process.cwd()}/.downloads`
  return dnldPath
}


  