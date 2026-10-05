/**
 * Ambient declarations for the non-code imports the bundles carry.
 *
 * `xterm/css/xterm.css` is imported as a *string* (esbuild `loader: { '.css':
 * 'text' }`, see build.mjs) and injected into <head> at runtime by
 * `ensureXtermCss()`. TypeScript has no idea about that loader, so without this
 * declaration `import xtermCss from 'xterm/css/xterm.css'` fails with TS2307 —
 * and the build has no typecheck step, so the error would otherwise only show
 * up in an editor.
 */
declare module '*.css' {
  const content: string
  export default content
}
