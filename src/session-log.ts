// Session audit log for dsh-hillstone-cli-ops.
//
// One SSH connection == one log record == one append-only JSONL file, filed
// under the day it started:
//
//   <dataDir>/oplog/2026-10-05/<connId>.jsonl
//
// The first line is a header (which device, which account, when it started);
// every later line is one entry. Appending is the only write, so a session that
// is killed mid-command still leaves a readable log — it just reports no end
// reason, which is the honest answer.
//
// Why per-day directories: retention is "keep 30 days", and with sessions
// bucketed by start date that becomes one readdir plus a name comparison,
// instead of stat-ing every log file to decide whether it is too old.
//
// The log is an audit trail, not a transcript: keystrokes are recorded as the
// host received them, but device output is not. Recording a full `show tech-
// support` dump would multiply the log size by three orders of magnitude for
// information the device's own logs already hold.

import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

import type { LogEntry, LogKind, SessionLog, SessionLogDetail } from './types.ts'

/** Days of history to keep. Swept on activation and then once a day. */
export const LOG_RETENTION_DAYS = 30
/** Entries per session. Past this we stop appending so one runaway session
 *  cannot fill the disk; the last line records that the cap was hit. */
const MAX_ENTRIES = 20_000
/** Longest text kept for one entry. A pasted 100KB blob is logged as a
 *  truncation, not verbatim. */
const MAX_TEXT = 4096
/** `YYYY-MM-DD` in local time — the same day the operator sees in the UI. */
function dayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Substring of `s` with any control characters escaped, for log text. */
function printable(s: string): string {
  return s
    .replace(/\x1b/g, '^[')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\x00/g, '^@')
    .replace(/[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '.')
}

export interface SessionLogMeta {
  connId: string
  deviceId: string
  deviceName: string
  deviceType?: string
  account: string
  ip: string
  port: number
}

/**
 * Append-only writer for one connection.
 *
 * Every method is failure-tolerant on purpose: an unwritable disk must degrade
 * the audit trail, never take the terminal down with it.
 */
export class SessionLogWriter {
  readonly file: string
  private readonly startedAt: string
  private seq = 0
  private lines = 0
  private closed = false
  /**
   * The operator's current input line, rebuilt from the keystrokes so that
   * pressing Enter yields one clean `command` entry instead of making the
   * reader reassemble characters. Also why backspace matters here: a
   * half-typed destructive command that gets corrected must not be logged as if
   * it had been run.
   */
  private line = ''

  constructor(readonly logDir: string, readonly meta: SessionLogMeta) {
    this.startedAt = new Date().toISOString()
    const dayDir = join(logDir, dayKey(new Date(this.startedAt)))
    try {
      mkdirSync(dayDir, { recursive: true })
    } catch {
      /* logging is best-effort; the caller still gets a writer */
    }
    this.file = join(dayDir, `${meta.connId}.jsonl`)
    this.write({ t: 'header', id: meta.connId, ...meta, startedAt: this.startedAt })
  }

  private write(rec: Record<string, unknown>): void {
    if (this.closed) return
    try {
      appendFileSync(this.file, `${JSON.stringify(rec)}\n`, 'utf-8')
      this.lines++
    } catch (e) {
      // One warning, not one per keystroke: an unwritable log dir otherwise
      // floods the host console for the rest of the session.
      this.closed = true
      console.warn('[dsh-hillstone-cli-ops] session log write failed, audit trail stops here:', (e as Error).message)
    }
  }

  private entry(kind: LogKind, text: string, source: 'operator' | 'agent' | 'system'): void {
    if (this.seq >= MAX_ENTRIES) {
      if (this.seq === MAX_ENTRIES) {
        this.seq++
        this.write({ t: 'entry', seq: this.seq, at: new Date().toISOString(), kind: 'event', source: 'system', text: `本次会话日志已达 ${MAX_ENTRIES} 条上限，后续操作不再记录` })
      }
      return
    }
    this.seq++
    this.write({
      t: 'entry',
      seq: this.seq,
      at: new Date().toISOString(),
      kind,
      source,
      text: text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}…(已截断，共 ${text.length} 字符)` : text,
    })
  }

  /**
   * Raw operator input, exactly as it went to the pty. Also feeds the line
   * accumulator so a submitted command is logged as a command.
   */
  input(data: string): void {
    this.entry('input', data, 'operator')
    for (const ch of data) {
      if (ch === '\r' || ch === '\n') {
        const line = this.line.trim()
        this.line = ''
        if (line) this.entry('command', line, 'operator')
        continue
      }
      if (ch === '\x7f' || ch === '\x08') {
        this.line = this.line.slice(0, -1)
        continue
      }
      if (ch === '\x03' || ch === '\x15') {
        // Ctrl-C / Ctrl-U abandon the line without running it.
        this.line = ''
        continue
      }
      if (ch < ' ') continue // remaining control keys carry no line text
      this.line += ch
      if (this.line.length > MAX_TEXT) this.line = this.line.slice(-MAX_TEXT)
    }
  }

  /** A command the agent drove, on this session's visible shell. */
  agentCommand(command: string): void {
    this.entry('command', command, 'agent')
  }

  /** A lifecycle event: connect, disconnect, resize, auth failure. */
  event(text: string, source: 'operator' | 'agent' | 'system' = 'system'): void {
    this.entry('event', text, source)
  }

  /** Close the record. Idempotent; `reason` is free text. */
  close(reason: string): void {
    if (this.closed) return
    this.closed = true
    try {
      appendFileSync(this.file, `${JSON.stringify({ t: 'end', at: new Date().toISOString(), reason, entries: this.seq })}\n`, 'utf-8')
    } catch {
      /* best-effort */
    }
  }
}

// ---- reading ----------------------------------------------------------------

/** Absolute path of the oplog root for a data directory. */
export function logRoot(dataDir: string): string {
  return join(dataDir, 'oplog')
}

/** Delete day directories older than the retention window. Safe to call often. */
export function pruneLogs(logDir: string, retentionDays = LOG_RETENTION_DAYS, now = new Date()): number {
  if (!existsSync(logDir)) return 0
  // Compare on the day key rather than mtime: a session logged "yesterday"
  // belongs to yesterday's bucket even if the process wrote to it at 00:30.
  const cutoffKey = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - retentionDays))
  let removed = 0
  try {
    for (const name of readdirSync(logDir)) {
      // `YYYY-MM-DD` sorts lexicographically in calendar order; anything that
      // is not a day bucket (a stray file) is left alone.
      if (!/^\d{4}-\d{2}-\d{2}$/.test(name) || name >= cutoffKey) continue
      try {
        rmSync(join(logDir, name), { recursive: true, force: true })
        removed++
      } catch (e) {
        console.warn('[dsh-hillstone-cli-ops] cannot remove old log day', name, ':', (e as Error).message)
      }
    }
  } catch (e) {
    console.warn('[dsh-hillstone-cli-ops] prune logs failed:', (e as Error).message)
  }
  return removed
}

/** Parse one JSONL file into a header + entries. Never throws. */
function parseLogFile(file: string): { header: Record<string, unknown> | null; entries: LogEntry[]; end?: { at: string; reason: string; entries: number } } {
  const out: { header: Record<string, any> | null; entries: LogEntry[]; end?: { at: string; reason: string; entries: number } } = { header: null, entries: [] }
  let raw: string
  try {
    raw = readFileSync(file, 'utf-8')
  } catch {
    return out
  }
  for (const line of raw.split('\n')) {
    if (!line) continue
    let rec: any
    try {
      rec = JSON.parse(line)
    } catch {
      continue // a torn final line from a hard kill
    }
    if (rec.t === 'header') out.header = rec
    else if (rec.t === 'entry') {
      out.entries.push({ seq: rec.seq, at: rec.at, kind: rec.kind, text: rec.text, source: rec.source })
    } else if (rec.t === 'end') out.end = { at: rec.at, reason: rec.reason, entries: rec.entries }
  }
  return out
}

/** All recorded sessions, newest first. */
export function listSessionLogs(logDir: string, limit = 200): SessionLog[] {
  if (!existsSync(logDir)) return []
  const out: SessionLog[] = []
  let days: string[]
  try {
    days = readdirSync(logDir).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
  } catch {
    return []
  }
  for (const day of days.sort().reverse()) {
    let files: string[]
    try {
      files = readdirSync(join(logDir, day)).filter((f) => f.endsWith('.jsonl'))
    } catch {
      continue
    }
    for (const f of files) {
      const { header, entries, end } = parseLogFile(join(logDir, day, f))
      if (!header) continue
      out.push({
        id: String(header.connId ?? f.replace(/\.jsonl$/, '')),
        connId: String(header.connId ?? ''),
        deviceId: String(header.deviceId ?? ''),
        deviceName: String(header.deviceName ?? ''),
        deviceType: header.deviceType as SessionLog['deviceType'],
        account: String(header.account ?? ''),
        startedAt: String(header.startedAt ?? ''),
        endedAt: end?.at,
        endReason: end?.reason,
        // No `end` line means the process died with the session open.
        active: !end,
        entryCount: entries.length,
      })
    }
  }
  out.sort((a, b) => (b.startedAt < a.startedAt ? -1 : b.startedAt > a.startedAt ? 1 : 0))
  return out.slice(0, limit)
}

/** One session's full record, or null when the id is unknown or hostile. */
export function readSessionLog(logDir: string, connId: string): SessionLogDetail | null {
  // The id comes straight off the URL, so it must not be able to escape the
  // log directory.
  if (!/^[A-Za-z0-9-]{1,64}$/.test(connId)) return null
  if (!existsSync(logDir)) return null
  let days: string[]
  try {
    days = readdirSync(logDir).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
  } catch {
    return null
  }
  for (const day of days.sort().reverse()) {
    const file = join(logDir, day, `${connId}.jsonl`)
    if (!existsSync(file)) continue
    const { header, entries, end } = parseLogFile(file)
    if (!header) return null
    return {
      id: connId,
      connId: String(header.connId ?? connId),
      deviceId: String(header.deviceId ?? ''),
      deviceName: String(header.deviceName ?? ''),
      deviceType: header.deviceType as SessionLogDetail['deviceType'],
      account: String(header.account ?? ''),
      startedAt: String(header.startedAt ?? ''),
      endedAt: end?.at,
      endReason: end?.reason,
      active: !end,
      entryCount: entries.length,
      entries,
    }
  }
  return null
}

/** Create an empty log root; called on activation so listing is never an error. */
export function ensureLogDir(logDir: string): void {
  try {
    mkdirSync(logDir, { recursive: true })
  } catch (e) {
    console.warn('[dsh-hillstone-cli-ops] cannot create oplog dir:', (e as Error).message)
  }
}

// Referenced by the writer; exported for the regression test's assertions.
export { dayKey, printable, MAX_ENTRIES, MAX_TEXT }
