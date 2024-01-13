/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from 'typeorm/logger/Logger'
import { logger } from './logger.js'
import { PlatformTools } from 'typeorm/platform/PlatformTools.js'
import { LoggerOptions, QueryRunner } from 'typeorm'


export class DBLogger implements Logger {
  private logger = logger
  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------
  constructor(private options?: LoggerOptions) {
  }
  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------
  /**
   * Logs query and parameters used in it.
   */
  //@ts-ignore
  logQuery(
    query: string, parameters?: any[], _?: QueryRunner,
  ) {
    if (
      this.options === 'all' ||
      this.options === true ||
      (Array.isArray(this.options) && this.options.indexOf('query') !== -1)
    ) {
      const sql =
        query +
        (parameters && parameters.length
          ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
          : '')
      this.logger.debug(PlatformTools.highlightSql(sql), 'query')
    }
  }
  /**
   * Logs query that is failed.
   */
  //@ts-ignore
  logQueryError(
    error: string | Error, query: string, parameters?: any[], _?: QueryRunner
  ) {
    if (
      this.options === 'all' ||
      this.options === true ||
      (Array.isArray(this.options) && this.options.indexOf('error') !== -1)
    ) {
      const sql =
        query +
        (parameters && parameters.length
          ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
          : '')
      this.logger.error('query: ' + sql)
      this.logger.error(`error:`, error)
    }
  }
  /**
   * Logs query that is slow.
   */
  //@ts-ignore
  logQuerySlow(
    time: number, query: string, parameters?: any[], _?: QueryRunner
  ) {
    const sql =
      query +
      (parameters && parameters.length
        ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
        : '')
    this.logger.warn(PlatformTools.highlightSql(sql), `query is slow:`)
    this.logger.warn(String(time), `execution time:`)
  }
  /**
   * Logs events from the schema build process.
   */
  //@ts-ignore
  logSchemaBuild(message: string, queryRunner: QueryRunner) {
    if (
      this.options === 'all' ||
      (Array.isArray(this.options) && this.options.indexOf('schema') !== -1)
    ) {
      this.logger.info(message)
    }
  }
  /**
   * Logs events from the migration run process.
   */
  logMigration(message: string, _: QueryRunner) {
    this.logger.info(message)
  }
  /**
   * Perform logging using given logger, or by default to the console.
   * Log has its own level and message.
   */
  log(
    level: 'log' | 'info' | 'warn',
    message: string,
    _: QueryRunner,
  ) {
    switch (level) {
      case 'log':
        if (
          this.options === 'all' ||
          (Array.isArray(this.options) && this.options.indexOf('log') !== -1)
        )
          this.logger.info(message)
        break
      case 'info':
        if (
          this.options === 'all' ||
          (Array.isArray(this.options) && this.options.indexOf('info') !== -1)
        )
          this.logger.debug(message, 'query_info')
        break
      case 'warn':
        if (
          this.options === 'all' ||
          (Array.isArray(this.options) && this.options.indexOf('warn') !== -1)
        )
          this.logger.warn(PlatformTools.warn(message))
        break
    }
  }
  // -------------------------------------------------------------------------
  // Protected Methods
  // -------------------------------------------------------------------------
  /**
   * Converts parameters to a string.
   * Sometimes parameters can have circular objects and therefore we are handle this case too.
   */
  stringifyParams(parameters: any) {
    try {
      return JSON.stringify(parameters)
    } catch (error) {
      // most probably circular objects in parameters
      return parameters
    }
  }
}
