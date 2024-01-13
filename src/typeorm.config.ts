import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, dbLogging } from './config'
import { DataSource, DataSourceOptions } from 'typeorm'
import * as path from 'path'
import { DBLogger } from './utils/db-logger'
import { entities } from './entity'

export const datasourceConfig: DataSourceOptions = {
    type: 'postgres',
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    entities: entities,
    synchronize: false,
    migrations: [path.join('migration/*.ts')],
    logNotifications: true,
    installExtensions: true,
    logging: dbLogging(),
    logger: new DBLogger(dbLogging()),
}
  
export const pgString = `${datasourceConfig.type}://${datasourceConfig.username}:${datasourceConfig.password}@${datasourceConfig.host}:${datasourceConfig.port}/${datasourceConfig.database}`

export const appDatasource = new DataSource(datasourceConfig)

export default appDatasource