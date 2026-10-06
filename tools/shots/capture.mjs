/**
 * Screenshot harness for dsh-hillstone-cli-ops.
 *
 * Renders the REAL product — the real dist/client.js driving the real
 * dist/index.mjs host, against a fake StoneOS over a real SSH server — inside
 * a headless Chromium sized like the DSH right rail, and writes PNGs.
 *
 * Why not hand-drawn mockups: the plugin page used to ship styled HTML that
 * merely resembled the panel, and it drifted the first time a tab was added
 * (bundle-gate assertion m06703 exists precisely because the tab guide stopped
 * mentioning a tab the panel had). A screenshot of the real bundle cannot
 * drift: if the UI changes, the PNG changes with it.
 *
 * What this stands up, from the outside in:
 *   - a fake StoneOS shell on a real SSH port (ssh2's Server), so 设备管理's
 *     liveness probe and 终端's xterm pane have a live peer;
 *   - the real host bundle via a single mod.apply(ctx, {...}) — the shape
 *     production has, so the HTTP API and the agent tools share one store;
 *   - a page shell that serves the two externals the client bundle requires
 *     (react, react-dom) as their real UMD builds over the synthetic
 *     window.__ModuleLoader__, plus the host's --dsw-alias-* dark tokens so
 *     the panel renders in the theme the operator actually sees;
 *   - Playwright at 2x device scale, clipped to the rail.
 *
 * Usage: node capture.mjs [--out <dir>] [--keep]
 */
import { createRequire } from 'node:module'
import { createServer } from 'node:http'
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { randomUUID } from 'node:crypto'

import ssh2 from 'ssh2'

const require = createRequire(import.meta.url)
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..')
const OUT = (() => {
  const i = process.argv.indexOf('--out')
  return i >= 0 ? resolve(process.argv[i + 1]) : join(ROOT, 'docs', 'assets')
})()
const HOST_BUNDLE = pathToFileURL(join(ROOT, 'dist', 'index.mjs')).href
const CLIENT_BUNDLE = join(ROOT, 'dist', 'client.js')
const REACT_UMD = join(HERE, 'node_modules', 'react', 'umd', 'react.production.min.js')
const REACT_DOM_UMD = join(HERE, 'node_modules', 'react-dom', 'umd', 'react-dom.production.min.js')
const { chromium } = require('playwright')
const { Server: SshServer, utils: sshUtils } = ssh2

const PASSWORD = 'shots-pass'
// The client bundle hard-codes the port (client.tsx:73), and a running DSH owns
// it. Rather than fight over the port or patch the product, the harness runs its
// host on a free one and rewrites the URL at the page edge — see the fetch /
// EventSource shims in the shell. The bundle under test is untouched.
const CLIENT_PORT = 18783
const API_PORT = await freePort()
/** Right-rail width and per-scene heights, chosen to match the DSH sidebar. */
const RAIL_W = 440
const H = { devices: 760, dialog: 900, terminal: 900, logs: 760, logDetail: 1080, policies: 700, policyForm: 980 }

function freePort() {
  return new Promise((res) => {
    const s = require('node:net').createServer()
    s.listen(0, '127.0.0.1', () => {
      const p = s.address().port
      s.close(() => res(p))
    })
  })
}

// ---- fake StoneOS ----------------------------------------------------------
//
// A pared-down sibling of the one in test/terminal-regression.mjs: banner,
// prompt, echo, `terminal length 0`, and just the commands the shots put on
// screen. It exists so the liveness dot and the terminal have a live peer, not
// to re-test the terminal.

const sshServer = new SshServer({ hostKeys: [sshUtils.generateKeyPairSync('ed25519').private] }, (client) => {
  client.on('error', () => { /* a probe-side drop must not kill the run */ })
  client.on('authentication', (ctx) => {
    if (ctx.method === 'password' && ctx.username === 'ops' && ctx.password === PASSWORD) {
      ctx.accept()
      return
    }
    ctx.reject()
  })
  client.on('ready', () => {
    client.on('session', (accept) => {
      const session = accept()
      let ptyInfo = null
      session.on('pty', (a, rej, info) => { (a ?? rej)(); ptyInfo = info })
      session.on('shell', (a, rej) => {
        const stream = (a ?? rej)()
        const w = (s) => { if (s) { try { stream.write(s) } catch { /* ignore */ } } }
        stream.on('error', () => { /* client vanished; keep the probe alive */ })
        w('\r\nHillStone StoneOS\r\nCopyright (c) 2005-2026 Hillstone Networks\r\n\r\n')
        w(`Terminal: ${ptyInfo?.term ?? 'xterm-256color'} ${ptyInfo?.cols ?? 120}x${ptyInfo?.rows ?? 40}\r\n\r\n`)
        w('SG-6000# ')
        let buf = ''
        stream.on('data', (chunk) => {
          for (const ch of chunk.toString('utf-8')) {
            if (ch === '\u0003') { buf = ''; w('^C\r\nSG-6000# '); continue }
            if (ch === '\r' || ch === '\n') {
              const cmd = buf.trim()
              buf = ''
              w('\r\n')
              if (cmd === '') w('SG-6000# ')
              else if (cmd === 'terminal length 0') w('terminal length 0\r\nSG-6000# ')
              else if (cmd === 'show version') {
                w('Hillstone SG-6000 v3.2.6.13 build 241107\r\n')
                w('Boot time  : 2026-09-28T09:14:22+08:00\r\n')
                w('Model      : SG-6000 (1U, 8 Gbps)\r\n')
                w('Uptime     : 8 days, 4 hours\r\n')
                w('CPU        : Intel C3558 @ 2.20GHz x8, load 0.31\r\n')
                w('Memory     : 16384 MB total, 6112 MB used\r\n')
                w('SG-6000# ')
              } else if (cmd === 'show interface brief') {
                w('  Interface        Link  Speed  Duplex   State\r\n')
                w('  con1             up    1G     full     up\r\n')
                w('  con2             up    1G     full     up\r\n')
                w('  eth1             up    10G    full     up\r\n')
                w('  eth2             down  auto   auto     down\r\n')
                w('  manage           up    100M   full     up\r\n')
                w('SG-6000# ')
              } else if (cmd === 'show cpu detail') {
                for (let i = 1; i <= 16; i++) w(`cpu ${String(i).padStart(2, '0')} :  ${(3 + (i % 7)).toFixed(2)}% usr  ${(1 + (i % 4)).toFixed(2)}% sys\r\n`)
                w('SG-6000# ')
              } else if (cmd === 'show system memory') {
                w('Total memory : 16384 MB\r\nFree  memory : 10272 MB\r\nUsed  memory : 6112 MB\r\nBuffers       : 412 MB\r\nCached        : 2088 MB\r\n')
                w('SG-6000# ')
              } else if (cmd === 'show running-config interface con1') {
                w('interface con1\r\n  description UPLINK-CORE\r\n  ip address 10.20.0.2 255.255.255.252\r\n  mtu 1500\r\n  speed 1000\r\n  duplex auto\r\n')
                w('SG-6000# ')
              } else w(`^-----unrecognized keyword "${cmd}"\r\nSG-6000# `)
              continue
            }
            if (ch >= ' ') { buf += ch; w(ch) }
          }
        })
        stream.on('end', () => stream.end())
      })
    })
  })
})
// Bound to 0.0.0.0, not 127.0.0.1: the devices are staged on 127.0.0.11 and
// 127.0.0.47 so the panel shows three distinct hosts rather than the same box
// three times, and a listener bound to the single loopback address refuses
// those aliases outright.
await new Promise((r) => sshServer.listen(0, '0.0.0.0', r))
const sshPort = sshServer.address().port
const DEAD_PORT = await freePort() // nothing answers here → the panel must show 离线

// ---- boot the real host ---------------------------------------------------

const dataDir = join(tmpdir(), `dsh-ops-shots-${randomUUID().slice(0, 8)}`)
rmSync(dataDir, { recursive: true, force: true })
mkdirSync(dataDir, { recursive: true })

if (await portOpen(API_PORT)) {
  throw new Error(`port ${API_PORT} is already in use — freePort() handed out a taken port`)
}

const mod = await import(HOST_BUNDLE)
mod.apply(
  {
    logger: { info: () => {}, warn: (m) => console.error('[host warn]', String(m)) },
    inject: (deps, cb) => {
      if (Array.isArray(deps) && deps.includes('tools')) {
        cb({ effect: (fn) => fn(), tools: { register: () => () => {} } })
      }
    },
    effect: (fn) => fn(),
  },
  { dataDir, apiPort: API_PORT, apiTokenEnabled: true },
)
await waitPort(API_PORT)

function portOpen(port) {
  return new Promise((r) => {
    const s = require('node:net').createConnection({ port, host: '127.0.0.1' })
    s.on('connect', () => { s.destroy(); r(true) })
    s.on('error', () => r(false))
  })
}
async function waitPort(port, ms = 8000) {
  const deadline = Date.now() + ms
  while (Date.now() < deadline) {
    if (await portOpen(port)) return true
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error(`host did not open ${port}`)
}

// ---- seed the fixtures -----------------------------------------------------
//
// Shots of an empty panel teach nothing, so every scene is staged: three
// devices in three states, a few finished sessions carrying realistic
// commands, and three policies. Nothing is faked in the UI — this is all real
// state, written by the real host through the real API.

const BASE = `http://127.0.0.1:${API_PORT}/ops-api`
async function j(path, opts = {}) {
  const res = await fetch(BASE + path, {
    method: opts.method ?? 'GET',
    headers: { 'content-type': 'application/json', 'X-Ops-Token': 'shots' },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${opts.method ?? 'GET'} ${path} -> ${res.status} ${text}`)
  return text ? JSON.parse(text) : {}
}

const mk = async (body) =>
  (await j('/devices', { method: 'POST', body: { password: PASSWORD, port: sshPort, account: 'ops', ...body } })).device

// The reachable devices live on 127.0.0.x rather than the 10.20.30.x a real
// deployment would use: the whole 127.0.0.0/8 range is loopback, so the fake
// StoneOS answers on them, and the panel still shows three distinct hosts. A
// shot is a claim about the product, and a device the product cannot reach
// would be a false one.
const fwMain = await mk({
  name: 'SG-6000 主防火墙',
  ip: '127.0.0.11',
  deviceType: 'next-gen-firewall',
  webPort: 443,
  note: '生产出口，承担全部南北向流量',
})
const ipsProbe = await mk({
  name: 'IPS 探针机',
  ip: '127.0.0.47',
  deviceType: 'intrusion-prevention',
  webPort: 8080,
  note: '旁路镜像口，只读',
})
// Pointed at a port nothing answers on, so the panel has to draw it 离线 — the
// state the liveness dot exists to communicate.
const wafSpare = await mk({
  name: 'WAF 备机',
  ip: '127.0.0.88',
  deviceType: 'web-application-firewall',
  port: DEAD_PORT,
  note: '待上架，账号待申请',
})
await j('/devices/ping', { method: 'POST', body: {} })
await j('/policies', {
  method: 'POST',
  body: { name: '夜间高危命令冻结', enabled: true, window: { start: '22:00', end: '06:00', timezone: 'Asia/Shanghai' }, commands: ['reload', 'deleten', 'erase'], note: '变更窗口之外的硬红线' },
})
await j('/policies', {
  method: 'POST',
  body: { name: '生产防火墙只读', enabled: true, commands: ['set', 'unset', 'reset'], note: '生产出口改配置必须走变更流程' },
})
await j('/policies', {
  method: 'POST',
  body: { name: '全设备备份窗口', enabled: false, commands: ['backup'], note: '暂不启用，备份策略还在讨论' },
})

// Sessions: real commands over the real SSH server, so the audit trail is
// written by the real SessionLogWriter rather than hand-assembled.
async function session(deviceId, lines, { close = true } = {}) {
  const conn = (await j('/connect', { method: 'POST', body: { deviceId, cols: 120, rows: 40 } })).connection
  await new Promise((r) => setTimeout(r, 300)) // let the banner land before typing
  for (const line of lines) {
    // /conn/input takes { connId, data } in the body — the route is not keyed by
    // the connection id.
    await j('/conn/input', { method: 'POST', body: { connId: conn.connId, data: `${line}\r` } })
    await new Promise((r) => setTimeout(r, 180))
  }
  if (close) await j('/disconnect', { method: 'POST', body: { connId: conn.connId } })
  return conn.connId
}

const liveConn = await session(fwMain.id, ['terminal length 0', 'show version', 'show interface brief', 'show cpu detail'], { close: false })
await session(fwMain.id, ['terminal length 0', 'show system memory', 'show running-config interface con1'])
await session(ipsProbe.id, ['terminal length 0', 'show system memory'])
await session(ipsProbe.id, ['terminal length 0', 'show version', 'show cpu detail', 'show interface brief'], { close: false })
// NOTE: the WebUI verdict is deliberately NOT staged. POST /web-login really
// launches a headful Chromium against the device (src/web-login.ts:144) — a
// harness must not open browser windows on the operator's desktop, and
// http://127.0.0.x:8080 answers nothing anyway.

// ---- page shell ------------------------------------------------------------

const clientJs = readFileSync(CLIENT_BUNDLE, 'utf-8')
const reactJs = readFileSync(REACT_UMD, 'utf-8')
const reactDomJs = readFileSync(REACT_DOM_UMD, 'utf-8')
// The two harness scripts live in real files next to this one, not in template
// literals. Inline blocks collapse every stack frame onto the document URL —
// which has already mis-blamed the port shim for a failure it does not contain —
// and a file on disk can be checked with `node --check`, which is how an escaped
// newline that silently killed an entire inline block was caught.
// replaceAll, not replace: a string pattern replaces only the first match, and
// shell-boot.js names both placeholders in its header comment — so replace
// substituted the comment and left the code literal, which silently sent every
// panel request to the real 18783 instead of the harness host.
const bootJs = readFileSync(join(HERE, 'shell-boot.js'), 'utf-8')
  .replaceAll('__CLIENT_PORT__', String(CLIENT_PORT))
  .replaceAll('__API_PORT__', String(API_PORT))
const mountJs = readFileSync(join(HERE, 'shell-mount.js'), 'utf-8')
if (bootJs.includes('__CLIENT_PORT__') || bootJs.includes('__API_PORT__')) {
  throw new Error('shell-boot.js still contains an unsubstituted port placeholder')
}

const shellHtml = () => `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<style>
/* The host's dark theme tokens. The panel reads these and only falls back to
 * its own literals when one is missing, so supplying the real values is what
 * makes a shot look like the installed plugin rather than a stripped page. */
:root {
  --dsw-alias-bg-layer-0: #0d0d12;
  --dsw-alias-bg-layer-1: #1e1f23;
  --dsw-alias-bg-layer-2: #232324;
  --dsw-alias-bg-layer-3: #2c2c2e;
  --dsw-alias-bg-mask-2: #00000008;
  --dsw-alias-state-business-primary: #4176e6;
  --dsw-alias-state-error-primary: #f85149;
  --dsw-alias-state-success-primary: #22c55e;
  --dsw-alias-state-warning-primary: #d9a441;
  --dsw-alias-interactive-bg-hover: #ffffff0d;
  --dsw-alias-interactive-bg-active: #ffffff14;
  --dsw-alias-interactive-fg-default: #f9fafb;
  --dsw-alias-interactive-fg-muted: #a1a1aa;
  --dsw-alias-label-primary: #f9fafb;
  --dsw-alias-label-secondary: #c9c9cf;
  --dsw-alias-label-tertiary: #8b8b94;
  --dsw-alias-border-l2: #2a2a36;
  --dsw-alias-border-l4: #4a4d55;
  --dsw-alias-shadow-lv1: 0 1px 2px #00000040;
  --dsw-alias-shadow-lv2: 0 6px 20px #00000059;
  --dsw-alias-radius-sm: 6px;
  --dsw-alias-transition-duration-fast: 120ms;
  --dsw-alias-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--dsw-alias-bg-layer-0); }
body { font-family: "Segoe UI", "Microsoft YaHei", system-ui, sans-serif; font-size: 13px; color: var(--dsw-alias-label-primary); }
#rail { width: ${RAIL_W}px; min-height: 100vh; background: var(--dsw-alias-bg-layer-0); display: flex; flex-direction: column; }
#railBar { display: flex; align-items: center; gap: 6px; padding: 10px 10px 8px; }
.rail-tab { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--dsw-alias-radius-sm); color: var(--dsw-alias-label-tertiary); cursor: default; }
.rail-tab.on { background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary); }
#mount { flex: 1; min-height: 0; display: flex; flex-direction: column; }
#bootError { color: #f85149; font: 12px/1.6 Consolas, monospace; padding: 12px; white-space: pre-wrap; }
</style></head>
<body>
<div id="rail">
  <div id="railBar">
    <div class="rail-tab" title="对话"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 5h16v12H7l-3 3z"/></svg></div>
    <div class="rail-tab on" title="设备运维"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 5h16v3H4zM4 10h16v3H4zM4 15h16v4H4z"/></svg></div>
    <div class="rail-tab" title="知识库"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M5 4h9l5 5v11H5z"/></svg></div>
  </div>
  <div id="mount"></div>
</div>
<div id="bootError" hidden></div>
/* react, react-dom and the plugin bundle are served as separate resources
 * rather than inlined. Inlining a 523 KB bundle into a script block both
 * corrupts stack traces (every line collapses toward the inline block) and is a
 * latent hazard: a closing script tag anywhere inside a string would end the
 * block early. */
<script src="/panel/react.js"></script>
<script src="/panel/react-dom.js"></script>
<script src="/panel/shell-boot.js"></script>
<script src="/panel/client.js"></script>
<script src="/panel/shell-mount.js"></script>
</body></html>`

// ---- take the shots --------------------------------------------------------

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: RAIL_W, height: H.devices },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
})
const consoleErrors = []
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push('console: ' + m.text() + '\n' + (m.location() || {}).url)
})
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + (e && e.stack || String(e))))
// "Failed to fetch" is deliberately opaque: it covers a refused connection, a
// blocked preflight and a CORS rejection alike. Playwright sees the real reason,
// so record it rather than inferring one.
const netFail = []
page.on('requestfailed', (r) => {
  const f = r.failure()
  netFail.push({ url: r.url(), method: r.method(), err: f && f.errorText })
  console.log('requestfailed', r.method(), r.url(), '->', f && f.errorText)
})
page.on('response', (r) => {
  if (r.url().includes('/ops-api/')) console.log('response', r.status(), r.request().method(), r.url())
})

const html = shellHtml()
if (process.env.SHOTS_DUMP_HTML) writeFileSync(join(OUT, '_debug-shell.html'), html)
// The page needs a real loopback origin — not about:blank and not setContent —
// for two reasons: the panel's fetch is cross-origin from a null origin, and the
// host's token gate trusts loopback Origins (src/index.ts:1143). A high port is
// used because Chromium refuses to navigate to a "restricted" port like 1.
//
// This is a real HTTP server rather than page.route interception. Under
// interception every cross-origin request from the page failed with a bare
// ERR_FAILED — indistinguishable from a CORS rejection — while a standalone
// probe proved the very same origin/port/method combination succeeds. Serving
// for real removes a whole class of harness-only failure from the diagnosis.
const PAGE_PORT = 45999
const PAGE_ORIGIN = 'http://127.0.0.1:' + PAGE_PORT
const SHELL_ASSETS = {
  'client.js': clientJs,
  'react.js': reactJs,
  'react-dom.js': reactDomJs,
  'shell-boot.js': bootJs,
  'shell-mount.js': mountJs,
}
const shellServer = createServer((req, res) => {
  const path = (req.url || '/').split('?')[0]
  if (path === '/panel/' || path === '/panel/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)
    return
  }
  const asset = SHELL_ASSETS[path.replace('/panel/', '')]
  if (asset !== undefined) {
    res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' })
    res.end(asset)
    return
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('not found: ' + path)
})
await new Promise((r) => shellServer.listen(PAGE_PORT, '127.0.0.1', r))
await page.goto(PAGE_ORIGIN + '/panel/', { waitUntil: 'load' })
// A <script src> that 404s or is blocked leaves no error event in the page: the
// loader simply never runs. So confirm the loader was actually invoked, instead
// of blaming whatever the panel happened to be doing at the time.
const loaded = await page.evaluate(() => ({
  loaderCalls: window.__loaded || 0,
  hasReact: typeof window.React === 'object',
  hasReactDom: typeof window.ReactDOM === 'object',
  scripts: Array.from(document.scripts).map((s) => s.src || '(inline)'),
  clientRan: typeof window.__clientExports,
  loadFailure: window.__loadFailure || null,
  loaderType: typeof window.__ModuleLoader__,
  fullStacks: window.__fullStacks || [],
}))
const resources = await page.evaluate(() =>
  performance.getEntriesByType('resource')
    .filter((e) => e.name.includes('/panel/'))
    .map((e) => ({ name: e.name.split('/').pop(), type: e.initiatorType, bytes: e.transferSize, status: e.responseStatus })),
)
if (loaded.loaderCalls !== 1) {
  // Report the inline block's own syntax state, not just the globals it was
  // supposed to leave behind. A parse error leaves no error event on window,
  // which is why this kept looking like "the loader was never defined".
  const inlineSyntax = await page.evaluate(() =>
    Array.from(document.scripts)
      .filter((s) => !s.src)
      .map((s, i) => {
        const src = s.textContent || ''
        const lines = src.split('\n')
        let parsed = 'ok'
        let at = 0
        try {
          new Function(src)
        } catch (e) {
          parsed = String(e && e.message)
          // new Function reports "line N" against the wrapped body; bisect to the
          // real line so the message points at code the reader can actually see.
          for (let n = 1; n <= lines.length; n++) {
            try {
              new Function(lines.slice(0, n).join('\n') + '\n'.padEnd(0))
            } catch {
              continue
            }
            break
          }
          at = lines.length
        }
        return { i, chars: src.length, parsed, firstBadGuess: at, lines: lines.length, sample: lines.slice(Math.max(0, at - 4), at + 1) }
      }),
  )
  throw new Error(
    `the client bundle never reached the module loader (load() called ${loaded.loaderCalls}x)\n` +
    `  scripts in DOM: ${JSON.stringify(loaded.scripts)}\n` +
    `  resources: ${JSON.stringify(resources)}\n` +
    `  react=${loaded.hasReact} reactDom=${loaded.hasReactDom} clientExports=${loaded.clientRan} loader=${loaded.loaderType}\n` +
    `  load failure: ${loaded.loadFailure || '(none)'}\n` +
    `  re-eval of inline blocks: ${JSON.stringify(loaded.reeval, null, 2)}\n` +
    `  inline blocks: ${JSON.stringify(inlineSyntax, null, 2)}`,
  )
}

/** Fail loudly: a half-booted panel photographs as a broken product. */
async function assertMounted(what) {
  const state = await page.evaluate(() => ({
    mounted: !!window.__mounted,
    boot: (() => { const b = document.getElementById('bootError'); return b && !b.hidden ? b.textContent : '' })(),
    errors: window.__bootErrors || [],
    railText: (document.querySelector('.ops-root') || {}).innerText || '',
  }))
  if (!state.mounted) throw new Error(`${what}: panel never mounted — ${state.boot || 'no boot error recorded'}`)
  if (state.boot) throw new Error(`${what}: ${state.boot}`)
  if (state.errors.length) throw new Error(`${what}: page errors — ${state.errors.slice(0, 3).join(' --- ')}`)
  if (!state.railText.includes('设备管理')) throw new Error(`${what}: panel rendered without its tab strip — got ${JSON.stringify(state.railText.slice(0, 200))}`)
  return state
}

/** Report what the panel is actually showing, so a missing card is a diagnosis. */
async function dumpPanel(what) {
  const state = await page.evaluate(() => {
    const root = document.querySelector('.ops-root')
    return {
      stage: window.__stage || null,
      rootText: (root && root.innerText) || '(no .ops-root)',
      html: root ? root.innerHTML.slice(0, 1200) : '',
      classes: Array.from(document.querySelectorAll('[class]')).map((e) => e.className).slice(0, 40),
      opsDevs: document.querySelectorAll('.ops-dev').length,
      empties: Array.from(document.querySelectorAll('.ops-empty')).map((e) => e.innerText),
      msgs: Array.from(document.querySelectorAll('.ops-msg')).map((e) => e.innerText),
      fetchLog: window.__fetchLog || [],
      apiBase: window.__apiBase || null,
    }
  })
  console.log(`\n--- panel dump (${what}) ---`)
  console.log('stage:', state.stage, 'apiBase:', state.apiBase)
  console.log('opsDevs:', state.opsDevs, 'empties:', JSON.stringify(state.empties), 'msgs:', JSON.stringify(state.msgs))
  console.log('fetchLog:', JSON.stringify(state.fetchLog, null, 1))
  console.log('rootText:', JSON.stringify(state.rootText.slice(0, 600)))
  console.log('classes:', JSON.stringify(state.classes))
  console.log('html:', state.html)
  console.log('--- end panel dump ---\n')
}

// Race the tab strip against the boot-error panel, so a failed boot reports its
// own message instead of a bare 15s selector timeout.
await page.waitForSelector('.ops-seg button, #bootError:not([hidden])', { timeout: 15_000 })
await assertMounted('boot')
// The devices list arrives over HTTP; wait for a real card, not just the frame.
try {
  await page.waitForSelector('.ops-dev', { timeout: 15_000 })
} catch (e) {
  await dumpPanel('devices never rendered')
  throw e
}
await page.waitForFunction(() => !document.querySelector('.ops-loading'), null, { timeout: 10_000 })

const shot = async (name, height) => {
  if (height) await page.setViewportSize({ width: RAIL_W, height })
  await page.waitForTimeout(320) // let the CSS transition settle
  const file = join(OUT, `${name}.png`)
  await page.locator('#rail').screenshot({ path: file })
  console.log('shot', file)
}

const clickTab = async (label) => {
  await page.locator('.ops-seg button', { hasText: new RegExp(`^${label}$`) }).click()
  await page.waitForTimeout(420)
}

// The liveness dots come from the panel's own 检测存活 action: the verdicts live
// in a client module store that only that button fills. Pinging from the seeding
// side would leave the store empty and every card dotless — the one piece of UI
// the device page exists to show. So the shot is taken by really pressing it.
await page.locator('.ops-head-right button', { hasText: '检测存活' }).click()
await page.waitForFunction(
  () => document.querySelectorAll('.ops-dot.online, .ops-dot.offline').length >= 3,
  null,
  { timeout: 20_000 },
)
await page.waitForTimeout(500)
await shot('01-设备管理', H.devices)

// The device form — the one dialog every record in the panel goes through.
await page.locator('.ops-head-right button', { hasText: '新增设备' }).click()
await page.waitForSelector('.ops-modal', { timeout: 5000 })
await shot('02-新增设备', H.dialog)
await page.locator('.ops-modal .ops-btn', { hasText: '取消' }).first().click().catch(async () => {
  await page.keyboard.press('Escape')
})
await page.waitForTimeout(300)

await clickTab('终端')
await page.waitForSelector('.ops-term-canvas', { timeout: 15_000 })
// Let the banner and the first command's output land before the shutter.
await page.waitForTimeout(1400)
await shot('03-终端', H.terminal)

await clickTab('日志')
await page.waitForSelector('.ops-log-row', { timeout: 15_000 })
await page.waitForTimeout(300)
await shot('04-日志审计', H.logs)

await page.locator('.ops-log-row').first().click()
await page.waitForSelector('.ops-log-entries', { timeout: 8000 })
await page.waitForTimeout(300)
await shot('05-日志明细', H.logDetail)
await page.keyboard.press('Escape')
await page.waitForTimeout(300)

await clickTab('执行策略')
await page.waitForSelector('.ops-dev', { timeout: 15_000 })
await page.waitForTimeout(300)
await shot('06-执行策略', H.policies)

await page.locator('.ops-head-right button', { hasText: '新增策略' }).click()
await page.waitForSelector('.ops-modal', { timeout: 5000 })
await page.waitForTimeout(300)
await shot('07-新增策略', H.policyForm)

const summary = await page.evaluate(() => ({
  tabs: [...document.querySelectorAll('.ops-seg button')].map((b) => b.textContent),
  cards: document.querySelectorAll('.ops-dev').length,
}))
console.log('summary', JSON.stringify(summary))
if (consoleErrors.length) {
  console.error('CONSOLE ERRORS during capture:')
  for (const e of consoleErrors) console.error('  ' + e)
}
writeFileSync(join(OUT, 'README.txt'), [
  'Generated by tools/shots/capture.mjs — do not edit by hand.',
  'Every PNG here is a screenshot of the real dist/client.js bundle rendered',
  'against the real dist/index.mjs host and a fake StoneOS over real SSH,',
  'seeded through the real /ops-api. Re-run the harness to refresh them.',
  '',
  ...summary.tabs.map((t, i) => `  tab ${i + 1}: ${t}`),
  '',
].join('\n'))

await browser.close()
sshServer.close()
rmSync(dataDir, { recursive: true, force: true })
console.log(consoleErrors.length ? 'SHOTS DONE (with console errors)' : 'SHOTS DONE')
process.exit(consoleErrors.length ? 1 : 0)
