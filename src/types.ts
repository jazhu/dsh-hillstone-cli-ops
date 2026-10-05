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
