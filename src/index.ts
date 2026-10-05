// dsh-hillstone-cli-ops — host half (Node).
//
// Responsibilities:
//   1. Persist managed devices as JSON (<dataDir>/devices.json). Passwords are
//      encrypted with AES-256-GCM using a local key file so they never sit in
//      plaintext on disk and are never returned to the browser.
//   2. Self-host a loopback HTTP API at /ops-api/* (CORS-enabled) that the
//      browser half calls via an absolute http://127.0.0.1:<port> URL. This is
//      the proven client<->host bridge (mirrors dsh-knowledge-base).
//   3. Bridge live SSH sessions (ssh2) for the terminal: client input is POSTed,
//      device output is streamed back via Server-Sent Events.
//   4. Run commands and analyze output with the host LLM service (ctx.inject
//      ['llm']), exposed both through the HTTP API and as a host agent tool
//      `hillstone_run_and_analyze`.
//
// Everything is wrapped so an unexpected host capability never marks the fiber
// `failed` — a degraded plugin that logs a warning beats one the GUI reports as
// 启动异常.

import { randomUUID, randomBytes, createCipheriv, createDecipheriv, timingSafeEqual } from 'node:crypto'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  existsSync,
  readdirSync,
  appendFileSync,
  statSync,
  unlinkSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import net from 'node:net'
import type { Client as SshClient } from 'ssh2'

// ssh2 is externalized in the host build, so it resolves from node_modules.
import { Client as SSHClient } from 'ssh2'

import type {
  Device,
  DeviceDTO,
  DeviceInput,
  DeviceLiveness,
  ConnectionInfo,
  AnalyzeRequest,
  AnalyzeResponse,
  CommandResult,
  LogEntry,
  LogKind,
  SessionLog,
  SessionLogDetail,
} from './types.ts'
import { normalizeDeviceType } from './types.ts'
import {
  SessionLogWriter,
  ensureLogDir,
  listSessionLogs,
  logRoot,
  pruneLogs,
  readSessionLog,
} from './session-log.ts'

export const name = 'dsh-hillstone-cli-ops'
export const inject: readonly string[] = []

// ---- configuration ---------------------------------------------------------

export interface Config {
  /** Directory for devices.json + the encryption key. Defaults to profile data dir. */
  dataDir: string
  /** Fixed loopback port for the self-hosted /ops-api server. */
  apiPort: number
  /**
   * Require a bearer token on every functional /ops-api route. ON by default:
   * the loopback API is otherwise reachable from any web page the user visits
   * while the harness is running.
   */
  apiTokenEnabled: boolean
}

export const DEFAULT_CONFIG: Config = {
  dataDir: '',
  apiPort: 18783,
  apiTokenEnabled: true,
}

// Host LLM contract (mirrors dsh-knowledge-base's probing).
interface DshLlmRuntime {
  stream(options: {
    provider: string
    model: string
    messages: { role: string; content: { type: 'text'; text: string }[] }[]
    temperature?: number
    maxTokens?: number
    signal?: AbortSignal
  }): AsyncIterable<{ type: string; text?: string; reason?: { kind: string; failure?: { code?: string; message?: string } } }>
  listProviders?(): { id: string; name: string }[]
}

function resolveConfig(config?: Partial<Config>, profileDataDir?: string): Config {
  const dataDir =
    config?.dataDir ||
    process.env.DSH_HILLSTONE_DATA_DIR ||
    (profileDataDir ? profileDataDir.replace(/[\\/]+$/, '') + '/hillstone' : '') ||
    join(homedir(), '.dsh', 'dsh-hillstone-cli-ops')
  return {
    dataDir,
    apiPort: config?.apiPort ?? DEFAULT_CONFIG.apiPort,
    apiTokenEnabled: config?.apiTokenEnabled ?? DEFAULT_CONFIG.apiTokenEnabled,
  }
}

// ---- crypto ----------------------------------------------------------------

const ALGO = 'aes-256-gcm'
const KEY_FILE = 'ops.key'

function keyPath(dir: string): string {
  return join(dir, KEY_FILE)
}

/** Load or mint the AES key. Best-effort: a missing key dir is created. */
function loadKey(dir: string): Buffer {
  const p = keyPath(dir)
  if (existsSync(p)) {
    try {
      return readFileSync(p)
    } catch {
      /* fall through to mint */
    }
  }
  const key = randomBytes(32)
  try {
    mkdirSync(dir, { recursive: true })
    writeFileSync(p, key, { mode: 0o600 })
  } catch {
    /* key stays in memory only; encryption still works this session */
  }
  return key
}

function encryptSecret(key: Buffer, plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, key, iv)
  const enc = Buffer.concat([cipher.update(plaintext, 'utf-8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // store as base64: iv(12) | tag(16) | ciphertext
  return Buffer.concat([iv, tag, enc]).toString('base64')
}

function decryptSecret(key: Buffer, payload: string): string {
  const raw = Buffer.from(payload, 'base64')
  const iv = raw.subarray(0, 12)
  const tag = raw.subarray(12, 28)
  const enc = raw.subarray(28)
  const decipher = createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf-8')
}

// ---- device store ----------------------------------------------------------

const DEVICES_FILE = 'devices.json'

interface Store {
  dir: string
  key: Buffer
  devices: Map<string, Device>
  /** Root for the per-connection audit trail; see src/session-log.ts. */
  logDir: string
}

function loadStore(dir: string, key: Buffer): Store {
  const map = new Map<string, Device>()
  const file = join(dir, DEVICES_FILE)
  if (existsSync(file)) {
    try {
      const arr = JSON.parse(readFileSync(file, 'utf-8')) as Device[]
      for (const d of arr) {
        // Devices saved before deviceType/webPort existed still have to load.
        map.set(d.id, { ...d, deviceType: normalizeDeviceType(d.deviceType) })
      }
    } catch {
      /* corrupt — start fresh rather than crash */
    }
  }
  const logDir = logRoot(dir)
  ensureLogDir(logDir)
  return { dir, key, devices: map, logDir }
}

function persistStore(store: Store): void {
  try {
    mkdirSync(store.dir, { recursive: true })
    const tmp = join(store.dir, DEVICES_FILE + '.tmp')
    const arr = [...store.devices.values()]
    writeFileSync(tmp, JSON.stringify(arr, null, 2), 'utf-8')
    renameSync(tmp, join(store.dir, DEVICES_FILE))
  } catch (e) {
    console.warn('[dsh-hillstone-cli-ops] persist devices failed:', (e as Error).message)
  }
}

function toDTO(d: Device): DeviceDTO {
  const { password: _pw, ...rest } = d
  return rest
}

// ---- SSH bridge ------------------------------------------------------------

interface SshSession {
  connId: string
  deviceId: string
  deviceName: string
  client: SshClient
  shell?: any
  createdAt: string
  status: ConnectionInfo['status']
  error?: string
  /** SSE response objects subscribed to this session's output. */
  clients: Set<ServerResponse>
  /**
   * Ordered log of everything the device has sent on this shell. The agent
   * reads from here to capture command output, so output it collects is the
   * very same bytes the operator watches scroll in the terminal — one
   * transcript, two readers.
   */
  outputLog: string
  /**
   * Total bytes ever received on this shell, including output the cap above has
   * already dropped. This is the only stable cursor: `outputLog` gets re-sliced
   * when it overflows, so an offset into it is not comparable across calls.
   */
  outputBytes: number
  /**
   * The most recent prompt the shell printed (e.g. "SG-6000# "). Hillstone
   * StoneOS has no `echo` command, so a returned prompt is the only reliable
   * "the command finished" signal we get.
   */
  lastPrompt: string
  /** Serialises agent + operator writes so captures don't interleave. */
  busy: Promise<unknown>
  /**
   * Single-chain mutex for raw pty writes. Separate from `busy` (which orders
   * whole agent commands): every keystroke and every agent command goes through
   * this tail, so a burst of POSTs from the browser can never write to the pty
   * out of order. Same single-chain shape as `busy` — never read-modify-write.
   */
  writeQueue: Promise<unknown>
  /** Window size currently advertised to the device, for `setWindow`. */
  cols: number
  rows: number
  /** True while the agent is driving this shell, for a UI "agent is working" hint. */
  agentActive: boolean
  /** Pending terminal bytes not yet flushed to SSE clients (see `broadcast`). */
  dataBuf: string
  /** Coalescing timer for `dataBuf`; one SSE frame per tick, not per TCP chunk. */
  flushTimer?: ReturnType<typeof setTimeout>
  /** SSE keepalive timer, so an idle terminal is not reaped as a dead socket. */
  pingTimer?: ReturnType<typeof setInterval>
  /**
   * Audit trail for this connection (see src/session-log.ts). Created when the
   * connect request arrives, not when the shell opens, so a failed
   * authentication is on record too.
   */
  log: SessionLogWriter
}

/** How long terminal bytes are batched before becoming one SSE frame (~1 frame). */
const SSE_FLUSH_MS = 16
/** Idle SSE keepalive comment. */
const SSE_PING_MS = 15_000
/**
 * Upper bound on bytes replayed to a terminal that (re)attaches to a live
 * session. A `show tech-support` dump can be megabytes; the browser only needs
 * enough to rebuild a readable scrollback.
 */
const SNAPSHOT_MAX_BYTES = 128 * 1024

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(n)))
}

const sessions = new Map<string, SshSession>()

function writeFrame(res: ServerResponse, event: string, data: unknown): void {
  try {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  } catch {
    /* client gone */
  }
}

function broadcast(session: SshSession, event: string, data: unknown): void {
  for (const res of session.clients) writeFrame(res, event, data)
}

/**
 * One SSE frame per animation window, not one per TCP chunk.
 *
 * A device flushing a table or a `show tech-support` dump delivers hundreds of
 * small chunks per second. Writing a frame for each one made the browser render
 * far more often than the screen refreshes, which showed up as lag and dropped
 * input. Bytes are appended to `dataBuf` here and flushed once per
 * `SSE_FLUSH_MS`, so the terminal still updates at ~60fps but with one write.
 */
function flushOutput(session: SshSession): void {
  session.flushTimer = undefined
  if (!session.dataBuf) return
  const text = session.dataBuf
  session.dataBuf = ''
  broadcast(session, 'data', { text })
}

function scheduleFlush(session: SshSession): void {
  if (session.flushTimer) return
  session.flushTimer = setTimeout(() => flushOutput(session), SSE_FLUSH_MS)
}

/**
 * Write bytes to the pty in submission order.
 *
 * The browser batches keystrokes, but a batch is still several concurrent HTTP
 * requests, and nothing about `fetch` preserves their arrival order at the
 * server. Writing straight to the pty from each handler let a fast typist's
 * characters reach the device shuffled. Appending each write to a single-chain
 * tail (the same shape as `busy`, never read-modify-write) makes the pty see
 * them in the order the operator typed them, whatever the network did.
 *
 * Returns a promise for the caller to report a failed write.
 */
function enqueueWrite(session: SshSession, data: string): Promise<void> {
  const write = (): Promise<void> =>
    new Promise<void>((resolve, reject) => {
      try {
        session.shell?.write(data)
        resolve()
      } catch (e) {
        reject(e as Error)
      }
    })
  const result = session.writeQueue.then(write, write)
  session.writeQueue = result.then(
    () => {},
    () => {},
  )
  return result
}

/**
 * Echo a line to the operator's terminal *without sending it to the device*.
 *
 * This deliberately does not go through `feedOutput`, so it never lands in
 * `outputLog` and never pollutes the transcript the LLM analyses. StoneOS's
 * line editor misparses raw ANSI bytes typed at the prompt — writing an
 * ESC-coloured marker into the shell made it answer
 * `^-----unrecognized keyword` and treat the marker as a command (verified on
 * a real SG-6000-VM00). The UI can still colour it, because the SSE payload
 * carries literal escape sequences to the browser while the pty stays clean.
 */
function echoToOperators(session: SshSession, line: string): void {
  // Drain pending device output first: the marker is an annotation *about* that
  // output, so putting it in front of the bytes it refers to reads out of order.
  flushOutput(session)
  broadcast(session, 'data', { text: line })
}

/**
 * Hillstone StoneOS prompts. The shell prints these between commands, which is
 * how we detect that an agent-issued command has finished (the box has no
 * `echo`, so we cannot inject a sentinel marker). Generous on purpose: we only
 * need the *end* of the line to look like a prompt.
 */
const PROMPT_RE = /(?:#|\$|>)\s*$/

/**
 * StoneOS paginates long output and stops at `--More--`, waiting for a keypress.
 * Measured on a real SG-6000: `show cpu detail` produced 13 `--More--` stops
 * (9172 chars), each emitted as ` --More-- ` followed by a NUL, and the pager
 * swallows any command typed at that point — it just flushes the rest and
 * returns to the prompt, so the command never runs.
 *
 * There is deliberately no `terminal length 0` on connect: the SG-6000 rejects
 * it with `^-----unrecognized keyword` and paginates anyway. Paging has to be
 * answered where it happens, so the agent must be able to page itself. Without
 * this, any command longer than a page hangs until the timeout and returns a
 * truncated result.
 *
 * The trailing NUL matters: the marker is ` --More-- \0`, so match on it
 * rather than on a bare `--More--` substring that could appear in real output.
 */
const PAGER_RE = /--More--[ \t]*[\u0000]?\s*$/

/** Ceiling on automatic paging, so a stuck pager cannot spin forever. */
const PAGER_MAX_PAGES = 400


/** connIds of sessions the agent is currently driving, for UI indication. */
function busySessions(): string[] {
  const out: string[] = []
  for (const s of sessions.values()) if (s.agentActive) out.push(s.connId)
  return out
}

/**
 * TCP reachability probe for one device's SSH port (m03664).
 *
 * Deliberately a bare TCP handshake, not an SSH connection: the question the
 * device list asks is "is this box up and is the port open", and a real SSH
 * handshake would also be slow and would burn auth attempts on boxes that are
 * up but misconfigured. It resolves for every outcome — nothing here throws —
 * because one unreachable device must not abort the report for the other 19.
 *
 * The 3s ceiling matters: a filtered port usually blackholes the SYN, so without
 * a timeout the scan of 20 devices would hang for the OS default (minutes).
 */
const PING_TIMEOUT_MS = 3000
function probeTcp(ip: string, port: number): Promise<{ ms?: number; error?: string }> {
  return new Promise((resolve) => {
    const started = Date.now()
    let settled = false
    const done = (r: { ms?: number; error?: string }) => {
      if (settled) return
      settled = true
      try { socket.destroy() } catch { /* ignore */ }
      resolve(r)
    }
    const socket = net.connect({ host: ip, port })
    socket.setTimeout(PING_TIMEOUT_MS)
    socket.once('connect', () => done({ ms: Date.now() - started }))
    // The three failure modes read very differently to an operator, so keep
    // them apart: 'refused' means the host is up with nothing listening (a real
    // misconfiguration), 'timeout' means something dropped the packet (a
    // firewall), and DNS/unreachable means the address itself is wrong.
    socket.once('error', (err: NodeJS.ErrnoException) => {
      done({ error: err.code === 'ECONNREFUSED' ? 'refused' : err.code === 'ETIMEDOUT' ? 'timeout' : (err.code || err.message) })
    })
    socket.once('timeout', () => done({ error: 'timeout' }))
  })
}

/** Probe every device concurrently and return one verdict per device. */
async function scanLiveness(list: Device[]): Promise<DeviceLiveness[]> {
  return Promise.all(list.map(async (d): Promise<DeviceLiveness> => {
    const r = await probeTcp(d.ip, d.port)
    return {
      deviceId: d.id,
      ip: d.ip,
      port: d.port,
      state: r.ms === undefined ? 'offline' : 'online',
      ...(r.ms !== undefined ? { ms: r.ms } : {}),
      ...(r.error ? { error: r.error } : {}),
    }
  }))
}

/** Append device output to the session log and fan it out to SSE clients. */
function feedOutput(session: SshSession, text: string): void {
  session.outputLog += text
  // Bound the log: a long `show tech-support` style dump must not grow forever.
  if (session.outputLog.length > 512 * 1024) {
    session.outputLog = session.outputLog.slice(-256 * 1024)
  }
  // A monotonically growing byte count, so a reader can tell how much output
  // has been dropped by the cap above and can page through the history with
  // `since`. Comparing string offsets would be wrong: the cap re-slices the
  // buffer, which shifts every offset a later reader is holding.
  session.outputBytes += Buffer.byteLength(text, 'utf-8')
  const tail = session.outputLog.slice(-256).replace(/\s+$/, '')
  const m = tail.match(/(?:^|[\r\n])([^\r\n]*[#>$][^\r\n]*)$/)
  if (m && PROMPT_RE.test(m[1])) session.lastPrompt = m[1]
  // Deferred to the flush window so prompt detection and the browser see the
  // same batch, and a burst of chunks costs one frame.
  session.dataBuf += text
  scheduleFlush(session)
}

/** Connect to a device and open a shell; resolves with connection info. */
function connectDevice(
  store: Store,
  deviceId: string,
  size?: { cols?: number; rows?: number },
): Promise<ConnectionInfo> {
  const device = store.devices.get(deviceId)
  if (!device) return Promise.reject(new Error('device not found'))
  const connId = randomUUID()
  const client = new SSHClient()
  const session: SshSession = {
    connId,
    deviceId,
    deviceName: device.name,
    client,
    createdAt: new Date().toISOString(),
    status: 'connecting',
    clients: new Set(),
    outputLog: '',
    outputBytes: 0,
    lastPrompt: '',
    busy: Promise.resolve(),
    writeQueue: Promise.resolve(),
    cols: clamp(size?.cols ?? 120, 20, 500),
    rows: clamp(size?.rows ?? 40, 10, 300),
    agentActive: false,
    dataBuf: '',
    // Opened before the SSH handshake so an unreachable device, a bad password
    // and a refused port are all on record — a log that only records successes
    // is not an audit trail.
    log: new SessionLogWriter(store.logDir, {
      connId,
      deviceId,
      deviceName: device.name,
      deviceType: device.deviceType,
      account: device.account,
      ip: device.ip,
      port: device.port || 22,
    }),
  }
  sessions.set(connId, session)

  return new Promise<ConnectionInfo>((resolve, reject) => {
    const fail = (err: Error) => {
      session.status = 'error'
      session.error = err.message
      broadcast(session, 'status', { status: 'error', error: err.message })
      session.log.event(`连接失败：${err.message}`)
      cleanup(session)
      reject(err)
    }
    client.on('error', fail)
    client.on('close', () => {
      session.status = 'closed'
      broadcast(session, 'status', { status: 'closed' })
      cleanup(session)
    })
    let password: string
    try {
      password = decryptSecret(store.key, device.password)
    } catch (e) {
      fail(new Error('密码解密失败：' + (e as Error).message))
      return
    }
    client.connect({
      host: device.ip,
      port: device.port || 22,
      username: device.account,
      password,
      // Let ssh2 negotiate with the server's supported algorithms (Hillstone
      // firewalls vary in their kex/cipher support; forcing defaults is wrong).
      keepaliveInterval: 15000,
      readyTimeout: 20000,
    })
    client.on('ready', () => {
      // Give the device a real window size. Without rows/cols, StoneOS falls
      // back to its built-in pager and stops every long command at `--More--`,
      // which looks like the terminal is hanging.
      const cols = clamp(size?.cols ?? 120, 20, 500)
      const rows = clamp(size?.rows ?? 40, 10, 300)
      client.shell({ term: 'xterm-256color', cols, rows, width: 0, height: 0 }, (err, shell) => {
        if (err) {
          fail(err)
          return
        }
        session.shell = shell
        session.status = 'ready'
        session.cols = cols
        session.rows = rows
        session.log.event(`已连接 ${device.name}（${device.account}@${device.ip}:${device.port || 22}），窗口 ${cols}x${rows}`)
        broadcast(session, 'status', { status: 'ready' })
        shell.on('data', (chunk: Buffer) => feedOutput(session, chunk.toString('utf-8')))
        shell.stderr.on('data', (chunk: Buffer) => feedOutput(session, chunk.toString('utf-8')))
        shell.on('close', () => {
          session.status = 'closed'
          session.log.event('会话被设备关闭')
          broadcast(session, 'status', { status: 'closed' })
        })
        // Deliberately NOT sending `terminal length 0` here. On the SG-6000 it
        // is not accepted — the device answers with `^-----unrecognized
        // keyword` and keeps paginating, so every session's first screen of
        // output carried a bogus error. Paging is handled where it actually
        // happens instead: runCommandInSession and the UI both answer a
        // `--More--` with a space.
        resolve({
          connId,
          deviceId,
          deviceName: device.name,
          status: 'ready',
          createdAt: session.createdAt,
        })
      })
    })
  })
}

function cleanup(session: SshSession, reason = '会话已关闭'): void {
  if (session.flushTimer) clearTimeout(session.flushTimer)
  session.flushTimer = undefined
  session.dataBuf = ''
  // Close the audit record last, so it includes the teardown it describes.
  session.log.event(reason)
  session.log.close(reason)
  for (const res of session.clients) {
    try {
      res.end()
    } catch {
      /* ignore */
    }
  }
  session.clients.clear()
  try {
    session.client.end()
  } catch {
    /* ignore */
  }
  sessions.delete(session.connId)
}

/**
 * The newest live, ready shell for a device — the one an operator is most
 * likely watching. Sessions are created in order, so the last match is the
 * most recent connection.
 */
function findLiveSession(deviceId: string): SshSession | undefined {
  let found: SshSession | undefined
  for (const s of sessions.values()) {
    if (s.deviceId !== deviceId) continue
    if (s.status !== 'ready' || !s.shell) continue
    found = s
  }
  return found
}

/**
 * Strip the shell decorations a StoneOS pty wraps around command output:
 * the echoed command, backspace over-strikes used to position the caret, and
 * ANSI colour. What is left is the text an operator reads.
 */
function cleanPtyText(raw: string): string {
  return raw
    .replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '')
    .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '')
    .replace(/\x1b[=>]/g, '')
    .replace(/\x1b\[\d+;?\d*m\[90m\[agent\][^\n]*/g, '')
    .replace(/\r(?!\n)/g, '\n')
    .split('\n')
    .map((line) => {
      // A pty redraws the prompt with backspaces over the echoed command.
      let out = ''
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '\b') {
          out = out.slice(0, -1)
          continue
        }
        out += line[i]
      }
      return out.replace(/\s+$/, '')
    })
    .filter((line) => !/^\[agent\] /.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Run a command over an operator's live shell, so its output scrolls on screen. */
function runCommandInSession(
  session: SshSession,
  command: string,
  timeoutMs: number,
): Promise<CommandResult> {
  // Single-chain mutex. Each call appends itself to the session's tail promise
  // instead of reading-then-writing `session.busy`: with the old read-modify-write
  // shape two arrivals both chained onto the *same* already-resolved promise and
  // ran concurrently, splicing their writes into each other's output.
  const run = (): Promise<CommandResult> =>
    new Promise<CommandResult>((resolve) => {
      const mark = session.outputLog.length
      let done = false
      let pages = 0
      let poll: ReturnType<typeof setInterval> | undefined
      let hardStop: ReturnType<typeof setTimeout> | undefined

      const finish = (timedOut: boolean) => {
        if (done) return
        done = true
        if (poll) clearInterval(poll)
        if (hardStop) clearTimeout(hardStop)
        session.agentActive = false
        broadcast(session, 'agent', { active: false, command, timedOut })
        resolve({
          command,
          exitCode: null,
          stdout: cleanPtyText(session.outputLog.slice(mark)),
          stderr: '',
          timedOut,
          viaSession: session.connId,
          // Tell the caller we paged, so a truncated-but-timedOut result is not
          // the only signal that the pager fought us.
          ...(pages ? { pages } : {}),
        })
      }

      // Make the agent's work legible in the operator's scrollback. The marker
      // goes only to the browsers; the device receives nothing but the command.
      echoToOperators(session, `\r\n\x1b[90m[agent] ${command}\x1b[0m\r\n`)
      // An agent-driven command is an operator-visible action on a production
      // device, so it belongs in the same audit trail as what was typed.
      session.log.agentCommand(command)
      // Share the pty write chain with keystrokes: an agent command must not
      // land between two halves of what the operator was typing, and two agent
      // commands must not interleave their line endings.
      enqueueWrite(session, `${command}\r`).then(
        () => {
          if (done) return
          session.agentActive = true
          broadcast(session, 'agent', { active: true, command })
          // The box has no `echo`, so the returning prompt is our only
          // completion signal.
          poll = setInterval(() => {
            const since = session.outputLog.slice(mark)
            // A pager stop means the command is not finished: page it and keep
            // waiting. Checking the pager first matters — the prompt regex would
            // never match mid-page, so the two checks are independent, but the
            // pager is the one that needs an action, not just an observation.
            if (PAGER_RE.test(since.replace(/\s+$/, '')) && pages < PAGER_MAX_PAGES) {
              pages++
              // Space is the universal "show me more" key. It goes through the
              // same write chain as every other keystroke, so it cannot land
              // inside a half-typed operator line.
              enqueueWrite(session, ' ')
              return
            }
            if (promptReturned(since)) finish(false)
          }, 100)
          hardStop = setTimeout(() => finish(true), timeoutMs)
        },
        () => finish(true),
      )
    })

  // Chain on both settle paths so a prior failure cannot wedge the queue, and
  // keep a never-rejecting tail so the next caller can always attach.
  const result = session.busy.then(run, run)
  session.busy = result.then(
    () => {},
    () => {},
  )
  return result.catch(() => ({
    command,
    exitCode: null,
    stdout: '',
    stderr: 'session unavailable',
    timedOut: true,
  }))
}

/** True once `text` ends with a device prompt (the command has finished). */
function promptReturned(text: string): boolean {
  const tail = text.slice(-128).replace(/\s+$/, '')
  if (!tail) return false
  const m = tail.match(/(?:^|[\r\n])([^\r\n]*)$/)
  if (!m) return false
  return PROMPT_RE.test(m[1])
}

/** Run one command on a fresh SSH channel and collect its output. */
async function runCommand(
  store: Store,
  deviceId: string,
  command: string,
  timeoutMs: number,
): Promise<CommandResult> {
  const device = store.devices.get(deviceId)
  if (!device) throw new Error('device not found')
  const password = decryptSecret(store.key, device.password)
  const client = new SSHClient()
  return new Promise<CommandResult>((resolve, reject) => {
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      try {
        client.end()
      } catch {
        /* ignore */
      }
      resolve({ command, exitCode: null, stdout: '', stderr: '', timedOut: true })
    }, timeoutMs)
    client.on('error', (err) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(err)
    })
    client.connect({
      host: device.ip,
      port: device.port || 22,
      username: device.account,
      password,
      keepaliveInterval: 15000,
      readyTimeout: 20000,
    })
    client.on('ready', () => {
      client.exec(command, { pty: true }, (err, stream) => {
        if (err) {
          settled = true
          clearTimeout(timer)
          try {
            client.end()
          } catch {
            /* ignore */
          }
          reject(err)
          return
        }
        let stdout = ''
        let stderr = ''
        let exitCode: number | null = null
        stream.on('data', (d: Buffer) => (stdout += d.toString('utf-8')))
        stream.stderr.on('data', (d: Buffer) => (stderr += d.toString('utf-8')))
        stream.on('close', (code: number | null) => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          exitCode = code
          try {
            client.end()
          } catch {
            /* ignore */
          }
          resolve({ command, exitCode, stdout, stderr, timedOut: false })
        })
      })
    })
  })
}

/**
 * Run a command the way the operator can see it.
 *
 * Default: drive the live terminal session the operator already has open, so
 * every command and its real output scroll past in the UI. That is what makes
 * the agent's work auditable instead of a private side-channel. When no
 * session is open we fall back to a dedicated SSH exec channel, and the
 * caller can force that with `preferSession: false`.
 */
async function runCommandVisible(
  store: Store,
  deviceId: string,
  command: string,
  timeoutMs: number,
  preferSession = true,
): Promise<CommandResult> {
  if (preferSession) {
    const live = findLiveSession(deviceId)
    if (live) return runCommandInSession(live, command, timeoutMs)
  }
  return runCommand(store, deviceId, command, timeoutMs)
}

// ---- host LLM analysis -----------------------------------------------------

function analyzeOutput(
  llm: DshLlmRuntime | undefined,
  deviceName: string,
  task: string,
  results: CommandResult[],
): Promise<{ analysis: string; unavailable: boolean }> {
  if (!llm) return Promise.resolve({ analysis: '', unavailable: true })
  const transcript = results
    .map(
      (r) =>
        `$ ${r.command}\n` +
        (r.stdout ? r.stdout : '') +
        (r.stderr ? '\n[stderr]\n' + r.stderr : '') +
        `\n[exit ${r.exitCode ?? 'unknown'}${r.timedOut ? ' (timed out)' : ''}` +
        `${r.viaSession ? ' (via operator terminal session)' : ''}]\n`,
    )
    .join('\n')
  const system =
    '你是一名网络设备运维分析助手，专长是 Hillstone（山石网科）安全网关/防火墙 CLI。' +
    '下面给出在某台设备上执行的命令及其真实回显。请根据用户的运维目标，用中文给出：\n' +
    '1) 关键发现的要点；2) 是否存在异常/风险；3) 推荐的下一步排查或配置建议。\n' +
    '注意：该 CLI 没有 echo 命令，也无法返回 exit code，exit 一栏为 unknown 是正常的；' +
    '若回显中出现 "unrecognized keyword"，说明这条命令在设备上不存在，请换成该设备真实支持的语法。\n' +
    '只依据回显内容，不要编造未出现的字段；引用具体配置或数值时保留原文。'
  const user = `设备名称：${deviceName}\n运维目标：${task}\n\n命令回显：\n${transcript}`
  return (async () => {
    try {
      const stream = await Promise.resolve(
        llm.stream({
          provider: '',
          model: '',
          messages: [
            { role: 'system', content: [{ type: 'text', text: system }] },
            { role: 'user', content: [{ type: 'text', text: user }] },
          ],
          temperature: 0.2,
          maxTokens: 2048,
          signal: AbortSignal.timeout(120_000),
        }),
      )
      let text = ''
      for await (const chunk of stream) {
        if (chunk.type === 'text-delta' && typeof chunk.text === 'string') text += chunk.text
        if (chunk.type === 'finish') break
      }
      return { analysis: text.trim(), unavailable: false }
    } catch {
      return { analysis: '', unavailable: true }
    }
  })()
}

// ---- HTTP API --------------------------------------------------------------

const API_PREFIX = '/ops-api'

function writeJson(res: ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(text)
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(c as Buffer))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', reject)
  })
}

interface ApiDeps {
  store: Store
  llm: () => DshLlmRuntime | undefined
  token: string
  tokenEnabled: boolean
}

function isAuthExempt(method: string, path: string): boolean {
  if (path === '/_session') return true
  return method === 'OPTIONS'
}

/** True when the request comes from the loopback or the DSH desktop webview.
 * Browsers always send `Origin` on cross-origin fetches, so a present non-loopback
 * Origin marks a remote caller. Mirrors dsh-knowledge-base's kb-api origin defense.
 *
 * CRITICAL (2026-10-04): the DSH desktop app does NOT load the panel from
 * http://127.0.0.1:19387. That port is only the host backend API. The desktop
 * shell serves the app from the custom scheme `dsh-app:`, so the panel's own
 * fetches carry `Origin: dsh-app://app`. Verified in D:\DSH\resources\app.asar
 * -> lib/main.js: `const SCHEME = "dsh-app"`, registered via
 * `protocol.registerSchemesAsPrivileged` with
 * `{ standard: true, secure: true, corsEnabled: true, supportFetchAPI: true }`,
 * and `protocol.handle(SCHEME, ...)` serving the web frontend for
 * `url.hostname === "app"`. Because the scheme is `standard`, Chromium emits a
 * real (non-opaque) Origin — but `new URL("dsh-app://app").hostname` is `app`,
 * never a loopback name. A loopback-hostname allowlist therefore silently
 * rejects the app's own writes and every create 401s with no visible reaction,
 * which is exactly the symptom the user reported. Accept the `dsh-app:` scheme
 * explicitly, plus loopback hosts, plus the opaque `null`. */
function originIsLocalOrAbsent(req: IncomingMessage): boolean {
  const raw = req.headers['origin']
  const origin = Array.isArray(raw) ? raw[0] : raw
  if (!origin) return true
  if (origin === 'null') return true
  try {
    const url = new URL(origin)
    if (url.protocol === 'dsh-app:') return true
    const { hostname } = url
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.localhost')
    )
  } catch {
    return false
  }
}

async function handleApi(deps: ApiDeps, req: IncomingMessage, res: ServerResponse): Promise<void> {
  // CORS so the browser (served from the DSH web origin) can call loopback.
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Ops-Token')
  res.setHeader('Access-Control-Max-Age', '300')
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  const url = new URL(req.url ?? '/', 'http://dsh.internal')
  const pathname = url.pathname.startsWith(API_PREFIX) ? url.pathname.slice(API_PREFIX.length) : url.pathname
  const method = req.method ?? 'GET'

  // Token gate (mirrors dsh-knowledge-base /kb-api). The plugin's own browser
  // half is same-loopback (Origin absent or 127.0.0.1), so it is trusted without
  // a token — matching the GET /_session bootstrap contract. A token is only
  // required for a genuinely remote Origin, which is defense-in-depth (a hostile
  // web page cannot reach the loopback server's responses anyway). If we required
  // the token for same-loopback callers we'd have no bootstrap path and every
  // write would 401 with no visible reaction.
  if (deps.tokenEnabled && !isAuthExempt(method, pathname) && !originIsLocalOrAbsent(req)) {
    const raw = req.headers['x-ops-token']
    const provided = (Array.isArray(raw) ? raw[0] : raw || '').trim()
    if (provided !== deps.token) {
      writeJson(res, 401, { ok: false, error: { code: 'unauthorized', message: '缺少或无效的设备运维访问令牌（X-Ops-Token）' } })
      return
    }
  }

  // GET routes
  if (method === 'GET' || method === undefined) {
    if (pathname === '/_session') {
      // Hand the token to the same set of callers originIsLocalOrAbsent trusts —
      // including the `dsh-app:` desktop webview, whose Origin carries no
      // loopback hostname. A remote origin gets `token: ''` and must ask the user
      // to paste one.
      const local = originIsLocalOrAbsent(req)
      writeJson(res, 200, { ok: true, enabled: deps.tokenEnabled, token: local && deps.tokenEnabled ? deps.token : '', local })
      return
    }
    if (pathname === '/devices') {
      const list = [...deps.store.devices.values()].map(toDTO)
      writeJson(res, 200, { ok: true, devices: list })
      return
    }
    // GET /ops-api/conn/:connId/stream  → SSE of terminal output.
    const streamMatch = pathname.match(/^\/conn\/([^/]+)\/stream$/)
    if (streamMatch) {
      const session = deps.store ? sessions.get(decodeURIComponent(streamMatch[1])) : undefined
      if (!session) {
        writeJson(res, 404, { ok: false, error: { code: 'not-found', message: '连接不存在或已关闭' } })
        return
      }
      res.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
        'x-accel-buffering': 'no',
      })
      // Replay what this session has already produced before switching to live
      // output. Without it, a browser that reloads (or an EventSource that
      // reconnects) shows an empty terminal even though the shell is fine.
      const back = session.outputLog.length > SNAPSHOT_MAX_BYTES
        ? session.outputLog.slice(-SNAPSHOT_MAX_BYTES)
        : session.outputLog
      writeFrame(res, 'data', { text: back, snapshot: true })
      writeFrame(res, 'status', { status: session.status, error: session.error ?? null })
      session.clients.add(res)
      // An idle shell produces no bytes, so nothing would prove the socket is
      // alive; a comment frame every 15s keeps intermediaries from reaping it.
      const ping = setInterval(() => {
        try {
          res.write(': ping\n\n')
        } catch {
          /* ignore */
        }
      }, SSE_PING_MS)
      const drop = () => {
        clearInterval(ping)
        session.clients.delete(res)
      }
      req.on('close', drop)
      res.on('close', drop)
      return
    }
    // GET /ops-api/conn  → list active connections.
    if (pathname === '/conn') {
      const list: ConnectionInfo[] = [...sessions.values()].map((s) => ({
        connId: s.connId,
        deviceId: s.deviceId,
        deviceName: s.deviceName,
        status: s.status,
        createdAt: s.createdAt,
        error: s.error,
      }))
      writeJson(res, 200, { ok: true, connections: list, agentsBusy: busySessions() })
      return
    }
    // GET /ops-api/logs  → every recorded session, newest first.
    if (pathname === '/logs') {
      const list = listSessionLogs(deps.store.logDir)
      writeJson(res, 200, { ok: true, logs: list })
      return
    }
    // GET /ops-api/logs/:connId  → one session's full record.
    const logMatch = pathname.match(/^\/logs\/([^/]+)$/)
    if (logMatch) {
      const detail = readSessionLog(deps.store.logDir, decodeURIComponent(logMatch[1]))
      if (!detail) {
        writeJson(res, 404, { ok: false, error: { code: 'not-found', message: '日志不存在' } })
        return
      }
      writeJson(res, 200, { ok: true, log: detail })
      return
    }
    writeJson(res, 404, { ok: false, error: { code: 'not-found', message: 'unknown ops-api route' } })
    return
  }

  // POST routes
  if (method === 'POST') {
    // Create a device: body DeviceInput. This must live inside the POST block —
    // the block's 404 fallthrough runs before any later top-level `if`, so a
    // create handler parked after it was unreachable ("unknown ops-api route").
    if (pathname === '/devices') {
      const input = JSON.parse((await readBody(req)) || '{}') as DeviceInput
      if (!input.name || !input.ip || !input.account || !input.password) {
        writeJson(res, 400, { ok: false, error: { code: 'bad-request', message: 'name / ip / account / password 必填' } })
        return
      }
      const now = new Date().toISOString()
      const device: Device = {
        id: randomUUID(),
        name: input.name,
        ip: input.ip,
        account: input.account,
        password: encryptSecret(deps.store.key, input.password),
        port: input.port ?? 22,
        note: input.note,
        deviceType: normalizeDeviceType(input.deviceType),
        webPort: input.webPort,
        createdAt: now,
        updatedAt: now,
      }
      deps.store.devices.set(device.id, device)
      persistStore(deps.store)
      writeJson(res, 201, { ok: true, device: toDTO(device) })
      return
    }
    // POST /ops-api/devices/ping  → TCP reachability for every device (m03664).
    // Lives inside the POST block, before the /devices/:id routes: the 404
    // fallthrough at the end of the block would otherwise swallow it.
    if (pathname === '/devices/ping') {
      const results = await scanLiveness([...deps.store.devices.values()])
      writeJson(res, 200, { ok: true, results })
      return
    }
    // POST /ops-api/devices/:id/copy  → duplicate a device, password included.
    // The ciphertext is copied server-side, so the plaintext secret never
    // travels to the browser and never has to be re-typed to make a backup copy
    // of a device before changing it. Body may carry { name? } to override the
    // default "<name>-副本".
    const copyMatch = pathname.match(/^\/devices\/([^/]+)\/copy$/)
    if (copyMatch) {
      const id = decodeURIComponent(copyMatch[1])
      const source = deps.store.devices.get(id)
      if (!source) {
        writeJson(res, 404, { ok: false, error: { code: 'not-found', message: 'device not found' } })
        return
      }
      const body = JSON.parse((await readBody(req)) || '{}') as { name?: string }
      // A unique name matters here: two devices called 核心交换机 are
      // indistinguishable in the list, and the whole point of a copy is to have
      // a second entry to tell apart.
      const taken = new Set([...deps.store.devices.values()].map((d) => d.name))
      let name = (body.name || `${source.name}-副本`).trim() || `${source.name}-副本`
      if (taken.has(name)) {
        let n = 2
        while (taken.has(`${name} (${n})`)) n++
        name = `${name} (${n})`
      }
      const now = new Date().toISOString()
      const copy: Device = {
        ...source,
        id: randomUUID(),
        name,
        createdAt: now,
        updatedAt: now,
      }
      deps.store.devices.set(copy.id, copy)
      persistStore(deps.store)
      writeJson(res, 201, { ok: true, device: toDTO(copy) })
      return
    }
    // Connect to a device: body { deviceId, cols?, rows? }
    if (pathname === '/connect') {
      const body = JSON.parse((await readBody(req)) || '{}') as {
        deviceId?: string
        cols?: number
        rows?: number
      }
      if (!body.deviceId) {
        writeJson(res, 400, { ok: false, error: { code: 'bad-request', message: 'deviceId required' } })
        return
      }
      try {
        const info = await connectDevice(
          deps.store,
          body.deviceId,
          body.cols || body.rows ? { cols: body.cols ?? 120, rows: body.rows ?? 40 } : undefined,
        )
        writeJson(res, 200, { ok: true, connection: info })
      } catch (e) {
        writeJson(res, 502, { ok: false, error: { code: 'connect-failed', message: (e as Error).message } })
      }
      return
    }
    // Resize a live terminal: body { connId, cols, rows }
    if (pathname === '/conn/resize') {
      const body = JSON.parse((await readBody(req)) || '{}') as {
        connId?: string
        cols?: number
        rows?: number
      }
      const session = body.connId ? sessions.get(body.connId) : undefined
      if (!session || !session.shell) {
        writeJson(res, 404, { ok: false, error: { code: 'not-found', message: '连接不存在或未就绪' } })
        return
      }
      const cols = clamp(body.cols ?? session.cols, 20, 500)
      const rows = clamp(body.rows ?? session.rows, 10, 300)
      try {
        session.shell.setWindow(rows, cols, 0, 0)
        session.cols = cols
        session.rows = rows
        writeJson(res, 200, { ok: true, cols, rows })
      } catch (e) {
        writeJson(res, 500, { ok: false, error: { code: 'resize-failed', message: (e as Error).message } })
      }
      return
    }
    // Disconnect: body { connId }
    if (pathname === '/disconnect') {
      const body = JSON.parse((await readBody(req)) || '{}') as { connId?: string }
      const session = body.connId ? sessions.get(body.connId) : undefined
      if (session) cleanup(session, '操作员断开连接')
      writeJson(res, 200, { ok: true })
      return
    }
    // Terminal input: body { connId, data }
    if (pathname === '/conn/input') {
      const body = JSON.parse((await readBody(req)) || '{}') as { connId?: string; data?: string }
      const session = body.connId ? sessions.get(body.connId) : undefined
      if (!session || !session.shell) {
        writeJson(res, 404, { ok: false, error: { code: 'not-found', message: '连接不存在或未就绪' } })
        return
      }
      try {
        const data = body.data ?? ''
        // Log what the operator actually typed, not what reached the device: a
        // keystroke lost to a closed socket is exactly the kind of gap an audit
        // trail is for.
        session.log.input(data)
        await enqueueWrite(session, data)
        writeJson(res, 200, { ok: true })
      } catch (e) {
        writeJson(res, 500, { ok: false, error: { code: 'write-failed', message: (e as Error).message } })
      }
      return
    }
    // Agent analysis: body AnalyzeRequest.
    if (pathname === '/analyze') {
      const body = JSON.parse((await readBody(req)) || '{}') as AnalyzeRequest
      if (!body.deviceId || !Array.isArray(body.commands) || body.commands.length === 0) {
        writeJson(res, 400, { ok: false, error: { code: 'bad-request', message: 'deviceId 与 commands[] 必填' } })
        return
      }
      const device = deps.store.devices.get(body.deviceId)
      if (!device) {
        writeJson(res, 404, { ok: false, error: { code: 'not-found', message: 'device not found' } })
        return
      }
      const timeout = Math.max(5000, Math.min(300000, body.timeoutMs ?? 30000))
      const results: CommandResult[] = []
      for (const cmd of body.commands) {
        try {
          results.push(await runCommandVisible(deps.store, body.deviceId, cmd, timeout, body.preferSession !== false))
        } catch (e) {
          results.push({ command: cmd, exitCode: null, stdout: '', stderr: (e as Error).message, timedOut: false })
        }
      }
      const { analysis, unavailable } = await analyzeOutput(deps.llm(), device.name, body.task, results)
      const resp: AnalyzeResponse = {
        deviceId: body.deviceId,
        deviceName: device.name,
        results,
        analysis,
        analysisUnavailable: unavailable,
      }
      writeJson(res, 200, { ok: true, ...resp })
      return
    }
    writeJson(res, 404, { ok: false, error: { code: 'not-found', message: 'unknown ops-api route' } })
    return
  }

  // PUT /ops-api/devices/:id  (update)
  if (method === 'PUT') {
    const m = pathname.match(/^\/devices\/([^/]+)$/)
    if (m) {
      const id = decodeURIComponent(m[1])
      const input = JSON.parse((await readBody(req)) || '{}') as DeviceInput
      const existing = deps.store.devices.get(id)
      if (!existing) {
        writeJson(res, 404, { ok: false, error: { code: 'not-found', message: 'device not found' } })
        return
      }
      const updated: Device = {
        ...existing,
        name: input.name ?? existing.name,
        ip: input.ip ?? existing.ip,
        account: input.account ?? existing.account,
        port: input.port ?? existing.port,
        note: input.note,
        // Absent means "leave alone" — unlike `note`, where clearing the field
        // is the only way to remove it. webPort is genuinely optional, so an
        // explicit null clears it and an absent key keeps the old value.
        deviceType: input.deviceType === undefined ? existing.deviceType : normalizeDeviceType(input.deviceType),
        webPort: input.webPort === undefined ? existing.webPort : input.webPort,
        password: input.password ? encryptSecret(deps.store.key, input.password) : existing.password,
        updatedAt: new Date().toISOString(),
      }
      deps.store.devices.set(id, updated)
      persistStore(deps.store)
      writeJson(res, 200, { ok: true, device: toDTO(updated) })
      return
    }
  }

  // DELETE /ops-api/devices/:id
  if (method === 'DELETE') {
    const m = pathname.match(/^\/devices\/([^/]+)$/)
    if (m) {
      const id = decodeURIComponent(m[1])
      const ok = deps.store.devices.delete(id)
      if (ok) persistStore(deps.store)
      writeJson(res, ok ? 200 : 404, { ok, deviceId: id })
      return
    }
  }

  writeJson(res, 405, { ok: false, error: { code: 'method-not-allowed', message: method } })
}

// ---- activation ------------------------------------------------------------

interface ContextLike {
  effect(body: () => (() => void) | void, label?: string): void
  inject(deps: readonly string[], callback: (ctx: any) => void): () => void
  logger?: { warn(message: string): void; info?(message: string): void }
  getConfigPath?: () => string | undefined
  baseDir?: string
}

function readProfileDir(ctx: ContextLike): string | undefined {
  for (const key of ['baseDir', 'getConfigPath']) {
    try {
      const value = (ctx as any)[key]
      const v = typeof value === 'function' ? value.call(ctx) : value
      if (typeof v === 'string' && v) return v
    } catch {
      /* ignore */
    }
  }
  return undefined
}

function probeLlm(ctx: ContextLike): () => DshLlmRuntime | undefined {
  let runtime: DshLlmRuntime | undefined
  const set = (candidate: unknown) => {
    const rt = candidate as DshLlmRuntime | undefined
    if (rt && typeof (rt as any).stream === 'function') runtime = rt
  }
  // Best-effort read through the cordis proxy (may throw without inject).
  try {
    const reflect = (ctx as any).reflect
    if (reflect && typeof reflect.get === 'function') {
      set(reflect.get('llm'))
    }
  } catch {
    /* ignore */
  }
  if (ctx.inject) {
    try {
      ctx.inject(['llm'], (lctx: any) => {
        try {
          set(lctx?.llm)
        } catch {
          /* ignore */
        }
      })
    } catch {
      /* ignore */
    }
  }
  return () => runtime
}

function activate(ctx: ContextLike, config?: Partial<Config>): void {
  const resolved = resolveConfig(config, readProfileDir(ctx))
  mkdirSync(resolved.dataDir, { recursive: true })
  const key = loadKey(resolved.dataDir)
  const store = loadStore(resolved.dataDir, key)
  const getLlm = probeLlm(ctx)

  const token = randomBytes(24).toString('base64url')

  const server = createServer((req, res) => {
    const send = (status: number, body: unknown) => {
      const text = JSON.stringify(body)
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
      res.end(text)
    }
    ;(async () => {
      try {
        await handleApi({ store, llm: getLlm, token, tokenEnabled: resolved.apiTokenEnabled }, req, res)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        ctx.logger?.warn(`[dsh-hillstone-cli-ops] api error: ${message}`)
        if (!res.headersSent) send(500, { ok: false, error: { code: 'internal', message } })
      }
    })()
  })

  server.once('error', (e: Error) => {
    ctx.logger?.warn(`[dsh-hillstone-cli-ops] loopback server on :${resolved.apiPort} failed: ${e.message}`)
  })
  server.listen(resolved.apiPort, '127.0.0.1', () => {
    ctx.logger?.info?.(`[dsh-hillstone-cli-ops] API listening at http://127.0.0.1:${resolved.apiPort}${API_PREFIX}`)
  })

  // Sweep expired log days on startup and once a day after. Retention is a
  // property of a long-running host, so a plugin that only prunes on write would
  // leave a month of logs on disk for a user who never connects anything.
  const sweep = () => {
    const removed = pruneLogs(store.logDir)
    if (removed) ctx.logger?.info?.(`[dsh-hillstone-cli-ops] pruned ${removed} expired log day(s)`)
  }
  sweep()
  const sweepTimer = setInterval(sweep, 24 * 3600 * 1000)
  // Do not hold the process open on our account.
  sweepTimer.unref?.()

  // Register the agent tool so the conversation assistant can operate devices.
  if (ctx.inject) {
    try {
      ctx.inject(['tools'], (tctx: any) => {
        tctx.effect(() => {
          // Declared outside the try: the catch below reports which tools were
          // already registered, which is the only clue about where it stopped.
          const TOOL_NAMES: string[] = []
          try {
            const registry = tctx.tools
            if (!registry || typeof registry.register !== 'function') return

            /**
             * The `output` block every ToolDefinition must carry.
             *
             * Our execute() returns a structured object because the offline
             * regression asserts on individual fields; render() is the part a
             * model actually reads, so it has to spell the same facts out in
             * prose instead of dumping JSON into the transcript.
             */
            /** Every tool reports failure the same way; render it the same way. */
            const failure = (value: any): string | undefined =>
              value && typeof value === 'object' && value.ok === false
                ? `执行失败：${value.error ?? '未知错误'}`
                : undefined

            const toolOutput = (
              render: (value: any) => string,
              schema: Record<string, unknown> = { type: 'object' },
            ) => ({
              schema,
              render(_args: unknown, value: unknown) {
                let text: string
                try {
                  // The failure check lives HERE, not in each render closure: a
                  // closure that forgets it prints a success-shaped empty body,
                  // and the model reads that as "the tool worked and found
                  // nothing" instead of "the device was not found".
                  const bad = failure(value)
                  text = bad ?? render(value)
                } catch {
                  text = typeof value === 'string' ? value : JSON.stringify(value)
                }
                return [{ type: 'text', text }]
              },
            })

            const def = {
              name: 'hillstone_run_and_analyze',
              description:
                '在指定 Hillstone 设备上执行一组 CLI 命令，收集真实回显，并调用宿主 LLM 分析输出。' +
                '参数：deviceId（设备 id，先用 hillstone_list_devices 获取）、commands（命令数组）、' +
                'task（自然语言运维目标，如"检查接口状态和 CPU 负载"）、timeoutMs（可选，默认 30000）、' +
                'preferSession（可选，默认 true）。默认会在运维人员已打开的终端会话里执行，' +
                '命令与回显在界面上实时可见；没有打开会话时自动改用独立 SSH 通道。' +
                '注意该设备 CLI 没有 echo 命令，也不能返回 exit code，请使用该设备真实支持的命令语法。',
              parameters: {
                deviceId: { type: 'string', required: true, description: '目标设备 id' },
                commands: {
                  type: 'array',
                  items: { type: 'string' },
                  required: true,
                  description: '依次执行的 CLI 命令',
                },
                task: { type: 'string', required: true, description: '运维分析目标（自然语言）' },
                timeoutMs: { type: 'integer', description: '每条命令超时，毫秒', minimum: 5000, maximum: 300000 },
                preferSession: {
                  type: 'boolean',
                  description:
                    '默认 true：优先在运维人员已打开的终端会话里执行，命令与回显会在界面上滚动可见。' +
                    '传 false 则使用独立 SSH 通道，不打扰界面。',
                },
              },
              output: toolOutput((v: any) => {
                const lines: string[] = [
                  `设备：${v.deviceName}（${v.deviceId}）`,
                  '',
                ]
                for (const r of v.results ?? []) {
                  lines.push(`$ ${r.command}${r.viaSession ? '  [经运维终端会话]' : ''}`)
                  if (r.timedOut) lines.push('  （超时，输出可能不完整）')
                  if (r.pages) lines.push(`  （已自动翻页 ${r.pages} 次以取回完整输出）`)
                  if (r.stderr) lines.push(`  错误：${r.stderr}`)
                  const body = String(r.stdout ?? '').trim()
                  if (body) lines.push(body)
                  lines.push('')
                }
                if (v.analysisUnavailable) {
                  lines.push('（宿主未提供 LLM 服务，以上为原始回显，未做分析）')
                } else if (v.analysis) {
                  lines.push('分析：', v.analysis)
                }
                return lines.join('\n')
              }),
              async execute(args: {
                deviceId: string
                commands: string[]
                task: string
                timeoutMs?: number
                preferSession?: boolean
              }) {
                const device = store.devices.get(args.deviceId)
                if (!device) return { ok: false, error: 'device not found' }
                const timeout = Math.max(5000, Math.min(300000, args.timeoutMs ?? 30000))
                const results: CommandResult[] = []
                for (const cmd of args.commands) {
                  try {
                    results.push(await runCommandVisible(store, args.deviceId, cmd, timeout, args.preferSession !== false))
                  } catch (e) {
                    results.push({ command: cmd, exitCode: null, stdout: '', stderr: (e as Error).message, timedOut: false })
                  }
                }
                const { analysis, unavailable } = await analyzeOutput(getLlm(), device.name, args.task, results)
                const resp: AnalyzeResponse = {
                  deviceId: args.deviceId,
                  deviceName: device.name,
                  results,
                  analysis,
                  analysisUnavailable: unavailable,
                }
                return { ok: true, ...resp }
              },
            }
            const unregister = registry.register(def)

            // Open a real interactive terminal on a device.
            //
            // run_and_analyze can only reuse a session an operator already has
            // open; with nothing open it degrades to a one-shot exec channel that
            // no one can see and that dies with the command. This tool is the
            // agent's own way in: a pty that outlives the call, shows up in the
            // plugin's 终端 tab, and is written to the same session log.
            const openDef = {
              name: 'hillstone_open_terminal',
              description:
                '在指定 Hillstone 设备上打开一个交互式终端会话（SSH pty），并返回 connId。' +
                '会话会持续存在、可被后续命令复用，也会出现在「设备运维 → 终端」标签页里供人查看。' +
                '参数：deviceId（先用 hillstone_list_devices 获取）。可选 cols/rows 指定终端窗口大小。' +
                '打开会话后再用 hillstone_send_input 发命令，或直接用 hillstone_run_and_analyze 执行命令。' +
                '要等命令结束就用 hillstone_send_input 配合 hillstone_get_output 轮询；' +
                '用完请调用 hillstone_close_terminal 释放连接，否则 SSH 会话会一直留着。',
              parameters: {
                deviceId: { type: 'string', required: true, description: '目标设备 id' },
                cols: { type: 'integer', description: '终端列数，默认 120', minimum: 20, maximum: 500 },
                rows: { type: 'integer', description: '终端行数，默认 40', minimum: 10, maximum: 300 },
              },
              output: toolOutput((v: any) => {
                return (
                  `已打开 ${v.deviceName} 的终端会话。\n` +
                  `connId: ${v.connId}\n` +
                  `设备 id: ${v.deviceId}\n` +
                  `状态: ${v.status}，窗口 ${v.cols ?? 120}x${v.rows ?? 40}\n` +
                  `该会话也会出现在「设备运维 → 终端」标签页，运维人员可以实时看到你在做什么。\n` +
                  `接下来：hillstone_send_input 发命令 → hillstone_get_output 带 since 读输出 → 用完 hillstone_close_terminal 关闭。`
                )
              }),
              async execute(args: { deviceId: string; cols?: number; rows?: number }) {
                if (!store.devices.get(args.deviceId)) return { ok: false, error: 'device not found' }
                try {
                  const conn = await connectDevice(store, args.deviceId, {
                    cols: args.cols,
                    rows: args.rows,
                  })
                  return { ok: true, ...conn }
                } catch (e) {
                  return { ok: false, error: (e as Error).message }
                }
              },
            }
            const unregisterOpen = registry.register(openDef)

            // Type into an open terminal. This is the escape hatch for
            // interactive or stateful commands where waiting for a prompt is not
            // enough — it can also be used to page a `--More--` prompt by hand.
            const inputDef = {
              name: 'hillstone_send_input',
              description:
                '向已打开的终端会话发送原始输入（按键或整条命令），用于交互式命令或手工推进 --More-- 分页。' +
                '参数：connId（hillstone_open_terminal 返回，或从 /conn 列表取）、data（要发送的字符串）。' +
                '整条命令不必自己带回车：传 "show cpu detail" 就会自动补 \\r 执行。' +
                '单字符按键（翻页空格、"q"）和已含控制字符的数据默认**不**提交，' +
                '需要强制提交或明确不提交时传 submit:true / submit:false。' +
                '典型用法：send_input 发命令 → get_output 带 since 轮询 → prompt 字段非空即执行完毕。',
              parameters: {
                connId: { type: 'string', required: true, description: '目标会话 connId' },
                data: { type: 'string', required: true, description: '要发送的原始输入，例如 "show cpu detail"、"q"、" "' },
                submit: {
                  type: 'boolean',
                  description: '是否在末尾补 \\r 提交。默认：多字符命令自动提交，单字符按键与含控制字符的数据不提交。',
                },
              },
              output: toolOutput((v: any) => {
                return (
                  `已向会话 ${v.connId} 发送 ${v.sent} 个字符${v.submitted ? '（含自动补的回车）' : '（未提交）'}。\n` +
                  `用 hillstone_get_output 带 since=${'<'}上次 next> 轮询，` +
                  `直到返回的 prompt 字段非空即表示命令执行完毕。`
                )
              }),
              async execute(args: { connId: string; data: string; submit?: boolean }) {
                const session = sessions.get(args.connId)
                if (!session) return { ok: false, error: 'session not found' }
                if (!session.shell || session.status !== 'ready') {
                  return { ok: false, error: `session is ${session.status}, not ready` }
                }
                if (args.data === '') {
                  return { ok: false, error: 'data 为空：send_input 不会发送空数据' }
                }
                // A model that writes a bare command and waits for output is the
                // overwhelmingly common case, and without the CR the text just
                // sits in the device's line buffer forever — the failure the
                // user actually hit. Paging keys and in-progress editing are
                // the exceptions, and they are recognisable: a single
                // whitespace/short key (" ", "q"), or anything carrying a
                // control character the device needs verbatim.
                const CONTROL_RE = /[\u0000-\u001f]/
                const looksLikeCommand =
                  args.data.length > 1 && !CONTROL_RE.test(args.data) && args.data.trim() !== ''
                // Accept both a real boolean and the string a JSON-ish caller
                // may hand over: `submit: "false"` must not be read as truthy.
                const raw = args.submit as unknown
                const explicit =
                  raw === true || raw === 'true' ? true : raw === false || raw === 'false' ? false : null
                const submit = explicit ?? looksLikeCommand
                const payload = submit && !/[\r\n]$/.test(args.data) ? args.data + '\r' : args.data
                try {
                  await enqueueWrite(session, payload)
                  // Every keystroke is an operator-visible action on a production
                  // device, so it belongs in the same audit trail as the terminal.
                  session.log.input(payload)
                  return { ok: true, connId: args.connId, sent: payload.length, submitted: submit }
                } catch (e) {
                  return { ok: false, error: (e as Error).message }
                }
              },
            }
            const unregisterInput = registry.register(inputDef)

            // Read the transcript an open session has already produced.
            //
            // send_input writes but never waits, so on its own it leaves the
            // agent guessing: it would have to poll with blind sleeps and still
            // could not tell a slow command from a finished one. This is the
            // other half — a cursor-based reader, so the agent can wait for
            // exactly the bytes it has not seen yet instead of re-reading
            // everything each time.
            const outputDef = {
              name: 'hillstone_get_output',
              description:
                '获取终端会话到目前为止的设备输出（已用 cleanPtyText 去掉回显的控制字符/ANSI 颜色）。' +
                '参数：connId（hillstone_open_terminal 或 hillstone_list_sessions 返回）。' +
                '可选 since（上次返回的 next 游标，只返回其后新增的内容）、' +
                '可选 tail（只取末尾 N 个字符，默认 8000）、可选 raw（true 时返回未经清洗的原始文本）。' +
                '返回 { text, next, dropped, prompt, agentActive, status }：' +
                'next 是下次的 since 游标，dropped>0 表示输出超出上限、早先内容已被丢弃，' +
                'prompt 非空表示设备已经回到提示符（命令执行完毕），agentActive 表示该会话正被 agent 占用。' +
                '典型用法：send_input 发命令后反复带 since 调用本工具，直到 prompt 非空。',
              parameters: {
                connId: { type: 'string', required: true, description: '目标会话 connId' },
                since: { type: 'integer', description: '游标，只返回该字节位置之后的新增输出', minimum: 0 },
                tail: { type: 'integer', description: '最多返回的字符数，默认 8000', minimum: 200, maximum: 200000 },
                raw: { type: 'boolean', description: 'true 时返回未清洗的原始 pty 文本' },
              },
              output: toolOutput((v: any) => {
                const head: string[] = [`会话 ${v.connId}（${v.deviceName ?? v.status}）`]
                if (v.staleSince) {
                  head.push('⚠ since 游标过旧，输出缓冲区已丢弃早期内容，本次返回的是保留下来的全部内容。')
                }
                if (v.dropped) head.push(`（历史输出已丢弃 ${v.dropped} 字节）`)
                if (v.truncated) head.push('（内容超过 tail 上限，只返回末尾部分）')
                if (v.prompt) {
                  head.push(`设备已回到提示符 ${JSON.stringify(v.prompt)}，命令执行完毕。`)
                } else {
                  head.push('设备尚未回到提示符，命令可能还在执行（或停在 --More-- 分页处，可发一个空格）。')
                }
                if (v.agentActive) head.push('（该会话正被 agent 占用）')
                head.push('next 游标：' + v.next, '', '--- 设备输出 ---')
                const body = String(v.text ?? '')
                return [...head, body || '（本次没有新输出）'].join('\n')
              }),
              execute(args: { connId: string; since?: number; tail?: number; raw?: boolean }) {
                const session = sessions.get(args.connId)
                if (!session) return { ok: false, error: 'session not found' }
                const log = session.outputLog
                // How much of the buffer the cap has already thrown away. A
                // cursor older than that cannot be honoured, and silently
                // returning the whole buffer would look like a huge amount of
                // *new* output — so report it instead.
                const dropped = Math.max(0, session.outputBytes - Buffer.byteLength(log, 'utf-8'))
                const since = args.since
                // A cursor points into dropped territory only when it is *older
                // than what the buffer still holds*: `dropped` is exactly the
                // number of bytes the cap threw away, so anything below that is
                // unrecoverable. (Comparing against the buffer length instead
                // would declare every cursor stale the moment new output arrived,
                // and silently return the whole buffer as if it were all new.)
                const tooOld = typeof since === 'number' && since < dropped
                // `since` counts bytes but the buffer holds a JS string, so a
                // multi-byte CJK character can straddle the cursor. Re-scan from
                // a little earlier and cut at the byte boundary: without this a
                // single 3-byte character can duplicate or drop a glyph.
                let text = log
                if (typeof since === 'number' && !tooOld) {
                  const upto = Math.min(log.length, since)
                  text = log.slice(0, upto)
                  // Walk back to a lead byte so the slice starts on a character.
                  while (text.length > 0 && (log.charCodeAt(text.length) & 0xc0) === 0x80) {
                    text = text.slice(0, -1)
                  }
                  text = log.slice(text.length)
                }
                if (args.raw) {
                  /* the caller asked for the bytes as they came */
                } else {
                  text = cleanPtyText(text)
                }
                const cap = Math.max(200, Math.min(200_000, args.tail ?? 8000))
                let truncated = false
                if (text.length > cap) {
                  text = text.slice(-cap)
                  truncated = true
                }
                return {
                  ok: true,
                  connId: args.connId,
                  status: session.status,
                  text,
                  // Byte cursor, not a string offset: it stays valid after the
                  // cap re-slices the buffer, so the agent can poll forever.
                  next: session.outputBytes,
                  dropped,
                  truncated,
                  // A stale cursor must not silently look like "all new output".
                  ...(tooOld ? { staleSince: true } : {}),
                  prompt: session.lastPrompt,
                  agentActive: session.agentActive,
                }
              },
            }
            const unregisterOutput = registry.register(outputDef)

            // Close a session the agent opened.
            //
            // Without this the only way to release a pty is the operator
            // clicking 断开 in the UI, so an agent that opened three terminals
            // to investigate one device leaves three SSH connections (and three
            // open log records) behind. Closing goes through the same
            // cleanup() the UI path uses, so the audit record is closed with a
            // real reason rather than being left looking like a crash.
            const closeDef = {
              name: 'hillstone_close_terminal',
              description:
                '关闭一个已打开的终端会话，释放 SSH 连接并在会话日志里记下结束原因。' +
                '参数：connId（hillstone_open_terminal 或 hillstone_list_sessions 返回）。' +
                '可选 deviceId：不给 connId 时，关闭该设备上所有打开的会话。' +
                '返回 { ok, closed }，closed 是被关闭的 connId 列表。' +
                '注意：会话里有正在执行的命令时关闭会中断它，确认没有需要等待的命令再调用。',
              parameters: {
                connId: { type: 'string', description: '要关闭的会话 connId' },
                deviceId: { type: 'string', description: '关闭该设备上所有会话时使用' },
              },
              output: toolOutput((v: any) => {
                return `已关闭 ${v.closed?.length ?? 0} 个终端会话：\n${(v.closed ?? []).join('\n')}`
              }),
              execute(args: { connId?: string; deviceId?: string }) {
                const targets = [...sessions.values()].filter((s) => {
                  if (args.connId) return s.connId === args.connId
                  if (args.deviceId) return s.deviceId === args.deviceId
                  return false
                })
                if (!targets.length) {
                  return {
                    ok: false,
                    error: args.connId ? 'session not found' : 'no open session matches',
                    closed: [],
                  }
                }
                const closed: string[] = []
                for (const s of targets) {
                  // 'agent 关闭会话' — a real end of session, not a crash, and
                  // an audit trail that says so is the point of the log.
                  cleanup(s, `agent 关闭会话（${args.connId ? '指定 connId' : '按设备'}）`)
                  closed.push(s.connId)
                }
                return { ok: true, closed }
              },
            }
            const unregisterClose = registry.register(closeDef)

            // Report which terminals are currently open, so the agent can find
            // a connId to reuse instead of opening a second session per command.
            const sessionsDef = {
              name: 'hillstone_list_sessions',
              description:
                '列出当前打开的终端会话，返回 connId / deviceId / deviceName / status / 是否被 agent 占用。' +
                '用 hillstone_open_terminal 新建，或用这里的 connId 配合 hillstone_send_input。' +
                '用 hillstone_get_output 取输出、用 hillstone_close_terminal 释放不再需要的会话。',
              parameters: {},
              output: toolOutput((v: any) => {
                const rows = v.sessions ?? []
                if (!rows.length) return '当前没有打开的终端会话。'
                return (
                  `当前打开 ${rows.length} 个终端会话：\n` +
                  rows
                    .map(
                      (s: any) =>
                        `- ${s.connId}  ${s.deviceName}  ${s.status}${s.agentActive ? '  [agent 占用中]' : ''}`,
                    )
                    .join('\n') +
                  `\n用 connId 配合 hillstone_send_input / hillstone_get_output；` +
                  `没有需要复用的会话时用 hillstone_open_terminal 新建。`
                )
              }),
              execute() {
                return {
                  ok: true,
                  sessions: [...sessions.values()].map((s) => ({
                    connId: s.connId,
                    deviceId: s.deviceId,
                    deviceName: s.deviceName,
                    status: s.status,
                    agentActive: s.agentActive,
                    openedAt: s.createdAt,
                  })),
                }
              },
            }
            const unregisterSessions = registry.register(sessionsDef)

            // Also expose a list-devices helper so the agent can discover ids.
            const listDef = {
              name: 'hillstone_list_devices',
              description:
                '列出已管理的 Hillstone 设备（**不含密码**），返回 id / 名称 / IP / 账号 / SSH 端口 / 设备类型。' +
                '所有需要 deviceId 的工具都先用本工具查询；不确定该用哪台设备时也先看这里。',
              parameters: {},
              output: toolOutput((v: any) => {
                const rows = v.devices ?? []
                if (!rows.length) {
                  return (
                    '当前没有已管理的设备。请提示用户在「设备运维 → 设备管理」里新增设备，' +
                    '或直接向用户询问要连接的 IP、SSH 端口、账号和密码。'
                  )
                }
                return (
                  `共 ${rows.length} 台设备：\n` +
                  rows
                    .map(
                      (d: any) =>
                        `- id ${d.id}  ${d.name}  ${d.ip}:${d.port ?? 22}  账号 ${d.account}` +
                        `${d.deviceType ? `  类型 ${d.deviceType}` : ''}` +
                        `${d.note ? `  备注：${d.note}` : ''}`,
                    )
                    .join('\n')
                )
              }),
              execute() {
                return { ok: true, devices: [...store.devices.values()].map(toDTO) }
              },
            }
            const unregisterList = registry.register(listDef)
            TOOL_NAMES.push(
              def.name,
              openDef.name,
              inputDef.name,
              outputDef.name,
              closeDef.name,
              sessionsDef.name,
              listDef.name,
            )
            return () => {
              try {
                unregister?.()
                unregisterOpen?.()
                unregisterInput?.()
                unregisterOutput?.()
                unregisterClose?.()
                unregisterSessions?.()
                unregisterList?.()
              } catch {
                /* ignore */
              }
            }
          } catch (e) {
            ctx.logger?.warn?.(
              `[dsh-hillstone-cli-ops] ${TOOL_NAMES.join(' / ')} registration failed: ${(e as Error).message}`,
            )
            // Never swallow a failure silently: a half-registered tool surface is
            // invisible from the UI, and the agent then just reports it cannot
            // operate devices with no clue why. Leave a breadcrumb in the data
            // dir, which is the one place an operator will actually look.
            try {
              const note = `[${new Date().toISOString()}] tool registration failed: ${(e as Error).message}\n`
              appendFileSync(join(resolved.dataDir, 'plugin-errors.log'), note)
            } catch {
              /* ignore — diagnostics must never break activation */
            }
          }
        }, 'dsh-hillstone-cli-ops: tools')
      })
    } catch {
      /* ignore */
    }
  }

  // Clean up on unload / hot reload.
  try {
    const eff = (ctx as any).effect
    if (typeof eff === 'function') {
      eff.call(ctx, () => () => {
        clearInterval(sweepTimer)
        for (const s of [...sessions.values()]) {
          // cleanup() rather than a bare client.end(): a host unload is a real
          // end of session, and the log must say so instead of leaving a record
          // that looks like a machine that crashed.
          cleanup(s, '宿主插件卸载，会话结束')
        }
        sessions.clear()
        try {
          server.close()
        } catch {
          /* ignore */
        }
      }, 'dsh-hillstone-cli-ops: loopback server + sessions')
    }
  } catch {
    /* ignore */
  }
}

export function apply(ctx: ContextLike, config?: Partial<Config>): void {
  try {
    activate(ctx, config)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    try {
      ctx.logger?.warn(`[dsh-hillstone-cli-ops] activation degraded: ${message}`)
    } catch {
      /* ignore */
    }
  }
}
