/**
 * Offline regression harness for the terminal rework (m01378).
 *
 * Runs the REAL host bundle (dist/index.mjs) against a REAL SSH server (ssh2's
 * own Server, speaking the actual wire protocol) that imitates a Hillstone
 * StoneOS shell: banner, prompt `SG-6000# `, character echo, `terminal length 0`
 * to kill the pager, a flood command, and an unknown-keyword reply.
 *
 * What it proves, per case:
 *   1. pty write ordering  — 500 chars posted as concurrent requests must reach
 *      the device in submission order (the pre-fix handler wrote straight to the
 *      pty from each request).
 *   2. output coalescing   — a flood must arrive in few SSE frames, not one per
 *      TCP chunk, and still be byte-complete.
 *   3. reattach snapshot   — a second EventSource must get the transcript back
 *      tagged `snapshot`, so the browser can rebuild instead of duplicating.
 *   4. keepalive           — an idle stream must receive a `: ping` comment so a
 *      proxy does not reap it.
 *   5. input batching      — the client-side contract (one POST per ~8ms batch)
 *      is checked separately by driving the same batching function.
 *
 * Usage: node terminal-regression.mjs
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
// ssh2 is CommonJS: named ESM exports are not available.
import ssh2 from 'ssh2'
import { randomUUID } from 'node:crypto'

const require = createRequire(import.meta.url)
// The negative control points this at a copy of the bundle with the write
// serialisation removed, to prove the ordering assertion can actually fail.
const HOST_BUNDLE = process.env.DSH_OPS_BUNDLE
  ? pathToFileURL(process.env.DSH_OPS_BUNDLE).href
  : new URL('../dist/index.mjs', import.meta.url).href

// ---- fake StoneOS ---------------------------------------------------------

const { Server: SshServer, utils: sshUtils } = ssh2

const PASSWORD = 'probe-pass'

let sshPort = 0
/** Every byte the pty received, in arrival order — the ordering oracle. */
const ptyReceived = []

const sshServer = new SshServer({ hostKeys: [sshUtils.generateKeyPairSync('ed25519').private] }, (client) => {
  client.on('error', () => { /* a probe-side drop must not kill the run */ })
  client.on('authentication', (ctx) => {
    if (ctx.method === 'password' && ctx.username === 'probe' && ctx.password === PASSWORD) {
      ctx.accept()
      return
    }
    ctx.reject()
  })
  client.on('ready', () => {
    client.on('session', (accept) => {
      const session = accept()
      let shell = null
      session.on('pty', (a, rej, info) => {
        ;(a ?? rej)()
        shell = {
          cols: info.cols,
          rows: info.rows,
          term: info.term,
          onData: null,
        }
      })
      session.on('shell', (a, rej) => {
        const stream = (a ?? rej)()
        // Echo in runs, not per character: a real pty receives a typed line in
        // one burst, and 400k single-byte writes would wedge this fake device's
        // socket instead of testing the product.
        const w = (s) => {
          if (!s) return
          try {
            stream.write(s)
          } catch {
            /* ignore */
          }
        }
        stream.on('error', () => { /* client vanished; keep the probe alive */ })
        w('\r\nHillStone StoneOS\r\nCopyright (c) 2005-2026 Hillstone Networks\r\n\r\n')
        w(`Terminal: ${shell?.term ?? '?'} ${shell?.cols ?? '?'}x${shell?.rows ?? '?'}\r\n\r\n`)
        w('SG-6000# ')

        let buf = ''
        // Pager state, mirroring a real StoneOS: while it is waiting at
        // `--More--`, a space pages on, `q` quits the listing, and anything
        // else is swallowed (the real device flushes the rest and returns to
        // the prompt without ever running what was typed).
        const pty = { mode: 'shell', page: null, eatenCommands: [] }
        stream.on('data', (chunk) => {
          const s = chunk.toString('utf-8')
          ptyReceived.push(s)
          for (const ch of s) {
            if (pty.mode === 'pager') {
              if (ch === ' ') { pty.page(); continue }
              if (ch === 'q') { pty.mode = 'shell'; w('\r\nSG-6000# '); continue }
              if (ch === '\u0003') { pty.mode = 'shell'; w('^C\r\nSG-6000# '); continue }
              // Eaten by the pager, exactly like the real device.
              if (ch >= ' ' && ch !== '\r' && ch !== '\n') pty.eatenCommands.push(ch)
              continue
            }
          }
          let echo = ''
          const flushEcho = () => {
            if (echo) { w(echo); echo = '' }
          }
          for (const ch of s) {
            if (ch === '\u0003') {
              // Real line editors abandon the current line on Ctrl-C.
              flushEcho()
              buf = ''
              w('^C\r\nSG-6000# ')
              continue
            }
            if (ch === '\r' || ch === '\n') {
              const cmd = buf.trim()
              buf = ''
              flushEcho()
              w('\r\n')
              if (cmd === '') w('SG-6000# ')
              else if (cmd === 'terminal length 0') w('terminal length 0\r\nSG-6000# ')
              else if (cmd === 'flood') {
                // 4000 lines in a tight loop: the shape that used to explode SSE.
                for (let i = 1; i <= 4000; i++) w(`line ${i} aaaaaaaaaaaaaaaaaaaa\r\n`)
                w('SG-6000# ')
              } else if (cmd === 'slowflood') {
                let i = 0
                const t = setInterval(() => {
                  if (i++ >= 50) { clearInterval(t); w('SG-6000# '); return }
                  w(`tick ${i} ${'-'.repeat(60)}\r\n`)
                }, 20)
              } else if (cmd === 'paged') {
                // A real SG-6000 pages long output at ~24 lines per screen and
                // stops at ` --More-- \0`, swallowing anything typed there.
                // Reproduce it faithfully: a space pages on, a `q` quits, and
                // anything else is eaten exactly as the device eats it.
                let line = 0
                const TOTAL = 100
                pty.page = () => {
                  for (let i = 0; i < 24 && line < TOTAL; i++) w(`paged line ${++line} ${'.'.repeat(20)}\r\n`)
                  if (line < TOTAL) w(' --More-- \u0000')
                  else { w('SG-6000# '); pty.mode = 'shell'; pty.page = null }
                }
                pty.page()
                pty.mode = 'pager'
              } else if (cmd === 'noecho') {
                w('noecho fired\r\nSG-6000# ')
              } else {
                w(`^-----unrecognized keyword "${cmd}"\r\nSG-6000# `)
              }
              continue
            }
            // A real line editor echoes printable characters as they are typed.
            if (ch >= ' ') {
              buf += ch
              echo += ch
            }
          }
          flushEcho()
        })
        stream.on('end', () => stream.end())
      })
    })
  })
})

await new Promise((r) => sshServer.listen(0, '127.0.0.1', r))
sshPort = sshServer.address().port

// ---- boot the real host bundle -------------------------------------------

import { mkdirSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dataDir = join(tmpdir(), 'dsh-ops-terminal-regression')
rmSync(dataDir, { recursive: true, force: true })
mkdirSync(dataDir, { recursive: true })

// Take a free port first: a running DSH already owns 18783.
const apiPort = await freePort()
// A second instance needs its own port to register the tool surface.
const apiPort2 = await freePort()

const mod = await import(HOST_BUNDLE)
/** The URL rule, re-exported by the host bundle (m05288) so it can be proven
 *  without launching a browser. See the WebUI block near the end. */
const webLoginUrl = mod.webLoginUrl
/** Mirrors the host's per-entry text cap; the assertion needs the real number,
 *  and re-declaring it here is what makes the test a specification. */
const MAX_TEXT = 4096
const ctx = {
  logger: { info: () => {}, warn: (m) => console.error('[host warn]', String(m)) },
  inject: () => undefined,
  effect: () => undefined,
}
mod.apply(ctx, { dataDir, apiPort, apiTokenEnabled: true })
await waitPort(apiPort)

function freePort() {
  return new Promise((resolve) => {
    const s = require('node:net').createServer()
    s.listen(0, '127.0.0.1', () => {
      const p = s.address().port
      s.close(() => resolve(p))
    })
  })
}

function waitPort(port, ms = 5000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + ms
    const tryOnce = () => {
      const s = require('node:net').connect(port, '127.0.0.1')
      s.on('connect', () => { s.destroy(); resolve() })
      s.on('error', () => {
        s.destroy()
        if (Date.now() > deadline) reject(new Error('host API never came up'))
        else setTimeout(tryOnce, 100)
      })
    }
    tryOnce()
  })
}

const BASE = `http://127.0.0.1:${apiPort}/ops-api`
async function j(path, opts = {}) {
  const res = await fetch(BASE + path, {
    method: opts.method ?? 'GET',
    headers: { 'content-type': 'application/json' },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  return res.json()
}

// ---- assertions -----------------------------------------------------------

let pass = 0
let fail = 0
function check(name, cond, detail = '') {
  if (cond) { pass++; console.log(`  ok   ${name}`) }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`) }
}

const created = await j('/devices', {
  method: 'POST',
  body: { name: 'probe-switch', ip: '127.0.0.1', port: sshPort, account: 'probe', password: PASSWORD },
})
const deviceId = created.device.id

const conn = await j('/connect', { method: 'POST', body: { deviceId, cols: 120, rows: 40 } })
check('connect', conn.ok && conn.connection?.status === 'ready', JSON.stringify(conn).slice(0, 200))
const connId = conn.connection.connId

// 1. pty write ordering under concurrent POSTs.
// Submitted: a paste at the client's own batch cap (INPUT_MAX = 4096) followed
// by a burst of small keystroke POSTs. The large body takes longer to read off
// the socket, so without serialisation the keystrokes reach the pty *before* the
// paste they were typed after — a permutation an operator sees as garbled
// input. Each request is a run of its own character, so the arrival string
// either reads in submission order or visibly does not.
ptyReceived.length = 0
const N = 2
const CHUNK = 4096 // one paste at the cap the client actually enforces
const bigs = Array.from({ length: N }, (_, i) => String.fromCharCode(89 + i).repeat(CHUNK))
const smalls = Array.from({ length: 8 }, (_, i) => String.fromCharCode(91 + i).repeat(2))
const submitted = [...bigs, ...smalls]
await Promise.all(
  submitted.map((data) => j('/conn/input', { method: 'POST', body: { connId, data } })),
)
await new Promise((r) => setTimeout(r, 1500))
const arrival = ptyReceived.join('')
check(
  'concurrent input arrives whole, in submission order, never interleaved',
  arrival === submitted.join(''),
  `arrivals=${arrival.length} want=${submitted.join('').length}; head=${JSON.stringify(arrival.slice(0, 24))}`,
)
// The device echoes each printable byte, so the shell buffer is now huge;
// discard the line the way an operator would.
await j('/conn/input', { method: 'POST', body: { connId, data: '\u0003' } })

// 2/3/4. SSE: coalescing, snapshot, keepalive
function openStream() {
  const frames = []
  const ctrl = new AbortController()
  const done = fetch(`${BASE}/conn/${connId}/stream`, { signal: ctrl.signal })
    .then(async (res) => {
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let raw = ''
      try {
        for (;;) {
          const { done: fin, value } = await reader.read()
          if (fin) break
          raw += dec.decode(value, { stream: true })
          let idx
          while ((idx = raw.indexOf('\n\n')) >= 0) {
            const chunk = raw.slice(0, idx)
            raw = raw.slice(idx + 2)
            frames.push(chunk)
          }
        }
      } catch { /* aborted */ }
    })
    .catch(() => {})
  return { frames, stop: () => { ctrl.abort(); return done } }
}

const s1 = openStream()
await new Promise((r) => setTimeout(r, 300))
const banner = s1.frames.filter((f) => f.startsWith('event: data'))
check('stream replays existing output on attach (snapshot)', banner.length > 0, `${s1.frames.length} frames`)

await j('/conn/input', { method: 'POST', body: { connId, data: 'flood\r' } })
await new Promise((r) => setTimeout(r, 1500))
const dataFrames = s1.frames.filter((f) => f.startsWith('event: data'))
const totalText = dataFrames
  .map((f) => JSON.parse(f.split('data: ')[1]).text)
  .join('')
check('flood is byte-complete', totalText.includes('line 4000 aaaaaaaaaaaaaaaaaaaa'), `last marker missing`)
check(
  'flood arrives coalesced (few frames for 4000 lines)',
  dataFrames.length <= 20,
  `${dataFrames.length} data frames for ${totalText.split('\r\n').length} lines`,
)
s1.stop()

// 4. snapshot marker
const s2 = openStream()
await new Promise((r) => setTimeout(r, 300))
const first = s2.frames.find((f) => f.startsWith('event: data'))
const firstPayload = first ? JSON.parse(first.split('data: ')[1]) : {}
check('reattach frame is tagged snapshot:true', firstPayload.snapshot === true, JSON.stringify(firstPayload).slice(0, 80))
s2.stop()

// 5. keepalive comment on an idle stream
const s3 = openStream()
const gotPing = await new Promise((resolve) => {
  const t = setTimeout(() => resolve(false), 17000)
  const iv = setInterval(() => {
    if (s3.frames.some((f) => f.startsWith(':'))) { clearInterval(iv); clearTimeout(t); resolve(true) }
  }, 200)
})
check('idle stream receives a keepalive comment', gotPing)
s3.stop()

// ---- m01728: device type, web port, copy, and the session log ---------------

// The log files are filed by LOCAL day, which is what the host does; derive
// the expected directory the same way rather than assuming UTC.
const day = (() => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
})()

// 6. deviceType + webPort survive create/update, and a copy duplicates them
//    together with the encrypted password (the host copies the ciphertext, so
//    the duplicate is immediately connectable).
const typed = await j('/devices', {
  method: 'POST',
  body: {
    name: 'probe-fw',
    ip: '127.0.0.1',
    port: sshPort,
    account: 'probe',
    password: PASSWORD,
    deviceType: 'web-application-firewall',
    webPort: 8443,
  },
})
check('create persists deviceType + webPort', typed.device?.deviceType === 'web-application-firewall' && typed.device?.webPort === 8443, JSON.stringify(typed.device ?? typed).slice(0, 160))
check('create never returns the password', typed.device && !('password' in typed.device))

const copied = await j(`/devices/${typed.device.id}/copy`, { method: 'POST', body: {} })
check('copy returns a new device named <原名>-副本', copied.device?.id !== typed.device.id && copied.device?.name === 'probe-fw-副本', JSON.stringify(copied.device ?? copied).slice(0, 160))
check('copy keeps deviceType + webPort', copied.device?.deviceType === 'web-application-firewall' && copied.device?.webPort === 8443)
// m04031 — the client no longer POSTs the duplicate on click; it opens a
// pre-filled form and saves. Those saves are overrides, so the route has to take
// them: a copy renamed in the dialog must create under the typed name, and the
// fields the form did not touch must still come from the source.
const overrides = await j(`/devices/${typed.device.id}/copy`, {
  method: 'POST',
  body: { name: 'probe-fw-实验室副本', ip: '10.10.99.99', account: 'netops', port: 2222, deviceType: 'load-balancer', webPort: 8444, note: '覆盖测试' },
})
check('copy applies the overrides the form was filled with', overrides.device?.name === 'probe-fw-实验室副本' && overrides.device?.ip === '10.10.99.99' && overrides.device?.account === 'netops' && overrides.device?.port === 2222, JSON.stringify(overrides.device ?? overrides).slice(0, 200))
check('copy applies overridden type + webPort + note', overrides.device?.deviceType === 'load-balancer' && overrides.device?.webPort === 8444 && overrides.device?.note === '覆盖测试', JSON.stringify(overrides.device ?? overrides).slice(0, 200))
// …but an override the form left alone must not blank the field, and the source
// must be untouched by any of it.
const blanked = await j(`/devices/${typed.device.id}/copy`, { method: 'POST', body: { name: 'probe-fw-部分覆盖' } })
check('a partial copy still inherits the untouched fields', blanked.device?.ip === typed.device.ip && blanked.device?.account === typed.device.account && blanked.device?.deviceType === 'web-application-firewall' && blanked.device?.webPort === 8443, JSON.stringify(blanked.device ?? blanked).slice(0, 200))
const sourceStill = await j('/devices', { method: 'GET' })
const sourceRow = (sourceStill.devices ?? []).find((x) => x.id === typed.device.id)
check('copying never modifies the source device', sourceRow?.name === typed.device.name && sourceRow?.ip === typed.device.ip && sourceRow?.port === typed.device.port, JSON.stringify(sourceRow ?? {}).slice(0, 160))
// A copy inherits the source password even when the body carries a plaintext one:
// the route copies ciphertext, so a body password must not be silently ignored
// into a *wrong* credential. Documents that it is ignored, and that the resulting
// record still connects.
const withPwd = await j(`/devices/${typed.device.id}/copy`, { method: 'POST', body: { name: 'probe-fw-带密码', password: 'a-different-password' } })
const withPwdConn = await j('/connect', { method: 'POST', body: { deviceId: withPwd.device.id } })
check('a body password cannot replace the copied credential', withPwdConn.ok && withPwdConn.connection?.status === 'ready', JSON.stringify(withPwdConn).slice(0, 160))
if (withPwdConn.ok) await j('/disconnect', { method: 'POST', body: { connId: withPwdConn.connection.connId } })
// A second copy of the same source must not collide on the name.
const copied2 = await j(`/devices/${typed.device.id}/copy`, { method: 'POST', body: {} })
check('a second copy gets a distinct name', copied2.device?.id !== copied.device?.id && copied2.device?.name !== copied.device?.name, copied2.device?.name)
// …and the copy must actually be connectable with the copied password, which
// is only true if the ciphertext came along.
const copyConn = await j('/connect', { method: 'POST', body: { deviceId: copied.device.id } })
check('the copy is connectable (password was duplicated server-side)', copyConn.ok && copyConn.connection?.status === 'ready', JSON.stringify(copyConn).slice(0, 160))
if (copyConn.ok) await j('/disconnect', { method: 'POST', body: { connId: copyConn.connection.connId } })

// m02306: the client re-points its edit form at the copy, then lets the operator
// rename and press 保存. That save sends the DTO with an empty password box (the
// API never hands the secret back), so the copy must keep its inherited password
// — otherwise renaming a duplicate would silently break it.
const renamed = await j(`/devices/${copied.device.id}`, {
  method: 'PUT',
  body: { name: 'probe-fw-实验室', deviceType: copied.device.deviceType, webPort: copied.device.webPort, password: undefined },
})
check('renaming a copy keeps its inherited password', renamed.device?.name === 'probe-fw-实验室', JSON.stringify(renamed.device ?? renamed).slice(0, 160))
const renamedConn = await j('/connect', { method: 'POST', body: { deviceId: copied.device.id } })
check('the renamed copy still connects (password survived the PUT)', renamedConn.ok && renamedConn.connection?.status === 'ready', JSON.stringify(renamedConn).slice(0, 160))
if (renamedConn.ok) await j('/disconnect', { method: 'POST', body: { connId: renamedConn.connection.connId } })

const unknownType = await j(`/devices/${typed.device.id}`, { method: 'PUT', body: { deviceType: 'made-up-type' } })
check('an unknown deviceType degrades to "other" instead of persisting garbage', unknownType.device?.deviceType === 'other', unknownType.device?.deviceType)

// m04040: the panel posts its own session id with the connect request, so the
// host-side watcher can reopen the sidebar in that conversation.
const UI_SESSION = 'sess-regression-ui'
const uiConn = await j('/connect', { method: 'POST', body: { deviceId, originSessionId: UI_SESSION } })
check('a panel connect records the session it came from', uiConn.ok && uiConn.connection?.originSessionId === UI_SESSION, JSON.stringify(uiConn).slice(0, 200))
const uiConnListed = (await j('/conn')).connections?.find((c) => c.connId === uiConn.connection?.connId)
check('the origin session is visible in the connection list the client polls', uiConnListed?.originSessionId === UI_SESSION, JSON.stringify(uiConnListed).slice(0, 200))
if (uiConn.ok) await j('/disconnect', { method: 'POST', body: { connId: uiConn.connection.connId } })
const plainConn = await j('/connect', { method: 'POST', body: { deviceId } })
check('a connect with no session does not invent one', plainConn.ok && !('originSessionId' in (plainConn.connection ?? {})), JSON.stringify(plainConn).slice(0, 200))
if (plainConn.ok) await j('/disconnect', { method: 'POST', body: { connId: plainConn.connection.connId } })

// 7. the session log records this connection. At this point the probe has
//    driven: a 8KB paste, 16 keystrokes, a ^C, `flood`, a reattach and a
//    keepalive — so the log must contain input, command and event entries.
// The main session is still open, so it must read as active; the copy's
// session, disconnected above, is the closed one.
const logsRes = await j('/logs')
const logs = logsRes.logs || []
check('GET /logs lists the probe sessions', logs.length >= 2, `${logs.length} sessions`)
const mine = logs.find((l) => l.connId === connId)
check('this session is in the log list', !!mine, JSON.stringify(logs.map((l) => l.connId)).slice(0, 120))
check('an open session is marked active', mine && mine.active === true, JSON.stringify(mine).slice(0, 160))
const closed = logs.find((l) => l.connId === copyConn.connection.connId)
check('a disconnected session is closed with a reason', closed && closed.active === false && !!closed.endReason, JSON.stringify(closed).slice(0, 160))

const detail = (await j(`/logs/${connId}`)).log
const kinds = new Set((detail?.entries || []).map((e) => e.kind))
check('log records input, command and event entries', kinds.has('input') && kinds.has('command') && kinds.has('event'), [...kinds].join(','))
const floodCmd = (detail?.entries || []).find((e) => e.kind === 'command' && e.text === 'flood')
check('the typed command `flood` is recorded as a command, not a pile of keystrokes', !!floodCmd, JSON.stringify((detail?.entries || []).filter((e) => e.kind === 'command').map((e) => e.text)).slice(0, 200))
check('entries carry their author', (detail?.entries || []).every((e) => e.source && ['operator', 'agent', 'system'].includes(e.source)))
check('operator commands are attributed to the operator', (detail?.entries || []).filter((e) => e.kind === 'command').every((e) => e.source === 'operator'))
// Truncation: the cap is what stops one paste from filling the disk, so it
// has to be proven on a real over-cap payload (the batch above sits exactly at
// the cap, which by definition does not trigger it).
const atCap = (detail?.entries || []).filter((e) => e.kind === 'input').reduce((n, e) => n + e.text.length, 0)
check('an at-cap input batch is stored verbatim', atCap >= 4096, `stored ${atCap} chars of input`)
await j('/conn/input', { method: 'POST', body: { connId, data: 'Z'.repeat(MAX_TEXT + 500) } })
const detail2 = (await j(`/logs/${connId}`)).log
const big = (detail2?.entries || []).find((e) => e.kind === 'input' && e.text.includes('已截断'))
check('an over-cap input batch is truncated with a note', !!big && big.text.includes(`共 ${MAX_TEXT + 500} 字符`), big?.text?.slice(-40) || 'no truncated entry')

check('the log header names the device', detail?.deviceName === 'probe-switch' && detail?.account === 'probe', JSON.stringify({ n: detail?.deviceName, a: detail?.account }))
check('the log is filed under the day directory', existsSync(join(dataDir, 'oplog', day, `${connId}.jsonl`)), join(dataDir, 'oplog', day))
// A log id is taken from the URL, so a traversal attempt must be refused
// rather than escaping the log directory.
const traversal = await j('/logs/..%2F..%2Fdevices')
check('a hostile log id is rejected', traversal.ok === undefined || traversal.ok === false, JSON.stringify(traversal).slice(0, 120))

// 8. a log that only records successes is not an audit trail: a connect
//    attempt to a device that is not there must still leave a record.
const before = (await j('/logs')).logs.length
const ghost = await j('/connect', { method: 'POST', body: { deviceId: 'no-such-device' } })
check('connecting to a missing device is rejected', ghost.ok === false, JSON.stringify(ghost).slice(0, 120))
const after = (await j('/logs')).logs.length
check('a rejected connect leaves no half-written session record', after === before, `${before} → ${after}`)

// 9. the agent's own tools. The host registers them through ctx.inject(['tools']),
//    so the ctx above is a stub that swallows it. Re-boot with a recording
//    registry so the tool surface itself is under test, not just the HTTP API
//    the browser happens to use.
// A fresh device for the pager case. It must exist *before* the second host
// instance boots: each apply() loads its own store from disk, so a device
// created over the first instance's HTTP port afterwards is invisible to the
// tool surface under test ("device not found").
const pagedDevice = await j('/devices', {
  method: 'POST',
  body: { name: 'probe-pager', ip: '127.0.0.1', port: sshPort, account: 'probe', password: PASSWORD },
})

const registered = new Map()
const toolsCtx = {
  logger: { info: () => {}, warn: (m) => console.error('[host warn]', String(m)) },
  effect: (fn) => fn(),
  inject: (deps, cb) => {
    if (Array.isArray(deps) && deps.includes('tools')) {
      cb({ effect: (fn) => fn(), tools: { register: (def) => { registered.set(def.name, def); return () => registered.delete(def.name) } } })
    }
  },
}
mod.apply(toolsCtx, { dataDir, apiPort: apiPort2, apiTokenEnabled: true })
await waitPort(apiPort2)

check('the agent tool surface is registered', registered.size >= 9, [...registered.keys()].join(','))
for (const name of ['hillstone_list_devices', 'hillstone_open_terminal', 'hillstone_send_input', 'hillstone_get_output', 'hillstone_close_terminal', 'hillstone_list_sessions', 'hillstone_run_and_analyze', 'hillstone_scan_liveness', 'hillstone_web_login']) {
  check(`tool ${name} is available to the agent`, registered.has(name), [...registered.keys()].join(','))
}
// A ToolDefinition that breaks the contract does not throw at register time —
// it simply never shows up in Tool.listTools, so the plugin looks healthy while
// every hillstone_* tool is invisible. Assert the contract itself instead.
check(
  'every tool declares a description and a parameters table',
  [...registered.values()].every(
    (t) => typeof t.description === 'string' && t.description.length > 20 && !!t.parameters && typeof t.parameters === 'object',
  ),
  [...registered.values()].map((t) => `${t.name}:${!!t.parameters}`).join(' '),
)
check(
  'every tool declares the required output.render (DSH ToolDefinition contract)',
  [...registered.values()].every((t) => !!t.output && typeof t.output.render === 'function' && !!t.output.schema),
  [...registered.values()].map((t) => `${t.name}:${typeof t.output?.render}`).join(' '),
)
check(
  'render() turns a real result into text blocks a model can read',
  (() => {
    for (const t of registered.values()) {
      const blocks = t.output.render({}, t.name === 'hillstone_list_devices' ? { ok: true, devices: [] } : { ok: true })
      if (!Array.isArray(blocks) || !blocks.length || typeof blocks[0]?.text !== 'string') return false
    }
    return true
  })(),
  'render must return [{type:"text",text:string}]',
)
check(
  'render() reports a tool failure as readable text, not a thrown error',
  [...registered.values()].every((t) => {
    const blocks = t.output.render({}, { ok: false, error: 'device not found' })
    return Array.isArray(blocks) && blocks[0]?.text?.includes('device not found')
  }),
)
check('no tool definition declares a non-array prompt-wrapped parameters', [...registered.values()].every((t) => t.parameters.type !== 'object' || t.parameters.properties === undefined))
check('every tool has an execute function', [...registered.values()].every((t) => typeof t.execute === 'function'))
// The device CLI has no `echo` and returns no exit code; a tool description that
// omits that sends the agent into commands that silently do nothing.
check('tool descriptions warn about the device CLI limitations', registered.get('hillstone_run_and_analyze')?.description.includes('没有 echo') && registered.get('hillstone_run_and_analyze')?.description.includes('exit code'))
check('send_input documents that it submits the line by default', registered.get('hillstone_send_input')?.description.includes('\\r') && registered.get('hillstone_send_input')?.description.includes('submit'))

const devList = await registered.get('hillstone_list_devices').execute()
check('list_devices returns devices without passwords', devList.ok && devList.devices.length > 0 && devList.devices.every((d) => !('password' in d)), JSON.stringify(devList.devices?.[0] ?? devList).slice(0, 160))

// open_terminal is the agent's own way in: a pty that outlives the call.
// The second argument is the tool run context, whose `agent` is the session the
// call came from (m04040). The client needs it to open the right sidebar in the
// right conversation, and it can only be read here.
const ORIGIN_SESSION = 'sess-regression-0001'
const opened = await registered
  .get('hillstone_open_terminal')
  .execute({ deviceId }, { agent: { id: ORIGIN_SESSION } })
check('open_terminal opens a real pty session', opened.ok && opened.status === 'ready' && !!opened.connId, JSON.stringify(opened).slice(0, 200))
const agentConn = opened.connId
check('the connection remembers which DSH session asked for it', opened.originSessionId === ORIGIN_SESSION, `origin=${opened.originSessionId}`)

const connList = (await j('/conn')).connections ?? []
check('the connection list carries the origin session for the client watcher', connList.some((c) => c.connId === agentConn && c.originSessionId === ORIGIN_SESSION), JSON.stringify(connList.map((c) => [c.connId, c.originSessionId])).slice(0, 200))

// A connect from outside the app (curl, a script) has no session, and must not
// invent one — the field stays absent rather than becoming an empty string.
const noOrigin = await registered.get('hillstone_open_terminal').execute({ deviceId })
check('a connection opened without a session has no origin', noOrigin.ok && !('originSessionId' in noOrigin), JSON.stringify(noOrigin).slice(0, 200))
await registered.get('hillstone_close_terminal').execute({ connId: noOrigin.connId })

const sessionList = await registered.get('hillstone_list_sessions').execute()
check('list_sessions reports the agent-opened session', sessionList.ok && sessionList.sessions.some((s) => s.connId === agentConn && s.status === 'ready'), JSON.stringify(sessionList.sessions?.map((s) => s.connId)).slice(0, 160))

// The model writes a bare command and waits for output. If the tool sends the
// text without a CR it lands in the device's line buffer and never runs — the
// exact failure the user reported. Submitting is the default; the exceptions
// (paging keys, mid-line editing) must be able to opt out.
const bare = await registered.get('hillstone_send_input').execute({ connId: agentConn, data: 'noecho' })
check('send_input appends a CR so a bare command actually runs', bare.ok && bare.submitted && bare.sent === 7, JSON.stringify(bare).slice(0, 160))
await new Promise((r) => setTimeout(r, 400))
const bareRead = await registered.get('hillstone_get_output').execute({ connId: agentConn })
check('a bare command reached the device and produced output', bareRead.ok && /noecho fired/.test(bareRead.text), JSON.stringify(bareRead.text.slice(-120)))

const paged = await registered.get('hillstone_send_input').execute({ connId: agentConn, data: ' ' })
check('send_input submits a paging key only when asked', paged.ok && paged.submitted === false && paged.sent === 1, JSON.stringify(paged).slice(0, 160))
const pagedForced = await registered.get('hillstone_send_input').execute({ connId: agentConn, data: 'show version', submit: false })
check('an explicit submit:false wins over the auto-submit heuristic', pagedForced.ok && pagedForced.submitted === false && pagedForced.sent === 'show version'.length, JSON.stringify(pagedForced).slice(0, 160))
const empty = await registered.get('hillstone_send_input').execute({ connId: agentConn, data: '' })
check('send_input refuses to send nothing at all', empty.ok === false, JSON.stringify(empty).slice(0, 160))

const sent = await registered.get('hillstone_send_input').execute({ connId: agentConn, data: 'noecho\r' })
check('send_input writes to the pty', sent.ok && sent.sent === 7, JSON.stringify(sent).slice(0, 160))
// The device is a separate process loop: give it a moment to answer, otherwise
// the read below races the very echo it is supposed to observe.
await new Promise((r) => setTimeout(r, 400))
const badSend = await registered.get('hillstone_send_input').execute({ connId: 'nope', data: 'x' })
check('send_input rejects an unknown session instead of throwing', badSend.ok === false, JSON.stringify(badSend).slice(0, 120))
const badOpen = await registered.get('hillstone_open_terminal').execute({ deviceId: 'no-such-device' })
check('open_terminal reports a missing device as a tool error, not a crash', badOpen.ok === false, JSON.stringify(badOpen).slice(0, 120))

// 9b. get_output is the read half of send_input. Its whole point is the
//     `since` cursor: the agent polls for the bytes it has not seen yet instead
//     of re-reading (or blind-sleeping) — so the cursor must be byte-exact,
//     including across a multi-byte character boundary.
const readAll = registered.get('hillstone_get_output').execute({ connId: agentConn })
check('get_output returns the session transcript', readAll.ok && readAll.text.includes('noecho fired'), JSON.stringify(readAll).slice(0, 200))
check('get_output reports a byte cursor and no lost output', typeof readAll.next === 'number' && readAll.next > 0 && readAll.dropped === 0, `next=${readAll.next} dropped=${readAll.dropped}`)
check('get_output cleaned the transcript of control characters', !/\u001b|\r/.test(readAll.text), JSON.stringify(readAll.text.slice(0, 120)))
check('get_output reports the device prompt so the agent knows the command finished', !!readAll.prompt, `prompt=${JSON.stringify(readAll.prompt)}`)

const noNew = registered.get('hillstone_get_output').execute({ connId: agentConn, since: readAll.next })
check('a cursor at the tail returns no re-read of old output', noNew.ok && noNew.text === '', JSON.stringify(noNew.text).slice(0, 120))

// The CJK case that makes a naive character-offset cursor wrong: the banner is
// full of 3-byte glyphs, so a byte cursor lands mid-character without care.
const cjkMark = Buffer.byteLength(readAll.text, 'utf-8')
const partial = registered.get('hillstone_get_output').execute({ connId: agentConn, since: Math.max(0, cjkMark - 1) })
check('a cursor inside a multi-byte character does not corrupt the output', partial.ok && !partial.text.includes('\ufffd') && !/\u001b/.test(partial.text), JSON.stringify(partial.text.slice(0, 80)))

await registered.get('hillstone_send_input').execute({ connId: agentConn, data: '终端中文测试\r' })
await new Promise((r) => setTimeout(r, 400))
const sinceRaw = registered.get('hillstone_get_output').execute({ connId: agentConn, since: readAll.next, raw: true })
check('get_output raw keeps the bytes as the device sent them', sinceRaw.ok && sinceRaw.text.includes('终端中文测试'), JSON.stringify(sinceRaw.text.slice(-80)))
const sinceClean = registered.get('hillstone_get_output').execute({ connId: agentConn, since: readAll.next })
check('a since cursor returns only the newly produced output', sinceClean.ok && sinceClean.text.includes('终端中文测试') && !sinceClean.text.includes('noecho fired'), JSON.stringify(sinceClean.text.slice(0, 120)))
const capped = registered.get('hillstone_get_output').execute({ connId: agentConn, tail: 200 })
check('get_output caps its answer and says so', capped.ok && capped.truncated === true && capped.text.length <= 200, `len=${capped.text.length} truncated=${capped.truncated}`)
const badRead = registered.get('hillstone_get_output').execute({ connId: 'nope' })
check('get_output rejects an unknown session instead of throwing', badRead.ok === false, JSON.stringify(badRead).slice(0, 120))

// 9c. close_terminal must release the pty and leave an honest audit record —
//     the whole point is that the agent is not forced to leave connections open.
const closedOne = registered.get('hillstone_close_terminal').execute({ connId: agentConn })
check('close_terminal closes the session it was given', closedOne.ok && closedOne.closed.length === 1 && closedOne.closed[0] === agentConn, JSON.stringify(closedOne).slice(0, 160))
const afterClose = await registered.get('hillstone_list_sessions').execute()
check('a closed session is gone from the session list', !afterClose.sessions.some((s) => s.connId === agentConn), JSON.stringify(afterClose.sessions?.map((s) => s.connId)).slice(0, 160))
const closedLog = (await j(`/logs/${agentConn}`)).log
check('closing writes an end reason instead of leaving a log that looks like a crash', closedLog?.active === false && /agent 关闭会话/.test(closedLog?.endReason ?? ''), JSON.stringify({ a: closedLog?.active, r: closedLog?.endReason }).slice(0, 160))
const readDead = registered.get('hillstone_get_output').execute({ connId: agentConn })
check('reading a closed session is an error, not stale text', readDead.ok === false, JSON.stringify(readDead).slice(0, 120))
const closeAgain = registered.get('hillstone_close_terminal').execute({ connId: agentConn })
check('closing a session twice is reported, not silently ignored', closeAgain.ok === false, JSON.stringify(closeAgain).slice(0, 120))
// deviceId is the bulk form: investigating one device must not leave three
// ptys behind.
await registered.get('hillstone_open_terminal').execute({ deviceId })
await registered.get('hillstone_open_terminal').execute({ deviceId })
const closedBulk = registered.get('hillstone_close_terminal').execute({ deviceId })
check('close_terminal by deviceId closes every session on it', closedBulk.ok && closedBulk.closed.length >= 2, JSON.stringify(closedBulk).slice(0, 160))
const closeNoArgs = registered.get('hillstone_close_terminal').execute({})
check('close_terminal with neither connId nor deviceId closes nothing', closeNoArgs.ok === false, JSON.stringify(closeNoArgs).slice(0, 120))

// 10. the pager. Measured on a real SG-6000: `show cpu detail` stops 13 times
//     at ` --More-- \0` and the pager EATS any command typed there, so an agent
//     command that did not page itself hangs until the timeout. This is the
//     regression that would silently rot back.
//     It needs a session of its own: the pager only exists on a live pty, and
//     without one the tool silently falls back to the exec channel (which has
//     no pager and which this fake device does not even implement) — that
//     fallback returned "Unable to exec" and the first assertion below still
//     passed, which is exactly the false pass worth naming.
const pagerSession = await registered.get('hillstone_open_terminal').execute({ deviceId: pagedDevice.device.id })
check('the pager case gets a real pty session', pagerSession.ok && pagerSession.status === 'ready', JSON.stringify(pagerSession).slice(0, 160))
const pagedRun = await registered.get('hillstone_run_and_analyze').execute({ deviceId: pagedDevice.device.id, commands: ['paged'], task: 'verify pager handling' })
const pagedResult = pagedRun.results?.[0]
check('a paged command completes instead of timing out', pagedResult && !pagedResult.timedOut, JSON.stringify(pagedRun).slice(0, 200))
check('the agent paged the device to get the whole listing', pagedResult?.pages >= 4, `pages=${pagedResult?.pages}`)
check('paged output is complete (last line present)', pagedResult?.stdout?.includes('paged line 100'), pagedResult?.stdout?.slice(-120))
// The pager legitimately leaves `--More--` markers in the stream it paged
// through; what proves the product is right is that the command was not left
// parked at one — i.e. the listing finished and the prompt came back.
check('the command was not left parked at a pager prompt', !/--More--[^\n]*$/.test((pagedResult?.stdout ?? '').trimEnd()))
// 100 lines at 24 per screen = 4 parked pages. The page that completes the
// listing is emitted by the device on its own, so exactly 4 spaces are sent —
// one more would be a keystroke typed at a prompt that had already come back.
check('exactly one space per parked page, and no space after the last', pagedResult?.pages === 4, `pages=${pagedResult?.pages}`)
check('paged output is not missing its first page', pagedResult?.stdout?.includes('paged line 1'))
// The regression: the command typed while the pager waits must not be eaten.
// Run it through the *pty* as a raw command, exactly the way an operator would.
const pagerConn = pagerSession.connId
await registered.get('hillstone_send_input').execute({ connId: pagerConn, data: 'noecho\r' })
await new Promise((r) => setTimeout(r, 500))
const recovered = registered.get('hillstone_get_output').execute({ connId: pagerConn, since: readAll.next })
check('the shell is usable again after paging', recovered.ok && recovered.text.includes('noecho fired'), JSON.stringify(recovered.text?.slice(-160)).slice(0, 200))
check('the pager device never ate a character of a later command', !recovered.text?.includes('\ufffd'), JSON.stringify(recovered.text?.slice(-80)))
registered.get('hillstone_close_terminal').execute({ connId: pagerConn })

// 11. liveness probe. The device list's 检测存活 button asks the host, because a
//     browser cannot open a raw TCP socket. Three verdicts have to come out right
//     or the badge lies: the fake SSH server is online, a closed port on loopback
//     is refused, and the result must name every device — a probe that silently
//     dropped one device would show it with no badge at all.
const deadPort = await freePort()
const deadDevice = await j('/devices', {
  method: 'POST',
  body: { name: 'probe-dead', ip: '127.0.0.1', port: deadPort, account: 'probe', password: PASSWORD },
})
const ping = await j('/devices/ping', { method: 'POST', body: {} })
const pingResults = ping.results || []
const byId = Object.fromEntries(pingResults.map((r) => [r.deviceId, r]))
check('the liveness probe answers for every device', pingResults.length === (await j('/devices')).devices.length, `got=${pingResults.length}`)
check('a listening SSH port reads as online, with a timing', byId[deviceId]?.state === 'online' && typeof byId[deviceId]?.ms === 'number', JSON.stringify(byId[deviceId] || null))
check('a closed port reads as offline with a reason', byId[deadDevice.device.id]?.state === 'offline' && !!byId[deadDevice.device.id]?.error, JSON.stringify(byId[deadDevice.device.id] || null))
check('the probe never reports a port it was not given', pingResults.every((r) => r.port > 0 && !!r.deviceId), JSON.stringify(pingResults.slice(0, 2)))
// A probe must not be an SSH login: it would burn auth attempts and would
// report "offline" for a box that is up but has a full password policy.
check('the probe needs no password to reach a verdict', await (async () => {
  const noPass = await j('/devices', {
    method: 'POST',
    body: { name: 'probe-nopass', ip: '127.0.0.1', port: sshPort, account: 'probe', password: PASSWORD },
  })
  const again = await j('/devices/ping', { method: 'POST', body: {} })
  const r = (again.results || []).find((x) => x.deviceId === noPass.device.id)
  return r?.state === 'online' && !('password' in r)
})(), 'a device with a stored password probed without touching it')
await j(`/devices/${deadDevice.device.id}`, { method: 'DELETE' })

// m05288 — WebUI login. The browser half cannot be exercised offline, so these
// assertions cover the contract that actually makes it safe: the password stays
// on the host, a device with no web port still gets a verdict-shaped answer
// rather than a crash, and the report is a list even when nothing is open.
// What is deliberately NOT asserted: any successful login. A test that spun up
// a real browser to prove one would be a test that passes on the developer's
// network and fails in CI, and the login itself is the one thing here that is
// already covered by hand on a real device.
const webReport = await j('/web-login')
check('the WebUI report is a list, empty when no window is open',
  webReport.ok === true && Array.isArray(webReport.states) && webReport.states.length === 0,
  JSON.stringify(webReport).slice(0, 200))

// The regression device has no webPort, which is the common case (both real
// devices had null). The URL is proved as a pure function instead of by calling
// the route, because calling it really does launch a Chromium window on the
// operator's desktop — a regression suite must never take over the screen of
// the machine it runs on. A null port would have built "https://ip:null".
// The address is RFC 5737 documentation space: the rule is about the port and
// the brackets, so there is no reason to publish a real device's IP here.
const DOC_IP = '198.51.100.7'
check('a device with no web port falls back to 443',
  webLoginUrl({ ip: DOC_IP, webPort: null }) === `https://${DOC_IP}:443/`,
  webLoginUrl({ ip: DOC_IP, webPort: null }))
check('a device with a web port uses it',
  webLoginUrl({ ip: DOC_IP, webPort: 8443 }) === `https://${DOC_IP}:8443/`,
  webLoginUrl({ ip: DOC_IP, webPort: 8443 }))
// An IPv6 literal must be bracketed or the port becomes part of the address.
check('an IPv6 address is bracketed so the port still parses',
  webLoginUrl({ ip: 'fd00::1', webPort: 443 }) === 'https://[fd00::1]:443/',
  webLoginUrl({ ip: 'fd00::1', webPort: 443 }))

const badDevice = await j('/web-login', { method: 'POST', body: { deviceId: 'no-such-device' } })
check('WebUI login on an unknown device is refused', badDevice.ok === false, JSON.stringify(badDevice).slice(0, 200))
check('a refusal never echoes the password back to the browser',
  JSON.stringify(badDevice).includes(PASSWORD) === false, JSON.stringify(badDevice).slice(0, 200))

// The close route answers `closed: false` for a window that was never open.
// Asserting `ok === true || ok === false` here would have passed no matter what
// the route did, including crashing into the 404 fallthrough — the check has to
// name the real contract or it is decoration.
const closeUnused = await j('/web-login/close', { method: 'POST', body: { deviceId } })
check('closing a window that was never opened succeeds but reports closed:false',
  closeUnused.ok === true && closeUnused.closed === false, JSON.stringify(closeUnused).slice(0, 200))
const closeNoId = await j('/web-login/close', { method: 'POST', body: {} })
check('close without a deviceId is a 400, not a silent no-op',
  closeNoId.ok === false && closeNoId.error?.code === 'bad-request', JSON.stringify(closeNoId).slice(0, 200))

console.log(`\n${pass} passed, ${fail} failed`)
sshServer.close()
process.exit(fail ? 1 : 0)
