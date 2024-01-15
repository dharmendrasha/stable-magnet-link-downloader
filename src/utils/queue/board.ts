import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter.js";
import { ExpressAdapter } from "@bull-board/express";
import { q } from "./bull.js";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');


const board = createBullBoard({
    queues: [new BullAdapter(q, {allowRetries: true, description: 'queue to manage torrent downloads'})],
    serverAdapter: serverAdapter,
    options: {
      uiConfig: {
        boardTitle: 'Elitale',
        boardLogo: {
          path: 'https://avatars.githubusercontent.com/u/122196207?s=200&v=4',
          width: '100px',
          height: '100px',
        },
        favIcon: {
          default: 'https://avatars.githubusercontent.com/u/122196207?s=200&v=4',
          alternative: 'https://avatars.githubusercontent.com/u/122196207?s=200&v=4',
        }
      }
    }
  });

export { serverAdapter, board }