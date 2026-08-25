import 'module-alias/register';
import * as moduleAlias from 'module-alias';
import path from 'path';

const rootDir = path.resolve(__dirname, '..');
moduleAlias.addAliases({
  '@': path.join(rootDir, 'src'),
  '@/core': path.join(rootDir, 'src', 'core'),
  '@/modules': path.join(rootDir, 'src', 'modules'),
  '@/shared': path.join(rootDir, 'src', 'shared'),
});

// Require app after moduleAlias registration is active
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { app } = require('../src/app');

export default app;
