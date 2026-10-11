// dsh-hillstone-cli-ops — SQLite durable storage for the management data.
//
// Devices and execution policies used to live in two whole-file JSON documents
// rewritten on every mutation. SQLite (node:sqlite, ships with Node 22.19+/24)
// replaces that with an indexed, transactional store — zero new dependencies.
//
// Contract:
//   - the row is the FULL object snapshot (same JSON the in-memory Map holds),
//     including the AES-GCM password ciphertext for devices; encryption stays
//     exactly where it was (key file + encryptSecret/decryptSecret in
//     index.ts), the DB never sees plaintext secrets;
//   - every write is synchronous and best-effort: a storage failure is logged
//     and swallowed so device management never dies with the db;
//   - the in-memory Maps stay the authority for the live view; the DB is
//     written through on every persistStore() and read back only at activation;
//   - a one-time migration imports devices.json / policies.json when the DB is
//     empty and the legacy files exist. The old files are renamed
//     *.imported so a later empty-DB state never re-imports stale data.

import { DatabaseSync } from 'node:sqlite'
import { join } from 'node:path'
import { existsSync, mkdirSync, readFileSync, renameSync } from 'node:fs'

export interface SqliteLogger {
  warn?(message: string): void
  info?(message: string): void
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS devices (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  ip         TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  json       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_devices_name ON devices(name);
CREATE TABLE IF NOT EXISTS policies (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  enabled    INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  json       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_policies_name ON policies(name);
`

export class OpsDb {
  private db: DatabaseSync | undefined
  private readonly dbPath: string
  private readonly log: SqliteLogger

  constructor(dataDir: string, log: SqliteLogger = {}) {
    this.dbPath = join(dataDir, 'ops.db')
    this.log = log
    try {
      mkdirSync(dataDir, { recursive: true })
      this.db = new DatabaseSync(this.dbPath)
      this.db.exec(SCHEMA)
      this.db.exec('PRAGMA journal_mode = WAL;')
    } catch (e) {
      // Management must survive a broken db the way it survived a corrupt JSON
      // file: warn, keep the in-memory maps authoritative, skip all writes.
      this.log.warn?.(`[dsh-hillstone-cli-ops] SQLite 初始化失败，数据仅保存在内存：${(e as Error).message}`)
      this.db = undefined
    }
  }

  get usable(): boolean {
    return this.db !== undefined
  }

  private rows(table: 'devices' | 'policies'): { id: string; json: string }[] {
    if (!this.db) return []
    try {
      return this.db.prepare(`SELECT id, json FROM ${table}`).all() as { id: string; json: string }[]
    } catch {
      return []
    }
  }

  /** Whole-table replace; the maps are small (tens of rows) and this is rare. */
  putDevices(items: { id: string; name: string; ip: string; updatedAt: string; json: string }[]): void {
    if (!this.db) return
    try {
      this.db.exec('BEGIN')
      this.db.prepare('DELETE FROM devices').run()
      const ins = this.db.prepare(
        'INSERT INTO devices (id, name, ip, updated_at, json) VALUES (?, ?, ?, ?, ?)',
      )
      for (const it of items) ins.run(it.id, it.name, it.ip, Date.parse(it.updatedAt) || 0, it.json)
      this.db.exec('COMMIT')
    } catch (e) {
      try { this.db?.exec('ROLLBACK') } catch { /* ignore */ }
      this.log.warn?.(`[dsh-hillstone-cli-ops] 设备写入 SQLite 失败（内存数据不受影响）：${(e as Error).message}`)
    }
  }

  putPolicies(items: { id: string; name: string; enabled: boolean; updatedAt: string; json: string }[]): void {
    if (!this.db) return
    try {
      this.db.exec('BEGIN')
      this.db.prepare('DELETE FROM policies').run()
      const ins = this.db.prepare(
        'INSERT INTO policies (id, name, enabled, updated_at, json) VALUES (?, ?, ?, ?, ?)',
      )
      for (const it of items) ins.run(it.id, it.name, it.enabled ? 1 : 0, Date.parse(it.updatedAt) || 0, it.json)
      this.db.exec('COMMIT')
    } catch (e) {
      try { this.db?.exec('ROLLBACK') } catch { /* ignore */ }
      this.log.warn?.(`[dsh-hillstone-cli-ops] 策略写入 SQLite 失败（内存数据不受影响）：${(e as Error).message}`)
    }
  }

  deviceRows(): { id: string; json: string }[] {
    return this.rows('devices')
  }

  policyRows(): { id: string; json: string }[] {
    return this.rows('policies')
  }

  isEmpty(): boolean {
    return this.deviceRows().length === 0 && this.policyRows().length === 0
  }

  dispose(): void {
    try { this.db?.close() } catch { /* ignore */ }
    this.db = undefined
  }
}

/**
 * One-time import of the legacy JSON files. Only runs when the DB holds
 * nothing; afterwards the files are renamed *.imported so they can never be
 * imported twice (a second import would resurrect deleted devices).
 */
export function migrateLegacyJson(
  db: OpsDb,
  dir: string,
  parse: (json: string) => unknown,
): { devices: number; policies: number } {
  const devFile = join(dir, 'devices.json')
  const polFile = join(dir, 'policies.json')
  if (!existsSync(devFile) && !existsSync(polFile)) return { devices: 0, policies: 0 }
  // The legacy files were BARE ARRAYS (persistDevices wrote [...store.devices.values()]).
  // Tolerate both shapes — bare array or {devices:[...]} / {policies:[...]} wrapper —
  // so the migration does not depend on the caller pre-normalising anything.
  const arr = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? v : [])
  let devices: Record<string, unknown>[] = []
  let policies: Record<string, unknown>[] = []
  try {
    if (existsSync(devFile)) {
      const parsed = parse(readFileSync(devFile, 'utf-8')) as any
      devices = arr(parsed?.devices ?? parsed)
    }
    if (existsSync(polFile)) {
      const parsed = parse(readFileSync(polFile, 'utf-8')) as any
      policies = arr(parsed?.policies ?? parsed)
    }
  } catch {
    return { devices: 0, policies: 0 } // corrupt legacy file — start fresh, as before
  }
  const validDevices = devices.filter((d: any) => d && typeof d.id === 'string' && d.id)
  const validPolicies = policies.filter((p: any) => p && typeof p.id === 'string' && p.id)
  db.putDevices(validDevices.map((d: any) => ({
    id: d.id, name: String(d.name ?? ''), ip: String(d.ip ?? ''), updatedAt: d.updatedAt ?? '', json: JSON.stringify(d),
  })))
  db.putPolicies(validPolicies.map((p: any) => ({
    id: p.id, name: String(p.name ?? ''), enabled: p.enabled !== false, updatedAt: p.updatedAt ?? '', json: JSON.stringify(p),
  })))
  for (const f of [devFile, polFile]) {
    try {
      if (existsSync(f)) renameSync(f, f + '.imported')
    } catch { /* ignore */ }
  }
  return { devices: validDevices.length, policies: validPolicies.length }
}
