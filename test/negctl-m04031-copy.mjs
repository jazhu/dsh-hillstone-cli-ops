/**
 * Negative control for the two m04031 assertions in test/bundle-gate.mjs.
 *
 * Why this one exists: the "复制 no longer POSTs on click" check spent its whole
 * life guarding a single identifier, `duplicate`. When the handler was renamed
 * to `openCopy` the regex stopped being able to notice the regression it is
 * named after -- an async openCopy IS "POSTs the moment the button is pressed".
 * Nothing failed. The gate kept printing ok while guarding nothing, which is the
 * quietest possible way for a gate to die.
 *
 * So the check now accepts both spellings. This script is what keeps that from
 * being a comment instead of a fact: it reintroduces the async form under each
 * name and requires the gate to notice.
 *
 * Rules applied here (both learned the hard way elsewhere in this repo):
 *   - One mutation per run. Stacking them breaks every subject at once and you
 *     cannot tell which assertion caught what.
 *   - Mutate, run, restore -- always in `finally`, byte-for-byte verified. A
 *     control that leaves the tree dirty is worse than no control.
 *   - Judge by the line PREFIX. "ok" and "MISS" share letters; `includes('MISS')`
 *     on the whole output is the only honest test.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = fileURLToPath(new URL('..', import.meta.url))
const gate = join(pkgRoot, 'test', 'bundle-gate.mjs')
const srcPath = join(pkgRoot, 'src', 'client.tsx')

const original = readFileSync(srcPath, 'utf-8')

/** Locate the line declaring the handler, so we can rewrite it in place. */
const DECL = /^(.*const )(openCopy|duplicate)( = \(source: DeviceDTO\) => \{)$/m

function verifyDeclarationPresent() {
  if (!DECL.test(original)) {
    throw new Error(
      'src/client.tsx no longer declares the handler this control expects. ' +
        'Repoint DECL at the new spelling instead of letting this script pass by ' +
        'mutating nothing.',
    )
  }
}
verifyDeclarationPresent()

/**
 * Make the handler async, which is the shape m04031 forbids: an async click
 * handler that awaits a POST before opening the dialog is the original bug.
 */
function makeAsync(name) {
  return original.replace(
    new RegExp(`const ${name} = \\(source: DeviceDTO\\) => \\{`),
    `const ${name} = async (source: DeviceDTO) => {`,
  )
}

const mutations = [
  {
    name: 'openCopy becomes async again (the regression, under the current name)',
    apply: () => writeFileSync(srcPath, makeAsync('openCopy'), 'utf-8'),
  },
  {
    name: 'duplicate is reintroduced and made async (the original spelling)',
    apply: () =>
      writeFileSync(
        srcPath,
        original
          .replace('const openCopy = (source: DeviceDTO) => {', 'const duplicate = async (source: DeviceDTO) => {')
          .replace('openCopy(d)', 'duplicate(d)'),
        'utf-8',
      ),
  },
  {
    name: 'the handler is renamed to something the gate has never heard of',
    apply: () =>
      writeFileSync(
        srcPath,
        original
          .replace('const openCopy = (source: DeviceDTO) => {', 'const cloneDeviceAsync = async (source: DeviceDTO) => {')
          .replace('openCopy(d)', 'cloneDeviceAsync(d)'),
        'utf-8',
      ),
  },
]

let bad = 0
for (const m of mutations) {
  let result
  try {
    m.apply()
    result = spawnSync(process.execPath, [gate], { cwd: pkgRoot, encoding: 'utf-8' })
    const output = (result.stdout ?? '') + (result.stderr ?? '')
    const lines = output.split('\n').filter((l) => l.trim().startsWith('MISS'))
    if (lines.length === 0 || result.status === 0) {
      bad++
      console.log(`  FAIL  ${m.name} -> gate did NOT object (exit ${result.status})`)
      if (lines.length === 0 && result.status !== 0) {
        console.log('        (gate failed to parse -- that is not the same as the check biting)')
      }
    } else {
      console.log(`  ok    ${m.name} -> ${lines.length} MISS, exit ${result.status}`)
    }
  } finally {
    writeFileSync(srcPath, original, 'utf-8')
    const restored = readFileSync(srcPath, 'utf-8')
    if (restored !== original) {
      console.log('  FAIL  src/client.tsx was NOT restored byte-for-byte')
      bad++
    }
  }
}

if (bad > 0) {
  console.log(`\nNEGATIVE CONTROL FAILED: ${bad} mutation(s) went unnoticed`)
  process.exit(1)
}
console.log(`\nNEGATIVE CONTROL OK: ${mutations.length} mutations, each flipped an assertion`)