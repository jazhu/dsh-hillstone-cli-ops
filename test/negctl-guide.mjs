// Negative control for the m06703 guide assertion.
//
// A gate assertion that passes for the wrong reason is worse than no assertion,
// because it reads as coverage. The bundle ships CJK as \uXXXX escapes (esbuild
// emits charset: ascii) and bundle-gate.mjs decodes them before matching, so the
// mutation has to be applied to the ESCAPED form -- mutating the decoded phrase
// finds nothing and the check "passes" vacuously.
//
//   node test/negctl-guide.mjs
//
// Exits 0 only if the gate FAILS on the mutated bundle and PASSES on the real
// one, and leaves dist/client.js exactly as it found it.
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const BUNDLE = 'dist/client.js'
const PHRASE = '「执行策略」限定' // 「执行策略」限定
const original = readFileSync(BUNDLE)
const backup = `${BUNDLE}.negctl.bak`
copyFileSync(BUNDLE, backup)

// esbuild emits UPPERCASE hex in its \uXXXX escapes, so the case has to match
// byte-for-byte or this finds nothing and the "negative control" passes
// vacuously -- which is the exact failure this probe exists to catch.
const esc = (s) => [...s].map((c) => (c.codePointAt(0) > 0x7f ? `\\u${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}` : c)).join('')
const escaped = esc(PHRASE)

const runGate = () => {
  try {
    return execFileSync(process.execPath, ['test/bundle-gate.mjs'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  } catch (err) {
    return (err.stdout ?? '') + (err.stderr ?? '')
  }
}

// Match the gate's own line, and read the verdict off the prefix -- the "ok"
// and "MISS" labels both contain the letters of "ok", so a substring test for
// "ok" would report a MISS as a pass and declare the probe's own detection
// vacuous when it is the assertion that is.
const verdictOf = (out) => {
  const line = out.split('\n').find((l) => l.includes('names the 执行策略 tab'))
  if (line === undefined) return 'absent'
  return line.trim().startsWith('ok') ? 'ok' : 'MISS'
}

let exitCode = 0
try {
  const text = original.toString('utf8')
  if (!text.includes(escaped)) {
    console.error(`SETUP ERROR: the escaped phrase ${escaped} is not in ${BUNDLE}; cannot run a negative control`)
    console.error('  (if the bundle changed shape, fix this probe before trusting the gate)')
    process.exit(2)
  }

  const before = verdictOf(runGate())

  writeFileSync(BUNDLE, text.replace(escaped, esc('XX')))
  const after = verdictOf(runGate())

  console.log(`escaped phrase in bundle : ${escaped}`)
  console.log(`real bundle    -> ${before}    (must be ok)`)
  console.log(`mutated bundle -> ${after}    (must be MISS)`)

  if (before !== 'ok') {
    console.error(`FAILED: the assertion reports ${before} on the real bundle, so it is not measuring anything`)
    exitCode = 3
  } else if (after !== 'MISS') {
    console.error(`FAILED: the assertion reports ${after} after the phrase was removed — it does not react to the thing it claims to guard`)
    exitCode = 4
  } else {
    console.log('\nNEGATIVE CONTROL OK — the m06703 assertion is load-bearing')
  }
} finally {
  copyFileSync(backup, BUNDLE)
  // Confirm the restore was byte-exact, so a crash here cannot leave a
  // doctored artefact that the next gate run would happily accept.
  const restored = readFileSync(BUNDLE)
  console.log(`restored ${BUNDLE} byte-exact: ${restored.equals(original)}`)
  if (!restored.equals(original)) exitCode = 5
}
process.exit(exitCode)
