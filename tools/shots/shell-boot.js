/* The host's module loader, plus the two globals the capture script reads back.
 * This is a real file, not a template literal in capture.mjs, for two reasons:
 *   - Chromium attributes a throw to a script's own URL. Inside one inline block
 *     every frame collapses onto the document URL, which has already mis-blamed
 *     the port shim here for an addEventListener failure it does not contain.
 *   - A file on disk can be syntax-checked with `node --check`, which is how the
 *     escaped-newline bug that silently killed the whole block was found.
 *
 * __CLIENT_PORT__ and __API_PORT__ are substituted by capture.mjs. */
window.__ModuleLoader__ = {
  load(spec) {
    const { id, factory } = spec
    try {
      const exports = factory((name) => {
        if (name === 'react') return window.React
        if (name === 'react-dom') return window.ReactDOM
        throw new Error('unexpected external require: ' + name)
      })
      window.__clientExports = exports
      window.__loaded = (window.__loaded || 0) + 1
      return { id, exports }
    } catch (e) {
      // Also record on window: the mount block overwrites #bootError, so a throw
      // here would otherwise be the only thing the operator ever sees.
      window.__loadFailure = (e && e.stack) || String(e)
      const box = document.getElementById('bootError')
      box.hidden = false
      box.textContent = 'BOOT FAILED: ' + ((e && e.stack) || e)
      throw e
    }
  },
}
window.__bootErrors = []
window.__stage = 'boot:start'
const errText = (e) => (e && e.error && e.error.stack) || e.message || String(e)
window.addEventListener('error', (e) => {
  // Keep the real frame set, not just file/line: the line number alone has
  // pointed at innocent code more than once.
  const frames = ((e && e.error && e.error.stack) || '')
    .split(String.fromCharCode(10))
    .slice(0, 8)
    .map((l) => l.trim())
  window.__bootErrors.push(
    'error at stage=' + window.__stage + ': ' + errText(e) + ' || frames=' + JSON.stringify({
      file: e.filename,
      line: e.lineno,
      col: e.colno,
      stackFrames: frames,
    }),
  )
})
window.addEventListener('unhandledrejection', (e) =>
  window.__bootErrors.push('unhandledrejection at stage=' + window.__stage + ': ' + errText(e)),
)
/* Split one statement per line and stamp __stage before each. The reported
 * frame is always the first line of whatever statement is executing, so with a
 * single line per statement the stage names the failing step instead of a line
 * that merely happens to start an expression. */
const shimFrom = 'http://127.0.0.1:__CLIENT_PORT__'
const shimTo = 'http://127.0.0.1:__API_PORT__'
window.__stage = 'shim:start'
window.__fetchLog = []
const nativeFetch = window.fetch.bind(window)
window.fetch = function (input, init) {
  const url = typeof input === 'string' ? input : (input && input.url) || String(input)
  const entry = { url, rewritten: false, ok: null, err: null }
  window.__fetchLog.push(entry)
  if (typeof input === 'string' && input.startsWith(shimFrom)) {
    entry.url = shimTo + input.slice(shimFrom.length)
    entry.rewritten = true
    return nativeFetch(entry.url, init)
      .then((r) => { entry.ok = r.status; return r })
      .catch((e) => { entry.err = String(e); throw e })
  }
  return nativeFetch(input, init)
      .then((r) => { entry.ok = r.status; return r })
      .catch((e) => { entry.err = String(e); throw e })
}
window.__stage = 'shim:eventsource'
const NativeES = window.EventSource
const ShimES = function (url, cfg) {
  const target = typeof url === 'string' && url.startsWith(shimFrom) ? shimTo + url.slice(shimFrom.length) : url
  return Reflect.construct(NativeES, [target, cfg])
}
ShimES.prototype = NativeES.prototype
Object.setPrototypeOf(ShimES, NativeES)
window.EventSource = ShimES
window.__apiBase = shimTo
window.__stage = 'boot:done'
