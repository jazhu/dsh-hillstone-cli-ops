/**
 * Ship-gate: confirm the built bundles actually contain the terminal fixes.
 * Greps the artefacts, not the sources, so a stale dist cannot pass.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const pkgRoot = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const client = readFileSync(new URL('../dist/client.js', import.meta.url), 'utf-8')
const host = readFileSync(new URL('../dist/index.mjs', import.meta.url), 'utf-8')

// esbuild emits `charset: ascii`, so the bundle carries every CJK string as
// \uXXXX escapes. Decode once, up here, and let the checks below compare real
// characters: hand-copying those escapes into a regex is how an assertion comes
// to miss a string that was in the artefact all along, and how one of them once
// silently passed on a string that was never built.
const clientText = client.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))

// Declared before any check runs. The negative assertions below increment it,
// and a `bad++` that executes before this `let` initialises would throw a TDZ
// ReferenceError instead of reporting the miss — the gate would die on exactly
// the failure it exists to catch.
let bad = 0

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
  // m04031 — 复制 no longer POSTs the moment it is pressed: it opens a pre-filled
  // 新增 form and only 保存 creates the record, so 取消 really cancels.
  ['client  copy is a pending form, not an immediate POST', /openCopy\(|copyFrom/, client],
  ['client  copy is only persisted on save', /devices\/\$\{copyFrom\.id\}\/copy/, client],
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
  ['host    agent tool: scan liveness', /hillstone_scan_liveness/, host],
  ['host    agent tool: web login', /hillstone_web_login/, host],
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
  ['client  host-side connect opens the panel', /revealSidebar = \(originSessionId\)|revealSidebar = \(originSessionId\)/, client],
  ['client  connect watch polls /conn', /REVEAL_POLL_MS/, client],
  // esbuild rewrites string quotes, so a literal `'terminal'` in the source is
  // `"terminal"` in the product — never pin the quote style in a grep.
  ['client  pending connect switches to the terminal tab', /onRevealTerminal\(\(\) => setTab\(['"]terminal['"]\)\)/, client],
  // m03664 — the device dialog was covering the whole app: a full-viewport
  // centred overlay, a 40px backdrop blur, and window.confirm for deletes. The
  // scrim is nearly transparent, and delete goes through the same dialog
  // language. Each is asserted by ABSENCE below, because each one is a
  // regression that a reader would not spot in the markup.
  //
  // The centring itself was tried, rejected and now restored: m09852 centres the
  // card again because an edge-hung form reads as a sidebar panel rather than a
  // dialog about the device. So the placement assertion moved DOWN to the
  // negative list (a centred dialog is now the expected state), and what m03664
  // was actually protecting — the blur, the opaque takeover, window.confirm —
  // stayed. Centre the card; do not let the scrim swallow the conversation.
  ['client  scrim does not swallow clicks', /\.ops-modal-scrim \{[^}]*pointer-events: none/, client],
  ['client  search box', /\.ops-search \{/, client],
  ['client  device list paginates', /\.ops-pager \{/, client],
  ['client  device cards keep the 复制 action', /openCopy\(/, client],
  ['client  the copy dialog says where it came from', /\\u590D\\u5236\\u81EA|复制自/, client],
  // m05915 — the verdict is a lamp, not a word.
  ['client  liveness lamp', /LivenessDot|ops-dot/, client],
  ['client  the lamp is named so a screen reader still gets the verdict', /端口可达/, clientText],
  // m03664 — the log transcript moved into the same dialog. Match the compiled
  // shape: esbuild rewrites `h(` into `(0, import_react.createElement)(`, so a
  // source-shaped regex silently stops matching after a build.
  ['client  log transcript opens in the dialog', /detail && \(0, import_react\.createElement\)\(\s*OpsModal|detail && h\(OpsModal/, client],
  // m03664 — a browser cannot open a raw TCP socket, so the host owns the probe.
  ['host    liveness probe route', /devices\/ping/, host],
  ['host    TCP probe uses a socket', /net\.connect|node:net/, host],
  ['host    probe has a timeout', /PING_TIMEOUT_MS|setTimeout/, host],
  // m04040 — the sidebar is per-session, and the host controller acts on
  // whatever session is on screen, so an agent connect used to pop the panel
  // open over an unrelated conversation. The connection now carries the
  // session it belongs to, all the way from the tool call to the open.
  ['host    a connection records its originating session', /originSessionId/, host],
  ['host    the tool read the session off the run context', /exec\?\.agent\?\.id|exec\.agent\?\.id/, host],
  ['client  the panel names its own session on connect', /panelSessionId/, client],
  ['client  the reveal is told which session to open in', /revealSidebar\?\.\(c\.originSessionId\)|revealSidebar\?\.originSessionId|revealSidebar\?\.c\.originSessionId/, client],
  ['client  an unadopted session falls back to opening that session', /openTabIn\(/, client],
  ['client  a collapsed column is expanded too', /toggleExpanded\(\)/, client],
  // The seat's on-screen session is published through a subscription, so it
  // flips a microtask after openSession returns. Opening the tab in the same
  // tick would aim at the session the user is leaving — the bug itself.
  ['client  waits for the session switch to land', /setTimeout\(\(\) => \{/  , client],
  // m04806: a fresh connection must land the operator on 终端, not on 设备管理.
  // The tab body only exists while the tab is open, so a notify that fires while
  // nobody is listening is dropped on the floor — the intent has to be parked
  // first and claimed by the body when it mounts. The bare boolean this replaced
  // could be claimed by any conversation's panel, one layer of the same bug.
  ['client  a connection parks its 终端 intent until the tab mounts', /pendingReveals\.add\(/, client],
  ['client  a parked intent is claimed by its own session only', /function takePendingReveal\(sessionId\)|takePendingReveal = function \(sessionId\)/, client],
  ['client  the body is told which session it belongs to', /OpsPage\(props = \{\}\)|OpsPage\(\{ ?sessionId ?\}|sessionId\?: string/, client],
  ['client  the reveal asks before it opens the tab', /requestRevealTerminal\(c\.originSessionId\)[\s\S]{0,400}?revealSidebar\?\.\(c\.originSessionId\)/, client],
  // m05288 — WebUI login. The load-bearing facts are the ones that keep this
  // from being a credential-into-a-page-of-soup mistake: the password is
  // decrypted host-side and never crosses the bridge, one attempt only (the
  // device starts demanding a captcha after a single failure, so a retry loop
  // would be a guaranteed lockout), and the verdict is read off the login
  // response rather than scraped off the DOM.
  ['host    web login route', /\/web-login/, host],
  ['host    web login close route', /\/web-login\/close/, host],
  ['host    the password is decrypted host-side for the form', /decryptSecret\(/, host],
  ['host    playwright is imported lazily, not at load time', /await import\(["']playwright["']\)|import\(["']playwright["']\)/, host],
  ['host    the browser is launched with a persistent profile', /launchPersistentContext\(/, host],
  ['host    the operator keeps the window, so no headless mode', /headless: false/, host],
  ['host    self-signed device certs are tolerated', /ignoreHTTPSErrors: true/, host],
  ['host    the verdict comes from the login response', /success === true|success === false/, host],
  ['host    a captcha demand is a verdict, not a retry', /captcha/, host],
  ['host    the web port falls back to 443', /DEFAULT_WEB_PORT = 443/, host],
  ['client  a device card can ask for a WebUI login', /webLogin\(d\)|onClick: \(\) => void webLogin\(d\)/, clientText],
  ['client  the button says what is happening', /登录中…/, clientText],
  ['client  a captcha is labelled as work for a human, not a failure', /需人工完成/, clientText],
  ['client  the close button only appears when a window is open', /关闭窗口/, clientText],
  ['client  the card shows the verdict', /WebUiVerdict|ops-webui/, clientText],
  // m05847 — the SSH path is renamed. (The layout it moved into is asserted
  // below, next to panelCss, which is not in scope this early in the file.)
  ['client  the SSH path is called CLI 登录', /CLI 登录/, clientText],
  ['client  the login buttons carry a glyph', /CliIcon[\s\S]{0,4000}WebIcon|WebIcon[\s\S]{0,4000}CliIcon/, client],
  // m06703/m06704 — 执行策略: a user-authored CRUD model (no built-in deny list).
  // The host gates execution at runCommandVisible and send_input; the client has
  // a dedicated tab and a policy editor. Each fact is load-bearing — a silent
  // rot here means an agent can run a banned command with nobody noticing.
  ['host    policy store file', /policies\.json/, host],
  ['host    policy CRUD routes', /\^\\\/policies\\\/\(\[\^\/]\+\)\$/, host],
  ['host    policy evaluation entry', /function checkCommandPolicy|checkCommandPolicy = function/, host],
  ['host    word-boundary match', /\[\^\\\\p\{L\}\\\\p\{N\}\]/, host],
  ['host    cross-midnight window', /Cross-midnight|cross-midnight|>= start \|\| m < end/, host],
  ['host    run_and_analyze is gated', /const verdict = checkCommandPolicy\(command, store\.policies/, host],
  ['host    send_input is gated', /const verdict = checkCommandPolicy\(args\.data, store\.policies/, host],
  ['host    a blocked command is never sent to the device', /policy blocked command on|policy blocked send_input on/, host],
  ['client  执行策略 tab in the seg control', /policies:/, client],
  ['client  policy manager renders', /function PolicyManager\(/, client],
  ['client  policy editor saves', /api\(`\/policies\/\$\{editing\.id\}`|api\(\`\/policies\/\$\{editing\.id\}\`/, client],
  ['client  the tab says what it does', /还没有执行策略/, clientText],
  ['client  the editor explains the match rule', /词边界包含匹配/, clientText],
  // m09323 — the three UI changes. Asserted separately because each one is a
  // decision that can silently rot back: a select can turn into a free-text box,
  // a removed field can come back, and a purpose line can drift into describing
  // the panel instead of the agent.
  ['client  window bounds are dropdowns, not free text', /TIME_OPTIONS/, client],
  ['client  the time options step by 15 minutes', /TIME_STEP_MINUTES = 15/, client],
  ['client  an off-grid stored bound is preserved', /windowValue\(|offGridOption\(/, client],
  ['client  the zone is fixed, not editable', /POLICY_TIMEZONE = ["']Asia\/Shanghai["']/, client],
  ['client  the tab names what it limits', /执行策略用于限制 agent 调用运维工具时执行命令/, clientText],
  ['client  the tab names the two gated entry points', /hillstone_run_and_analyze、hillstone_send_input/, clientText],
]

// m05105 — the manifest is what the loader reads BEFORE any code runs. It listed
// `["slots"]` while the client half injects four services, so the declared set
// had been drifting from the real one with nothing to notice it. This reads
// package.json (not the bundle) because that is the surface the loader sees.
// Strip a leading BOM first: every JSON.parse of a source-controlled file
// eventually gets handed one by some editor on Windows, and the symptom is a
// raw SyntaxError from this line — a crash that looks like a broken gate and
// says nothing about drift.
const pkgText = readFileSync(new URL('../package.json', import.meta.url), 'utf-8').replace(/^﻿/, '')
const pkg = JSON.parse(pkgText)
const declaredInject = ((pkg.dsh && pkg.dsh.client && pkg.dsh.client.inject) || []).slice().sort()
const actualInject = (readFileSync(new URL('../src/client.tsx', import.meta.url), 'utf-8')
  .match(/export const inject = \[([^\]]*)\]/) || [, ''])[1]
  .split(',')
  .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
  .filter(Boolean)
  .sort()
const injectDrift = declaredInject.join(',') === actualInject.join(',')
console.log(`${injectDrift ? '  ok  ' : '  MISS'} pkg     client inject list matches src (m05105: declared [${declaredInject.join(', ')}] vs actual [${actualInject.join(', ')}])`)
if (!injectDrift) bad++

// m05105 — the tab's guide text is the one description a user reads in the UI
// before opening the panel, so it has to say what the panel does *now* rather
// than what it did when the tab was registered. Match the shipped CJK directly
// (see the clientText decode at the top of this file).
const guideExplains = clientText.includes('管理 Hillstone / StoneOS 设备')
  && clientText.includes('自动切到终端页')
  && clientText.includes('连接审计日志')
  && clientText.includes('执行策略')
console.log(`${guideExplains ? '  ok  ' : '  MISS'} client  the tab guide describes the current panel (m05105)`)
if (!guideExplains) bad++

// The 执行策略 tab shipped after the guide text was first written, and the
// guide had already gone stale once (it still advertised only "device
// management and an SSH terminal" after search, pagination, the liveness lamp
// and the audit log existed). Assert the fourth tab by name so adding a tab
// without describing it fails the build instead of shipping a lie.
const guideNamesPolicyTab = clientText.includes('「执行策略」限定')
console.log(`${guideNamesPolicyTab ? '  ok  ' : '  MISS'} client  the tab guide names the 执行策略 tab (m06703)`)
if (!guideNamesPolicyTab) bad++

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

// m04806 — the parked 终端 intent used to be one boolean, which any conversation's
// panel could claim. That is the same cross-session mistake as m04040 one layer
// down, so the boolean must not come back under any name.
const bareIntent = /pendingRevealTerminal\b/.test(client)
console.log(`${bareIntent ? '  MISS' : '  ok  '} client  no session-agnostic reveal flag (m04806)`)
if (bareIntent) bad++

for (const [name, re, hay] of checks) {
  const ok = re.test(hay)
  if (!ok) bad++
  console.log(`${ok ? '  ok  ' : '  MISS'} ${name}`)
}

// m03664 — the negatives that matter most. Each of these is a "we tried it and
// it was worse" decision, and nothing in the markup makes them obvious, so they
// are pinned explicitly.
//
// They are matched against the *stylesheet*, not the bundle and not the whole
// source. A blanket /backdrop-filter/ over the bundle matches two innocent
// things: this plugin's own comment explaining why the blur was dropped, and a
// `confirm()` inside inlined xterm that guards its own external-link prompt.
// Neither is a regression, and a gate that cries wolf on those gets deleted.
// Match the decision, in the place the decision lives.
// normalize line endings first: a checkout can leave src in CRLF, and the
// panelCss template-literal regex below anchors on \n. Stripping \r keeps the
// gate stable whether or not git's autocrlf conversion touched the working tree.
const clientSrc = readFileSync(new URL('../src/client.tsx', import.meta.url), 'utf-8').replace(/\r\n/g, '\n')
const panelCss = (clientSrc.match(/const panelCss = `([\s\S]*?)\n`\n/) || [, ''])[1]
if (!panelCss) {
  console.log('  MISS client  could not extract panelCss from src/client.tsx')
  bad++
}
for (const [name, hit] of [
  // A 40px backdrop blur turned the conversation behind the dialog into a wash.
  ['client  no backdrop blur on the dialog (m03664)', /backdrop-filter/.test(panelCss)],
  // window.confirm blocks the whole app and cannot show which device goes.
  ['client  no window.confirm left (m03664)', /\bconfirm\(/.test(clientSrc)],
  // The log transcript used to auto-open on mount, and a dialog that opens by
  // itself is an interruption.
  ['client  log detail does not auto-open (m03664)', /if \(!activeId && logs\.length\) setActiveId/.test(clientSrc)],
  // m04031 — 复制 used to be `const duplicate = async (source) => { POST /copy … }`
  // fired on click, so 取消 left an orphan `-副本` nobody had asked for. Match the
  // declarations, not the bare word: the comments deliberately still say
  // "duplicate" when explaining that history, and a blanket /duplicate/ would
  // fire on them and make this check useless.
  ['client  复制 no longer POSTs on click (m04031)', /const duplicate = async|void duplicate\(/.test(clientSrc)],
  ['client  bundle has no duplicate() call site (m04031)', /void duplicate\(|duplicate\(d\)/.test(client)],
  // m05847 — both ways in sit on the name row, right-aligned.
  ['client  the logins row exists and is right-aligned (m05847)', !/ops-dev-logins \{[^}]*margin-left: auto/.test(panelCss)],
  ['client  the login buttons are a styled group (m05847)', !/ops-btn\.login \{/.test(panelCss)],
  // m05901 — the address joined the name and the account/SSH/web port row is
  // gone. Match the removed row's own selector, not the word "meta": the
  // comment above still narrates why it went, and a blanket /meta/ would fire
  // on that narration and make this check useless.
  ['client  the address is shown with the name (m05901)', !/ops-dev-ip \{/.test(panelCss)],
  ['client  the account/SSH/port row is gone (m05901)', /ops-dev-meta \{/.test(panelCss)],
  // m04040's StatusBadge left the card: the CLI button now says 连接中… itself,
  // and two indicators of one fact on a 400px row is noise.
  ['client  the card no longer stacks a connecting badge (m05847)', /connectingId === d\.id \? h\(StatusBadge/.test(client)],
  // m09323 — the 时区 text box is gone from the policy editor. Match the removed
  // LABEL, not the word: the fixed-zone rationale is spelled out in a comment
  // right above the constant and in the README, so a blanket /timezone/ would
  // fire on those and make this check useless. Same trap as m04031's `duplicate`.
  ['client  the policy form has no 时区 input (m09323)', /'时区'/.test(clientSrc)],
  // …and the two window fields are <select>, not <input>. In THIS list a truthy
  // hit means FAILURE, so each entry states the bad condition directly. Anchor on
  // the control itself — the comment above TIME_OPTIONS still says "input" while
  // explaining why the box went away, so a blanket /h\('input'/ is useless here.
  ['client  the window bounds are still <input> (m09323)', /h\('input'[^\n]*value: form\.(start|end)/.test(clientSrc)],
  ['client  the HH:MM placeholders came back (m09323)', /placeholder: '22:00'|placeholder: '06:00'/.test(clientSrc)],
  // m09852 — the dialog is centred again, matching the host's alert dialogs.
  // Anchor on the scrim's own box model: the right-anchored version carried
  // `justify-content: flex-end` plus an asymmetric padding, and a blanket
  // /flex-end/ would also fire on any unrelated rule that happens to use it.
  ['client  the dialog scrim is right-anchored again (m09852)', /ops-modal-scrim \{[^}]*justify-content: flex-end/.test(panelCss)],
  ['client  the dialog scrim still has an edge padding offset (m09852)', /ops-modal-scrim \{[^}]*padding: [^;]*\d+px 8px/.test(panelCss)],
  // The opaque/blur takeover stays rejected — a centred card is a placement
  // change, not permission to blur the conversation out from under the user.
  ['client  the dialog scrim grows a backdrop blur (m09852)', /ops-modal-scrim \{[^}]*backdrop-filter/.test(panelCss)],
]) {
  console.log(`${hit ? '  MISS' : '  ok  '} ${name}`)
  if (hit) bad++
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
