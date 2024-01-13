import { z } from 'zod'
import { Request, Response } from "express";

export const BodySchema = z.object({
    magnet_url: z
    .string({required_error: 'magnet_url required it should be like this magnet:?xt=urn:btih:[file hash]'})
    .regex(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/i, 'magnet_url is invalid please paste the correct url. It should be like this magnet:?xt=urn:btih:[file hash]')
})

export const schema = z.object({
    body: BodySchema
})

/**
 * this function should accept  magnet url
 */

export async function AcceptTorrent(req: Request, res: Response){

    const body = req.body as z.infer<typeof BodySchema>
    // const parseMagnetInstance = parseTorrent(body.magnet_url)

    res.send(body)
}