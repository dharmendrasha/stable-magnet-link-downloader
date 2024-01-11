import { Request, Response } from "express"

const { env } = process

export function Ping(_: Request, res: Response){
    const info = {
        ENV:env['NODE_ENV'],
        VERSION: env['VERSION']
    }


    res.json(info)
}