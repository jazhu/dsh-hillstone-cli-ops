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
 * `ssh2` is INLINED into the host bundle, together with its whole pure-JS
 * dependency closure (asn1, bcrypt-pbkdf, tweetnacl, safer-buffer). Rationale:
 * a DSH bundle is portable only if its host half imports with no node_modules
 * beside it. A `link:` install — and any folder copied to another machine —
 * never installs the package's own dependencies (pnpm does not install a linked
 * package's deps), so an external `import "ssh2"` becomes
 * `Error: Cannot find module 'asn1'` at Loader import time, which leaves the
 * entry with no fiber, which makes the `dsh.client` scan skip it, which silently
 * removes the whole plugin (host half, client half, right-rail tab). Inlining
 * deletes that failure mode instead of documenting it.
 *
 * `cpu-features` stays external on purpose: it is ssh2's OPTIONAL native
 * acceleration, required inside a try/catch (ssh2/lib/protocol/constants.js), so
 * a machine without it — or without a toolchain to build it — quietly gets the
 * pure-JS cipher path instead of a build or load failure.
 *
 * `playwright` stays external for a different reason: it must stay out of
 * dist/index.mjs (~100MB of browser-management code), and a missing install must
 * be a catchable error on one button press (see src/web-login.ts's dynamic
 * import) rather than a load-time failure of the whole host plugin.
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
  // ssh2 is deliberately NOT external (see the module comment above): its
  // pure-JS closure is inlined so the host half imports with no node_modules.
  // `cpu-features` is ssh2's optional native extra — keep it out of the bundle.
  external: [...dshExternal, 'playwright', 'cpu-features'],
  // Inlined CJS reaches for builtins through a *dynamic* require (`crypto` is
  // assigned inside a function, the optional native binding by a computed
  // relative path), which esbuild cannot rewrite into static imports. In an ESM
  // output its `__require` shim throws `Dynamic require of "crypto" is not
  // supported` unless a real `require` exists in scope — so give it one. This is
  // the difference between "ssh2 is in the file" and "ssh2 runs".
  banner: {
    js: [
      "import { createRequire as __dshCreateRequire } from 'node:module';",
      "import { fileURLToPath as __dshFileURLToPath } from 'node:url';",
      "import { dirname as __dshDirname } from 'node:path';",
      'const require = __dshCreateRequire(import.meta.url);',
      'const __filename = __dshFileURLToPath(import.meta.url);',
      'const __dirname = __dshDirname(__filename);',
    ].join('\n'),
  },
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
