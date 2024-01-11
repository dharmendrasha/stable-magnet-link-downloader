const { env } = process

export const APPLICATION_PORT = Number(env['PORT'] || 3000)