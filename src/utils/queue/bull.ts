import Bull from 'bull'
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from '../../config.js'

export const q_name = 'torrent_download'

export const q = new Bull(q_name, {
    redis: {
        port: REDIS_PORT,
        host: REDIS_HOST,
        password: REDIS_PASSWORD || undefined
    }
})

