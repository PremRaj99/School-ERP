import path from 'path';
import Module from 'module';

const srcDir = path.resolve(__dirname, '.');

// Pure in-memory path alias resolver for @/* with zero external file lookups
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const originalResolveFilename = (Module as any)._resolveFilename;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Module as any)._resolveFilename = function (
  request: string,
  parent: unknown,
  isMain: boolean,
  options: unknown,
) {
  if (request.startsWith('@/')) {
    request = path.join(srcDir, request.slice(2));
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

import { app } from './app';
import { NODE_ENV, PORT } from './core/config/constants';
import { setupLogWebSocket } from './modules/log/log.service';

const server = setupLogWebSocket(app);

const initServer = async () => {
  server.listen(PORT, () => {
    console.log(
      `SchoolERP Monolithic Backend Server is running in ${NODE_ENV} environment at http://localhost:${PORT}`,
    );
    console.log(`WebSocket ready at ws://localhost:${PORT}/api/v1/logs/live`);
  });
};

initServer();
