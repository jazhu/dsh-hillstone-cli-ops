/**
 * Negative control for the m09852 dialog-placement assertions in bundle-gate.mjs.
 *
 * Only the three rows this change added are exercised; the rest of the gate is
 * already covered by the suite it runs alongside. Same two rules as every other
 * control in this repo: break exactly ONE precondition per run, and judge the
 * verdict by the line prefix (`ok` and `MISS` both contain the letters o and k).
 *
 * Every mutation here is a re-introduction of the *old* layout — right-anchored,
 * edge-padded, blurred. That is the point: these are the three states the user
 * just asked to get rid of, so if the gate cannot catch them coming back it is
 * not guarding the thing it claims to guard.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const pkgRoot = fileURLToPath(new URL('..', import.meta.url))
const gate = join(pkgRoot, 'test', 'bundle-gate.mjs')
const clientPath = join(pkgRoot, 'src', 'client.tsx')

const original = readFileSync(clientPath, 'utf-8')

/** Replace the whole scrim rule, so the edit lands on exactly one line of it. */
const scrimRule = (declaration) => {
  const start = original.indexOf('.ops-modal-scrim {')
  if (start < 0) throw new Error('could not find the .ops-modal-scrim rule')
  const end = original.indexOf('\n', start)
  return `${original.slice(0, start)}${declaration}\n${original.slice(end + 1)}`
}

const mutations = [
  {
    name: 'the scrim goes right-anchored again (justify-content: flex-end)',
    apply: () => {
      const current = readFileSync(clientPath, 'utf-8')
      const start = current.indexOf('.ops-modal-scrim {')
      const end = current.indexOf('\n', start)
      const line = current.slice(start, end).replace('justify-content: center', 'justify-content: flex-end')
      writeFileSync(clientPath, current.slice(0, start) + line + '\n' + current.slice(end + 1))
    },
  },
  {
    name: 'the scrim regains the asymmetric edge padding',
    apply: () => {
      const current = readFileSync(clientPath, 'utf-8')
      const start = current.indexOf('.ops-modal-scrim {')
      const end = current.indexOf('\n', start)
      const line = current
        .slice(start, end)
        .replace('background: var', 'padding: 32px 32px 32px 8px; box-sizing: border-box; background: var')
      writeFileSync(clientPath, current.slice(0, start) + line + '\n' + current.slice(end + 1))
    },
  },
  {
    name: 'the scrim grows a 40px backdrop blur',
    apply: () => {
      const current = readFileSync(clientPath, 'utf-8')
      const start = current.indexOf('.ops-modal-scrim {')
      const end = current.indexOf('\n', start)
      const line = current
        .slice(start, end)
        .replace('background: var', 'backdrop-filter: blur(40px); background: var')
      writeFileSync(clientPath, current.slice(0, start) + line + '\n' + current.slice(end + 1))
    },
  },
  {
    name: 'the whole scrim rule is deleted',
    apply: () => {
      const current = readFileSync(clientPath, 'utf-8')
      const start = current.indexOf('.ops-modal-scrim {')
      if (start < 0) throw new Error('could not find the .ops-modal-scrim rule')
      const end = current.indexOf('\n', start)
      writeFileSync(clientPath, current.slice(0, start) + current.slice(end + 1))
    },
  },
]

let failures = 0
try {
  for (const mutation of mutations) {
    // Each mutation starts from the pristine source, never from the previous
    // mutation's leftovers, so one broken subject cannot explain the next miss.
    writeFileSync(clientPath, original)
    try {
      mutation.apply()
    } catch (error) {
      console.log(`  BROKE ${mutation.name} — ${error.message}`)
      failures++
      continue
    }
    const run = spawnSync(process.execPath, [gate], { encoding: 'utf-8' })
    const output = (run.stdout || '') + (run.stderr || '')
    if (/SyntaxError|error TS/.test(output)) {
      // A mutation that stops the gate from parsing at all looks exactly like a
      // gate whose assertions are dead: it prints no rows. Say so out loud.
      console.log(`  BROKE ${mutation.name} — the gate no longer parses`)
      console.log(output.split('\n').slice(0, 4).join('\n'))
      failures++
      continue
    }
    const reported = (run.stdout || '').trim().split('\n').filter((line) => line.trim().startsWith('MISS'))
    const flipped = reported.length > 0 && run.status !== 0
    console.log(`  ${flipped ? 'ok  ' : 'DEAD'} ${mutation.name} -> ${reported.length} MISS, exit ${run.status}`)
    if (!flipped) failures++
  }
} finally {
  writeFileSync(clientPath, original)
}

const restored = readFileSync(clientPath, 'utf-8') === original
console.log(`  ${restored ? 'ok  ' : 'DIRTY'} src/client.tsx restored byte-for-byte`)
if (!restored) failures++

const verdict = failures === 0 && restored
console.log(`\n${verdict ? `NEGATIVE CONTROL OK: ${mutations.length} mutations, each flipped an assertion` : `NEGATIVE CONTROL FAILED (${failures})`}`)
process.exit(verdict ? 0 : 1)