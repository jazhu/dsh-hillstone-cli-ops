// Negative control for the m10068 gate assertions (2 mutations, each applied to
// a fresh copy of the original source, rebuilt in place, each must flip an
// assertion to MISS; the source is restored byte-for-byte at the end).
//
// Rebuilding in place (rather than in a scratch dir) is what the gate needs: it
// greps dist/, and a scratch copy has no node_modules and cannot build at all.
//
//   node %TEMP%\negctl-m10068.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const ROOT = 'D:/workspace/dsh_plugin/dsh-hillstone-cli-ops'
const NODE = 'C:/Users/jazhu/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/node/bin/node.exe'
const TARGET = join(ROOT, 'src', 'web-login.ts')
const original = readFileSync(TARGET, 'utf-8')

// negLine rebuilds a whole line from a unique marker, because a string literal
// carrying regex escapes cannot be patched by substring replace (the tool
// decodes \n in the needle, so it never matches).
function negLine(src, marker, replacement) {
  const lines = src.split('\n')
  const at = lines.findIndex((l) => l.includes(marker))
  if (at < 0) throw new Error('marker not found: ' + marker)
  lines[at] = replacement
  return lines.join('\n')
}

const mutations = [
  {
    name: 'pinned viewport comes back',
    apply: (s) => s.replace('viewport: null,', 'viewport: { width: 1440, height: 900 },'),
  },
  {
    name: 'the window is force-maximized',
    apply: (s) => negLine(s, 'viewport: null,', "      viewport: null, args: ['--start-maximized'],"),
  },
]

let bad = 0
try {
  for (const m of mutations) {
    const mutated = m.apply(original)
    if (mutated === original) {
      console.log('  BROKE mutation did not change the file: ' + m.name)
      bad++
      continue
    }
    writeFileSync(TARGET, mutated)
    execFileSync(NODE, [join(ROOT, 'build.mjs')], { stdio: 'ignore', cwd: ROOT })
    let out = ''
    let code = 0
    try {
      out = execFileSync(NODE, [join(ROOT, 'test', 'bundle-gate.mjs')], {
        encoding: 'utf-8',
        cwd: ROOT,
      })
    } catch (e) {
      out = e.stdout ?? ''
      code = e.status ?? 1
    }
    const misses = out.split('\n').filter((l) => /^\s*MISS/.test(l))
    const broke = /SyntaxError|error TS/.test(out)
    if (broke) {
      console.log(`  BROKE ${m.name} — gate no longer parses`)
      bad++
    } else if (code === 0 || misses.length === 0) {
      console.log(`  DEAD  ${m.name} — gate still passed (exit ${code})`)
      bad++
    } else {
      console.log(`  ok    ${m.name} -> ${misses.length} MISS, exit ${code}`)
    }
  }
} finally {
  writeFileSync(TARGET, original)
  execFileSync(NODE, [join(ROOT, 'build.mjs')], { stdio: 'ignore', cwd: ROOT })
  const restored = readFileSync(TARGET, 'utf-8')
  if (restored !== original) {
    console.log('  FAIL src/web-login.ts was NOT restored byte-for-byte')
    bad++
  } else {
    console.log('  ok    src/web-login.ts restored byte-for-byte')
  }
}

if (bad) {
  console.log(`\nNEGATIVE CONTROL FAILED: ${bad} problem(s)`)
  process.exit(1)
}
console.log('\nNEGATIVE CONTROL OK')
