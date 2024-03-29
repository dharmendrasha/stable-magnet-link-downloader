/* eslint-disable @typescript-eslint/no-explicit-any */
type ParsedTorrent = string | ArrayBufferView | Record<string, any>;

declare module "parse-torrent" {
  export default function parseTorrent(
    torrentId: ParsedTorrent,
  ): Promise<Record<any, any>>;
}

declare namespace Express {
  export interface Request {
    parsedTorrent: Record<any, any>;
    startTime: number;
  }
}
