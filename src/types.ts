// Shared types for dsh-hillstone-cli-ops.
//
// These are safe to import from both the host (Node) and client (browser)
// halves: no Node or DOM-only imports live here.

// ---- device type ------------------------------------------------------------

/**
 * Product line a device belongs to. The value is a stable slug: it is persisted
 * in devices.json and sent to the browser, so renaming one is a migration.
 * `other` is what an unrecognised or missing value degrades to, which keeps
 * every read path total — a device saved before this field existed still
 * renders instead of blowing up on `undefined`.
 */
export const DEVICE_TYPES = [
  'next-gen-firewall',
  'intrusion-detection',
  'intrusion-prevention',
  'web-application-firewall',
  'load-balancer',
  'other',
] as const

export type DeviceType = (typeof DEVICE_TYPES)[number]

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  'next-gen-firewall': '下一代防火墙',
  'intrusion-detection': '入侵检测',
  'intrusion-prevention': '入侵防御',
  'web-application-firewall': 'Web 应用防火墙',
  'load-balancer': '负载均衡',
  other: '其他',
}

/** Narrow an untrusted string to a DeviceType, defaulting rather than throwing. */
export function normalizeDeviceType(value: unknown): DeviceType {
  return typeof value === 'string' && (DEVICE_TYPES as readonly string[]).includes(value)
    ? (value as DeviceType)
    : 'other'
}

/** A managed device. Password is encrypted at rest on the host and never sent
 *  back to the browser in plaintext (see DeviceDTO). */
export interface Device {
  id: string
  name: string
  ip: string
  account: string
  /** AES-256-GCM ciphertext (base64) on disk; resolved by the host at connect. */
  password: string
  port: number
  /** Optional free-text note shown in the list. */
  note?: string
  /** Product line; `other` when unset. See DEVICE_TYPES. */
  deviceType: DeviceType
  /** Management web UI port (https port). Distinct from the SSH `port`. */
  webPort?: number
  createdAt: string
  updatedAt: string
}

/** Device as exposed to the client: password is never included. */
export type DeviceDTO = Omit<Device, 'password'>

/** Payload accepted when creating or updating a device. */
export interface DeviceInput {
  name: string
  ip: string
  account: string
  /** Plaintext password from the UI; host encrypts before persisting. */
  password?: string
  port?: number
  note?: string
  deviceType?: DeviceType
  webPort?: number
}

/** Connection status reported to the client. */
export type ConnectionStatus = 'connecting' | 'ready' | 'error' | 'closed'

export interface ConnectionInfo {
  connId: string
  deviceId: string
  deviceName: string
  status: ConnectionStatus
  createdAt: string
  /** Last error message, if status is 'error'. */
  error?: string
  /**
   * The DSH session that asked for this connection (m04040).
   *
   * The host's right sidebar is per-session: `ctx.sidebarRight.openTab` always
   * acts on the session currently on screen, which is not necessarily the one
   * that opened the connection. Carrying the caller's session id lets the
   * client put the tab in the right place instead of wherever the user happens
   * to be looking. Absent when the initiator is not a DSH session (a bare
   * HTTP call from outside the app).
   */
  originSessionId?: string
}

/**
 * Liveness verdict for one device (m03664).
 *
 * `online` means the SSH port completed a TCP handshake. It says nothing about
 * the account, the password, or whether the CLI answers — it answers exactly
 * one question: is the box powered on and is the port reachable.
 */
export interface DeviceLiveness {
  deviceId: string
  ip: string
  port: number
  state: 'online' | 'offline' | 'probing'
  /** TCP handshake round-trip time in ms. Absent when the probe failed. */
  ms?: number
  /** Why the probe failed: 'refused' | 'timeout' | 'unreachable' | … */
  error?: string
}

export interface LivenessReport {
  results: DeviceLiveness[]
}

/**
 * Outcome of a WebUI login attempt (m05288).
 *
 * The status is a *report*, not a request: the browser window belongs to the
 * operator the moment automation is done, so every status except `error` can
 * end with a live window on screen.
 *
 *   idle    — nothing attempted yet.
 *   ready   — the device accepted the credentials (or the saved session was
 *             still valid). The window shows the management UI.
 *   captcha — the device rejected the password and now demands a graphical
 *             captcha. Automation stops here on purpose: a second automated
 *             attempt would fail even with the right password, so the operator
 *             finishes the login in the window by hand.
 *   error   — the page never loaded, the browser could not start, or the device
 *             did not answer.
 */
export type WebLoginStatus = 'idle' | 'ready' | 'captcha' | 'error'

export interface WebLoginState {
  deviceId: string
  /** The management UI URL that was opened, for display. */
  url: string
  status: WebLoginStatus
  /** ISO time of this verdict. */
  at: string
  /** Human-readable reason, always present for `captcha` and `error`. */
  message?: string
}

/** Agent analysis request: run one or more commands and analyze the output. */
export interface AnalyzeRequest {
  deviceId: string
  /** Shell commands to run, in order. */
  commands: string[]
  /** Natural-language analysis prompt (what the operator wants to know). */
  task: string
  /** Per-command execution timeout in ms (default 30000). */
  timeoutMs?: number
  /**
   * Drive the operator's live terminal session so the agent's work scrolls on
   * screen (default true). `false` forces a private SSH exec channel.
   */
  preferSession?: boolean
}

export interface CommandResult {
  command: string
  exitCode: number | null
  stdout: string
  stderr: string
  timedOut: boolean
  /**
   * Set when the command was executed on an operator's already-open terminal
   * session (so its output is visible in the UI) rather than a private SSH
   * channel. Absent when a private channel was used.
   */
  viaSession?: string
  /**
   * How many times the agent had to page the device's `--More--` prompt to get
   * the full output. Present only when the pager actually interfered, which is
   * the signal that the device ignored `terminal length 0`.
   */
  pages?: number
  /**
   * Set when the command was rejected by an 执行策略 rule instead of running.
   * The host blocks it before any SSH work happens, so there is no exit code and
   * no device output — `stderr` carries the human-readable reason.
   */
  blocked?: boolean
  /** The policy name that blocked the command, when `blocked` is true. */
  blockReason?: string
}

// ---- execution policy (执行策略) --------------------------------------------
//
// A policy is a user-authored record: a time window plus the command patterns the
// operator typed, with no built-in deny list on the host. Multiple policies stack
// — a command is blocked if ANY enabled policy matches it for the current time.

/** A recurring daily time window. Times are "HH:MM" (24h) in the policy's tz. */
export interface PolicyWindow {
  /** Inclusive start, e.g. "22:00". Empty means "from midnight". */
  start?: string
  /** Exclusive end, e.g. "06:00". Empty or <= start means "until midnight". */
  end?: string
  /** IANA or "±HH:MM" zone; defaults to the host's local zone. */
  timezone?: string
}

export interface ExecPolicy {
  id: string
  /** Display name, e.g. "夜间冻结高危命令". */
  name: string
  /** When false the policy is ignored entirely (still shown in the list). */
  enabled: boolean
  /** Daily recurring window the rule applies in. Absent = always active. */
  window?: PolicyWindow
  /**
   * Command patterns (one per line in the UI). A command is blocked if the
   * pattern matches as a case-insensitive word-boundary substring — so "reload"
   * blocks "reload" and "reload force" but not "reloading".
   */
  commands: string[]
  /** Free-text note, shown in the list. */
  note?: string
  createdAt: string
  updatedAt: string
}

/** Payload accepted when creating or updating a policy. `id` is assigned on POST. */
export interface PolicyInput {
  name: string
  enabled?: boolean
  window?: PolicyWindow
  commands: string[]
  note?: string
}

export interface AnalyzeResponse {
  deviceId: string
  deviceName: string
  results: CommandResult[]
  /** Model-written analysis; empty when no LLM service is available. */
  analysis: string
  /** True when the host had no LLM service to analyze with. */
  analysisUnavailable: boolean
}

// ---- session log ------------------------------------------------------------

/**
 * What a log entry records.
 *
 * `input`  — raw bytes the operator typed, exactly as they went to the pty.
 *            Key-level granularity on purpose: an operator who fat-fingers a
 *            destructive command and backspaces it is part of the audit trail.
 * `command`— one submitted line. Carries the assembled text plus where it came
 *            from, so a replayed line is attributable to the operator or to the
 *            agent instead of being an anonymous blob.
 * `event`  — lifecycle: connect, disconnect, auth failure, size change.
 */
export type LogKind = 'input' | 'command' | 'event'

export interface LogEntry {
  /** Monotonic within a session; lets a reader order entries after a JSONL re-parse. */
  seq: number
  /** ISO timestamp of when the entry was recorded. */
  at: string
  kind: LogKind
  /** Free text: the keystrokes, the command line, or the event description. */
  text: string
  /** For `command` entries: who ran it. For `event`: the event name. */
  source?: 'operator' | 'agent' | 'system'
}

/**
 * One SSH connection's audit record. The user-facing unit of the log view: a
 * single file that starts when a device is connected and ends when it drops.
 */
export interface SessionLog {
  /** `oplog_<connId>`; also the file's basename. */
  id: string
  connId: string
  deviceId: string
  deviceName: string
  deviceType?: DeviceType
  account: string
  /** ISO timestamps bracketing the session. */
  startedAt: string
  endedAt?: string
  /** Set when the session ended abnormally or is still open. */
  endReason?: string
  /** True while the SSH connection is still live. */
  active: boolean
  /** Count of entries, so the list view doesn't need to read every file. */
  entryCount: number
}

/** A session log plus its entries, as returned by GET /logs/:id. */
export interface SessionLogDetail extends SessionLog {
  entries: LogEntry[]
}
