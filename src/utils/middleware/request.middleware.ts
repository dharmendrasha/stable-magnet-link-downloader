import { NextFunction, Request, Response } from "express";
import correlator from "express-correlation-id";
import RequestIp from "request-ip";
import { logger } from "../logger";
import { hostname } from "os";



function handleReponseFinish(res: Response, req: Request, perf: number) {
    const { method, originalUrl } = req
    const ip = RequestIp.getClientIp(req)
    const hName = hostname()
    const userAgent = req.get('user-agent') || ''
    const referer = req.get('referer') || ''
    const { statusCode } = res
    const contentLength = res.get('content-length') || 0
    const perfEnd = Number(performance.now() - perf).toFixed(3)

    logger.info(
      `[${hName}] method=${method} url='${originalUrl}' performance=${perfEnd}ms statusCode='${statusCode}'  contentLength='${contentLength}'  refer='${referer}' user_agenet='${userAgent}' ip='${ip}'`,
    )
  }


export function RequestMiddleware(req: Request, res: Response, next: NextFunction){
    const perf = performance.now()

    //put the request context
    res.setHeader(
      'x-correlator-id',
      correlator?.getId() || 'not-available',
    )


    res.on('finish', () => {
        handleReponseFinish(res, req, perf)
      })
      next()
  
}