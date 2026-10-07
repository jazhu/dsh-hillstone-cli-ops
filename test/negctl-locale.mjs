/**
 * Negative control for test/locale-gate.mjs.
 *
 * A gate that has never been seen to fail is an assumption. Each mutation below
 * removes exactly ONE precondition the gate depends on, runs the gate, and
 * requires that the gate reports a MISS and exits non-zero. One mutation per run:
 * stacking them would break every subject at once and you cannot tell which
 * assertion caught what.
 *
 * Two rules learned the hard way and applied here:
 *   - Mutate, run, restore — always in `finally`, with a byte-for-byte compare.
 *     A control that leaves the tree dirty is worse than no control.
 *   - Judge by the line prefix. Both "ok" and "MISS" contain the letters o and k
 *     in different orders; `output.includes('MISS')` is the only honest test.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = fileURLToPath(new URL('..', import.meta.url))
const gate = join(pkgRoot, 'test', 'locale-gate.mjs')
const manifestPath = join(pkgRoot, 'package.json')
const zhPath = join(pkgRoot, 'locale', 'zh.json')
const enPath = join(pkgRoot, 'locale', 'en.json')

const originalManifest = readFileSync(manifestPath, 'utf-8')
const originalZh = readFileSync(zhPath, 'utf-8')
const originalEn = readFileSync(enPath, 'utf-8')

const manifest = () => JSON.parse(originalManifest)
const writeManifest = (json) => writeFileSync(manifestPath, JSON.stringify(json, null, 2) + '\n')

/** Every mutation restores the tree, runs the gate, and reports the verdict. */
const mutations = [
  {
    name: 'exports drops the ./locale/*.json subpath',
    apply: () => {
      const json = manifest()
      delete json.exports['./locale/*.json']
      writeManifest(json)
    },
  },
  {
    name: 'files no longer ships locale/',
    apply: () => {
      const json = manifest()
      json.files = json.files.filter((entry) => entry !== 'locale')
      writeManifest(json)
    },
  },
  {
    name: 'locale/en.json declares an empty meta.title (host textOf() rejects it)',
    apply: () => writeFileSync(enPath, originalEn.replace('"title": "Hillstone Device Ops"', '"title": ""')),
  },
  {
    name: 'locale/zh.json repeats the English title',
    apply: () => writeFileSync(zhPath, originalZh.replace('"title": "Hillstone 设备运维"', '"title": "Hillstone Device Ops"')),
  },
  {
    name: 'locale/zh.json title is ASCII-only',
    apply: () => writeFileSync(zhPath, originalZh.replace('"title": "Hillstone 设备运维"', '"title": "Hillstone Ops"')),
  },
]

let failures = 0
try {
  for (const mutation of mutations) {
    try {
      mutation.apply()
    } catch (error) {
      console.log(`  BROKE  ${mutation.name} — could not apply: ${error.message}`)
      failures++
      continue
    }
    const run = spawnSync(process.execPath, [gate], { encoding: 'utf-8' })
    const reported = (run.stdout || '').trim().split('\n').filter((line) => line.trim().startsWith('MISS'))
    const flipped = reported.length > 0 && run.status !== 0
    console.log(`  ${flipped ? 'ok  ' : 'DEAD'}  ${mutation.name} -> ${reported.length} MISS, exit ${run.status}`)
    if (!flipped) {
      failures++
      console.log((run.stdout || '') + (run.stderr || ''))
    }
    // Restore before the next mutation so each one is observed in isolation.
    writeFileSync(manifestPath, originalManifest)
    writeFileSync(zhPath, originalZh)
    writeFileSync(enPath, originalEn)
  }
} finally {
  writeFileSync(manifestPath, originalManifest)
  writeFileSync(zhPath, originalZh)
  writeFileSync(enPath, originalEn)
}

const restored =
  readFileSync(manifestPath, 'utf-8') === originalManifest &&
  readFileSync(zhPath, 'utf-8') === originalZh &&
  readFileSync(enPath, 'utf-8') === originalEn
console.log(`  ${restored ? 'ok  ' : 'DIRTY'}  gate fixtures restored byte-for-byte`)
if (!restored) failures++

const verdict = failures === 0 && restored
console.log(`\n${verdict ? `NEGATIVE CONTROL OK: ${mutations.length} mutations, each flipped an assertion` : `NEGATIVE CONTROL FAILED (${failures})`}`)
process.exit(verdict ? 0 : 1)