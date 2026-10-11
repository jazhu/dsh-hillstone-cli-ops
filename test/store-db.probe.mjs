// Offline probe for src/store-db.ts (SQLite persistence).
// Covers: put/read roundtrip, whole-table replace (delete+put), reopen
// persistence, WAL files present, and legacy JSON migration with *.imported rename.
import { mkdtempSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { OpsDb, migrateLegacyJson } from '../src/store-db.ts'

let pass = 0, fail = 0
const check = (name, cond, detail = '') => {
  if (cond) { pass++; console.log(`  ok   ${name}`) }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`) }
}

const dir = mkdtempSync(join(tmpdir(), 'opsdb-'))

// 1. roundtrip + replace
{
  const db = new OpsDb(dir)
  check('db usable', db.usable)
  db.putDevices([
    { id: 'd1', name: 'fw-a', ip: '10.0.0.1', updatedAt: '2026-10-11T00:00:00Z', json: '{"id":"d1","name":"fw-a","password":"ENC"}' },
    { id: 'd2', name: 'fw-b', ip: '10.0.0.2', updatedAt: '2026-10-11T00:00:01Z', json: '{"id":"d2","name":"fw-b"}' },
  ])
  db.putPolicies([{ id: 'p1', name: '只读巡检', enabled: false, updatedAt: '2026-10-11T00:00:00Z', json: '{"id":"p1","enabled":false}' }])
  check('devices readable', db.deviceRows().length === 2)
  check('policies readable', db.policyRows().length === 1)
  // replace: delete d1, change d2 → still 1 device, new json
  db.putDevices([{ id: 'd2', name: 'fw-b2', ip: '10.0.0.2', updatedAt: '2026-10-11T01:00:00Z', json: '{"id":"d2","name":"fw-b2"}' }])
  const rows = db.deviceRows()
  check('replace drops deleted rows', rows.length === 1 && rows[0].id === 'd2' && rows[0].json.includes('fw-b2'), JSON.stringify(rows))
  db.dispose()
}

// 2. reopen — data persists, WAL present
{
  const db = new OpsDb(dir)
  const rows = db.deviceRows()
  check('reopen keeps devices', rows.length === 1 && JSON.parse(rows[0].json).name === 'fw-b2')
  check('policies survive reopen', db.policyRows().length === 1)
  const files = readdirSync(dir).filter((f) => f.startsWith('ops.db'))
  check('db files exist (ops.db*)', files.some((f) => f === 'ops.db'), files.join(','))
  db.dispose()
}

// 3. legacy JSON migration
{
  const dir2 = mkdtempSync(join(tmpdir(), 'opsdb-legacy-'))
  writeFileSync(join(dir2, 'devices.json'), JSON.stringify([
    { id: 'a', name: '旧设备', ip: '1.2.3.4', password: 'ENC', updatedAt: '2026-01-01T00:00:00Z' },
    { id: null, name: '坏行' },
  ]))
  writeFileSync(join(dir2, 'policies.json'), JSON.stringify([{ id: 'p', name: '巡检', commands: ['show clock'] }]))
  const db = new OpsDb(dir2)
  // The legacy files were bare arrays; the parse callback just JSON.parses.
  const r = migrateLegacyJson(db, dir2, (raw) => JSON.parse(raw))
  check('migration counts', r.devices === 1 && r.policies === 1, JSON.stringify(r))
  check('bad row skipped', db.deviceRows().length === 1 && db.deviceRows()[0].id === 'a')
  check('devices.json renamed', !existsSync(join(dir2, 'devices.json')) && existsSync(join(dir2, 'devices.json.imported')))
  check('policies.json renamed', existsSync(join(dir2, 'policies.json.imported')))
  // second migrate is a no-op
  const r2 = migrateLegacyJson(db, dir2, (raw) => JSON.parse(raw))
  check('no double import', r2.devices === 0 && r2.policies === 0)
  db.dispose()
}

// 4. broken db dir → constructor must not throw; unusable db tolerates calls.
{
  let threw = false
  try {
    const bad = new OpsDb(join(dir, 'file-blocker'))
    // Make the path undivable: create a FILE where the db dir would be.
  } catch { threw = true }
  check('construction of valid path ok', !threw)
  // Now a genuinely blocked path: a file occupying the db's directory slot.
  const blockerPath = join(dir, 'blocker')
  writeFileSync(blockerPath, 'x')
  let threw2 = false
  let bad = null
  try {
    bad = new OpsDb(join(blockerPath, 'nested')) // mkdir under a file → fails
  } catch (e) { threw2 = true; console.log('  (unexpected throw: ' + e.message + ')') }
  check('blocked path does not throw during construction', !threw2)
  if (bad) {
    check('blocked path reports unusable', bad.usable === false, String(bad.usable))
    bad.putDevices([{ id: 'x', name: 'x', ip: 'x', updatedAt: '', json: '{}' }])
    check('blocked path tolerates putDevices', true)
    bad.dispose()
  }
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
