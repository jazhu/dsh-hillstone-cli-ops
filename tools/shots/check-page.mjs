// Checks the plugin page's own invariants: balanced tags, no placeholder text,
// every referenced asset actually exists, and no asset is left unreferenced.
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

const PAGE = 'D:/workspace/dsh_plugin/dsh-hillstone-cli-ops/docs/插件介绍.html'
const DIR = dirname(PAGE)
const html = readFileSync(PAGE, 'utf8')

let bad = 0
const fail = (m) => { console.log('  FAIL ' + m); bad++ }

// ---- tag balance ----
const VOID = new Set(['meta', 'link', 'br', 'hr', 'img', 'input', 'source'])
for (const tag of ['section', 'div', 'figure', 'table', 'tr', 'td', 'th', 'p', 'h1', 'h2', 'h3', 'h4', 'ul', 'li', 'main', 'header', 'footer', 'html', 'body', 'style', 'thead', 'tbody']) {
  const open = (html.match(new RegExp('<' + tag + '(\\s|>)', 'g')) || []).length
  const close = (html.match(new RegExp('</' + tag + '>', 'g')) || []).length
  if (open !== close) fail(`${tag} ${open} open vs ${close} close`)
  else console.log(`  ok   ${tag} ${open}/${close}`)
}

// ---- referenced assets exist ----
const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1])
const local = refs.filter((r) => !/^(https?:|#|data:)/.test(r))
console.log('\nlocal refs:', local.length)
for (const r of local) {
  const p = join(DIR, decodeURIComponent(r))
  if (existsSync(p)) console.log(`  ok   ${r}`)
  else fail(`missing asset: ${r}`)
}

// ---- no asset left unused ----
const onDisk = readdirSync(join(DIR, 'assets')).filter((f) => f.endsWith('.png'))
console.log('\npng on disk:', onDisk.length)
for (const f of onDisk) {
  if (local.includes('assets/' + f)) console.log(`  ok   ${f} is referenced`)
  else fail(`unreferenced png: ${f}`)
}

// ---- no placeholder text ----
for (const badWord of ['TODO', 'FIXME', '待补充', '占位', 'lorem', 'XXX']) {
  if (html.includes(badWord)) fail(`placeholder text: ${badWord}`)
}

// ---- external resources ----
const external = refs.filter((r) => /^https?:/.test(r))
console.log('\nexternal refs:', external.length, external.join(' '))

console.log(bad ? `\n${bad} PROBLEM(S)` : '\nPAGE OK')
process.exit(bad ? 1 : 0)
