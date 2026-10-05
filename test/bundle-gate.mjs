/**
 * Ship-gate: confirm the built bundles actually contain the terminal fixes.
 * Greps the artefacts, not the sources, so a stale dist cannot pass.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const pkgRoot = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const client = readFileSync(new URL('../dist/client.js', import.meta.url), 'utf-8')
const host = readFileSync(new URL('../dist/index.mjs', import.meta.url), 'utf-8')

const checks = [
  ['client  16-colour cursorAccent', /cursorAccent/, client],
  ['client  monospace font stack', /Cascadia Mono/, client],
  ['client  input batch window', /INPUT_FLUSH_MS|8\)/, client],
  ['client  rAF write coalescing', /requestAnimationFrame/, client],
  ['client  reconnect backoff', /retr(?:y|ies)/i, client],
  ['client  snapshot-tag handling', /snapshot/, client],
  ['client  live font-size change', /fontSize/, client],
  ['client  no external xterm require', /^(?!.*require\(["']xterm["']\)).*$/s, client],
  ['host    pty write queue', /writeQueue/, host],
  ['host    16ms output coalescing', /SSE_FLUSH_MS/, host],
  ['host    SSE keepalive', /ping/, host],
  ['host    snapshot byte cap', /SNAPSHOT_MAX_BYTES/, host],
  ['host    agent tools registered', /hillstone_run_and_analyze/, host],
  // m01728 — device type / web port / copy / session log.
  ['host    device type normalisation', /normalizeDeviceType/, host],
  ['host    device copy route', /devices\\?\/\(\[\^\/\]\+\)\\\/copy|copy/, host],
  ['host    deviceType persisted', /deviceType/, host],
  ['host    webPort persisted', /webPort/, host],
  ['host    session log writer', /SessionLogWriter/, host],
  ['host    log retention sweep', /pruneLogs|LOG_RETENTION_DAYS/, host],
  ['host    logs list route', /\/logs/, host],
  ['host    log reads record agent commands', /agentCommand/, host],
  ['client  device type dropdown', /DEVICE_TYPE_LABELS|next-gen-firewall/, client],
  ['client  web port field', /webPort/, client],
  // esbuild emits the bundle with `charset: ascii`, so CJK labels are escaped
  // to \uXXXX in the artefact and a literal-text check would always miss.
  // m02395 — 新增/编辑/复制 moved into one portalled dialog, 复制 back on the card.
  ['client  copy issued from a device card', /duplicate\(|devices\/\$\{source\.id\}\/copy/, client],
  ['client  复制 label present', /\\u590D\\u5236|复制/, client],
  ['client  dialog portalled to document.body', /createPortal|react-dom/, client],
  ['client  dialog scrim', /\.ops-modal-scrim \{/, client],
  ['client  dialog panel', /\.ops-modal \{/, client],
  ['client  dialog footer', /\.ops-modal-foot \{/, client],
  ['client  dialog feedback banner', /ops-msg err/, client],
  ['client  log tab', /ops-log-entries|LogTab/, client],
  ['client  log tab in the seg control', /logs:/, client],
  ['client  log badge styles', /ops-badge\.type|ops-log-row/, client],
  // m01693 — measured on a real SG-6000: `show cpu detail` parks 13 times at
  // ` --More-- \0` and the pager EATS anything typed there, so an agent command
  // that did not page itself used to hang until the timeout. A silent rot here
  // is invisible in the UI: the tool just returns "timed out" one day.
  ['host    pager detection', /PAGER_RE/, host],
  ['host    pager cap', /PAGER_MAX_PAGES/, host],
  ['host    agent tool: list devices', /hillstone_list_devices/, host],
  ['host    agent tool: open terminal', /hillstone_open_terminal/, host],
  ['host    agent tool: send input', /hillstone_send_input/, host],
  ['host    agent tool: list sessions', /hillstone_list_sessions/, host],
  ['host    agent tool: get output', /hillstone_get_output/, host],
  ['host    agent tool: close terminal', /hillstone_close_terminal/, host],
  // DSH's ToolDefinition contract: a def missing `output.render` does not throw
  // at register time, it just never appears in Tool.listTools — so the plugin
  // looks healthy while every hillstone_* tool is invisible to the agent.
  ['host    tools carry an output block', /output: toolOutput|output\(\)/, host],
  ['host    tool output renders text blocks', /type: "text", text/, host],
  ['host    tool parameters use the flat property table', /required: true, description/, host],
  // The `since` cursor counts bytes, and outputLog is re-sliced by the 512KB
  // cap — a string offset would silently shift under a polling agent.
  ['host    output byte cursor', /outputBytes/, host],
  // m02255 — a native <select> paints a white UA background, which made every
  // CJK label invisible (white-on-white) in the dark theme.
  ['client  select fill pinned to theme', /\.ops-select \{[^}]*background-color/, client],
  ['client  select option fill pinned', /\.ops-select option \{[^}]*background-color/, client],
  // m03353 — an agent connect must land the user on the terminal page, and the
  // injected `terminal length 0` is gone: the SG-6000 rejects it and paginates
  // anyway, so every session opened with a bogus device error on screen.
  ['host    send_input auto-submits a bare command', /looksLikeCommand/, host],
  ['client  host-side connect opens the panel', /revealSidebar\(\)/, client],
  ['client  connect watch polls /conn', /REVEAL_POLL_MS/, client],
  // esbuild rewrites string quotes, so a literal `'terminal'` in the source is
  // `"terminal"` in the product — never pin the quote style in a grep.
  ['client  pending connect switches to the terminal tab', /onRevealTerminal\(\(\) => setTab\(['"]terminal['"]\)\)/, client],
]

// Assert the ABSENCE directly: every check above greps dist/, so a removed
// feature can only be proven gone by looking for it. The SG-6000 answers
// `terminal length 0` with `^-----unrecognized keyword` and paginates anyway,
// so injecting it on connect just put a bogus device error at the top of every
// session. Paging is handled where it happens (--More-- -> space).
const terminalLength = /terminal length 0/.test(host)
console.log(`${terminalLength ? '  MISS' : '  ok  '} host    no terminal length 0 injection (m03353)`)
if (terminalLength) bad++

// m03528 — the conversation-header 「设备运维」 button was removed: the right
// rail is always there, so the second entry point only duplicated the tab and
// widened the chat header. `IconComponent` must survive: the right-rail tab
// strip still uses it as its guide icon.
const headerButton = /conversation\.session\.header\.actions/.test(client)
console.log(`${headerButton ? '  MISS' : '  ok  '} client  no conversation-header button (m03528)`)
if (headerButton) bad++
const railIcon = /icon: IconComponent/.test(client)
console.log(`${railIcon ? '  ok  ' : '  MISS'} client  right-rail tab keeps its guide icon`)
if (!railIcon) bad++

let bad = 0
for (const [name, re, hay] of checks) {
  const ok = re.test(hay)
  if (!ok) bad++
  console.log(`${ok ? '  ok  ' : '  MISS'} ${name}`)
}

// Invert the "no external xterm" check: its regex above always matches, so assert
// the negative directly instead of trusting the positive form.
const xtermExternal = /require\(["']xterm["']\)/.test(client)
console.log(`${xtermExternal ? '  MISS' : '  ok  '} client  xterm inlined (no require("xterm"))`)
if (xtermExternal) bad++

/**
 * Staleness guard. Every feature check above greps dist/, so they all keep
 * passing while dist/ is older than src/ — which is exactly what happened once:
 * a CSS fix landed, the build failed, and the gate still reported BUNDLE OK off
 * the previous build. A fresh mtime is the only way to tell those two states
 * apart, so compare the artefacts against the newest input.
 */
function newestMtime(dir) {
  let newest = 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'dist' || entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) newest = Math.max(newest, newestMtime(full))
    else if (/\.(ts|tsx|mjs|js|css)$/.test(entry.name)) newest = Math.max(newest, statSync(full).mtimeMs)
  }
  return newest
}
const srcMtime = Math.max(newestMtime(join(pkgRoot, 'src')), statSync(join(pkgRoot, 'build.mjs')).mtimeMs)
const distMtime = Math.min(statSync(join(pkgRoot, 'dist', 'client.js')).mtimeMs, statSync(join(pkgRoot, 'dist', 'index.mjs')).mtimeMs)
const stale = distMtime < srcMtime
const ageSec = Math.round((Date.now() - distMtime) / 1000)
console.log(`${stale ? '  MISS' : '  ok  '} client  dist is newer than src (${stale ? 'STALE' : `${ageSec}s old`})`)
if (stale) bad++

console.log(`\n${bad === 0 ? 'BUNDLE OK' : `BUNDLE MISSING ${bad}`}`)
process.exit(bad === 0 ? 0 : 1)
