/**
 * dsh-hillstone-cli-ops build.
 *
 * Produces two bundles (mirrors the dsh-knowledge-base / dsh-plugin layout):
 *   - dist/index.mjs  host plugin (ESM, Node)   — loopback /ops-api server + ssh2 bridge
 *   - dist/client.js  client plugin (CJS, browser) — sidebar entry + terminal page
 *
 * `react`, `react-dom`, and `react/jsx-runtime` are externalized: the harness
 * provides them at runtime as baseline module-table entries.
 *
 * `ssh2` is a Node-only native-ish module: it stays external in the host build
 * and resolves from node_modules at runtime.
 *
 * `playwright` is the same story for a different reason: it must stay external
 * so its ~100MB of bundled browser-management code never lands in dist/index.mjs,
 * and so a missing install is a catchable error on one button press (see
 * src/web-login.ts's dynamic import) rather than a load-time failure of the
 * whole host plugin.
 *
 * `xterm` / `xterm-addon-fit` are INLINED into the client bundle (NOT external).
 * Reason: DSH's client module-table seed only exposes react/react-dom and the
 * `@deepseek-ai/*` packages; xterm is bundled internally by DSH but is not
 * registered as a resolvable module for plugins. An external `require("xterm")`
 * would throw `client-modules: ... missed the module table` and abort the whole
 * client registration. Inlining keeps the plugin self-contained. xterm's CSS is
 * imported as a string and injected into <head> at runtime (see client.tsx).
 *
 * Usage:  pnpm install && pnpm run build
 */
import { build } from 'esbuild'
import { mkdirSync } from 'node:fs'

mkdirSync('dist', { recursive: true })

const dshExternal = ['@deepseek-ai/cordis', '@deepseek-ai/dsh-*']

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.mjs',
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: ['node22'],
  sourcemap: true,
  external: [...dshExternal, 'ssh2', 'playwright'],
  logLevel: 'info',
})

await build({
  entryPoints: ['src/client.tsx'],
  outfile: 'dist/client.js',
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['es2022'],
  sourcemap: true,
  jsx: 'automatic',
  // xterm ships CSS that must be present for the terminal to render. We import
  // it as a text string and inject a <style> tag at runtime so the bundle stays
  // self-contained (no separate .css asset to ship/serve).
  loader: { '.css': 'text' },
  external: [
    ...dshExternal,
    'react',
    'react-dom',
    'react-dom/client',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'scheduler',
    // NOTE: xterm / xterm-addon-fit are intentionally NOT external — they are
    // bundled into client.js (see module comment at top). DSH does not expose
    // them as resolvable client modules, so externalizing would throw at load.
  ],
  banner: {
    js: "window.__ModuleLoader__.load({ id: 'dsh-hillstone-cli-ops', factory: (require) => { var module = { exports: {} }; var exports = module.exports;",
  },
  footer: { js: 'return module.exports; } });' },
  logLevel: 'info',
})
