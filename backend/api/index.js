// Vercel serverless entrypoint.
//
// This is deliberately NOT src/index.ts. That file calls setupLogWebSocket(), which opens an
// http.Server and tails logs/combined.log — neither of which a serverless function can do
// (no long-lived connections, read-only filesystem). Vercel needs the bare Express app so it
// can invoke it per-request; `vercel dev`, `npm run dev` and `npm start` still use src/index.ts
// and keep the WebSocket log stream.
//
// We require the compiled dist/ rather than src/ because 83 files import through the `@/*` path
// alias. `npm run build` runs tsc-alias, which rewrites those to real relative paths; letting
// Vercel's bundler compile src/ directly would leave the aliases unresolved at runtime.
const { app } = require('../dist/app.js');

module.exports = app;
