import path from 'path';
import * as tsConfigPaths from 'tsconfig-paths';

const baseUrl = path.resolve(__dirname, '..');
tsConfigPaths.register({
  baseUrl,
  paths: {
    '@/*': [
      path.resolve(baseUrl, 'src', '*'),
      path.resolve(baseUrl, 'dist', '*'),
      path.resolve(__dirname, '..', 'src', '*'),
      path.resolve(__dirname, '..', 'dist', '*'),
      'src/*',
      'dist/*',
    ],
  },
});

// Require app after tsConfigPaths registration is in effect
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { app } = require('../src/app');

export default app;
