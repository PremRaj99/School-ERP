import path from 'path';
import Module from 'module';

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

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

// Require app after hook is active
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { app } = require('../src/app');

export default app;
