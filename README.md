# dsh-hillstone-cli-ops

A [DeepSeek Harness](https://github.com/deepseek-ai) (DSH) plugin that puts
Hillstone / StoneOS network devices into the right sidebar: manage them, open a
real SSH terminal, read the per-connection audit trail — and give the assistant
seven tools so it can do all of that itself.

The plugin is a two-half DSH plugin: a Node host half (SSH, encryption, session
logs, the agent tools) and a browser client half (the sidebar tab and an xterm.js
terminal). Both are built from one `src/` tree.

[中文说明](README.zh-CN.md)

---

## What you get

**A 「设备运维」 tab in the right sidebar** with three sub-tabs:

| Tab | What it does |
| --- | --- |
| **设备管理** | CRUD devices (name / IP / account / password / SSH port / device type / web port / note). 新增, 复制 and 编辑 all run in one centred dialog. Each card has a **WebUI 登录** button — see below. |
| **终端** | One xterm.js terminal per live connection. Input goes to the host, device output streams back over SSE. A new connection switches this panel straight to 终端, so you land on the live session instead of the device list. |
| **日志** | The per-connection audit trail: who connected to which device, what was typed, which commands were run, when and why the session ended. |

**Seven agent tools**, so the assistant can operate devices without you:

`hillstone_list_devices`, `hillstone_open_terminal`, `hillstone_send_input`,
`hillstone_get_output`, `hillstone_close_terminal`, `hillstone_list_sessions`,
`hillstone_run_and_analyze`.

`hillstone_run_and_analyze` runs a batch of commands and hands the output to the
host LLM with a natural-language task ("检查接口状态和 CPU 负载"). By default it
reuses a terminal session an operator already has open, so you can watch the
agent work in the tab; with no live session it falls back to a one-shot exec
channel.

### WebUI 登录

Every device card has a **WebUI 登录** button. It opens the device's management
UI in a real browser window, logs in with the account already stored for that
device, and leaves the window on your desktop — you then work in the browser
yourself.

```
https://<device ip>:<web port or 443>/
```

Three things are worth knowing before you use it:

- **The password never reaches the panel.** The host decrypts it, types it into
  the form, and reports back only a verdict — 已登录 / 需人工完成 / 失败. The
  browser half of this plugin cannot see a password at all.
- **It makes exactly one attempt, and that is on purpose.** After a single wrong
  password the device starts demanding a graphical captcha, and once it is
  demanding one, no further automatic attempt can succeed. So a failure is
  reported as 需人工完成 with the window left open for you to finish by hand,
  rather than being retried into a lockout.
- **The profile is persistent** (`<data dir>/webui/<device id>`), so the second
  press on the same device usually reopens an already-logged-in session without
  touching the password again.

The button launches a headed Chromium on the machine running DSH — it is not a
headless check, and it takes over part of the screen while it runs.

The browser is Playwright's bundled Chromium. `pnpm install` pins a Playwright
version whose browser revision matches what a normal desktop already has cached,
so nothing is downloaded; if you bump Playwright and it asks for a new browser,
run `npx playwright install chromium` once.

---

## Install

```bash
git clone https://github.com/jazhu/dsh-hillstone-cli-ops
cd dsh-hillstone-cli-ops
pnpm install
pnpm run build          # regenerates dist/ (not committed)
```

Then point DSH at the directory — either as a local bundle in the plugin
manager, or by installing the package into your profile:

```bash
pnpm pack && <your-dsh-plugin-install-command> ./dsh-hillstone-cli-ops-1.0.0.tgz
```

**Restart the DSH main process afterwards.** Disabling and re-enabling a plugin
does not rebuild the host fiber in a running process, so new host code (SSH
handling, the tools, the log writer) only takes effect on a real restart.

Requirements: Node 22+, a DSH build that exposes the `tools`, `slots`,
`sidebarRightTabs`, `sidebarRight` and `uiWorkspace` services, and `ssh2` /
`xterm` (installed by `pnpm install`).

`package.json` lists the client services under `dsh.client.inject`, and that list
is load-bearing: it is what the loader reads before any code runs. The client
half's own `export const inject` and the manifest are two independent statements
of the same fact, so `test/bundle-gate.mjs` compares them and fails when they
drift. Keep both in step when you add a service.

---

## Design notes

A few things here were decided from measurement, not from the obvious guess.

### The pager is not optional on StoneOS

Measured on a real SG-6000: `show cpu detail` produces 9172 characters and stops
**13 times** at ` --More-- \0`, and the device emits **zero** SGR sequences.

The part that bites is the second one: **the pager eats anything typed into it.**
A command sent while the pager is waiting is silently swallowed — the pager just
flushes the rest of the page and returns to the prompt. So a tool that writes a
command and then waits for a prompt hangs until it times out, having never run
the command.

`hillstone_run_and_analyze` therefore watches for `--More--` and answers it with
a space, on the same write chain as any other input, and reports the number of
pages it had to advance. `hillstone_send_input` submits a bare command
automatically (see below) so the model does not have to remember the trailing
carriage return.

We do **not** send `terminal length 0` on connect. The SG-6000 rejects it with
`^-----unrecognized keyword` and paginates anyway, so it achieved nothing except
putting a bogus device error at the top of every session.

### One login attempt, because the second one cannot work

The device's login endpoint answers a wrong password with an error *and* starts
demanding a graphical captcha. The captcha is not a soft lockout that clears
itself — it is on the form from then on, and the endpoint does not exempt a
correct password from it. So an automatic login that retried would be a
guaranteed failure on its second attempt, and would look like "the password is
wrong" when the truth is "the first attempt was wrong, and now a human is
required".

The login therefore runs once, reads its verdict off the `POST /rest/login`
response body (`{"success":true…}` or an `exception.message` plus a captcha
demand), and hands the window over. The panel labels that outcome 需人工完成
rather than 失败, because a captcha is work waiting for a person, not a fault.

Two smaller decisions follow from the same measurement: the verdict comes from
the response body rather than from scraping the page, because the post-login
page is full of hundreds of unrelated form elements; and Playwright is loaded
with a **dynamic** `import()` so a missing install fails one button press with a
readable message instead of taking the whole host plugin down at load.

### `send_input` submits, but knows when not to

A model that passes a bare command and waits for output is the overwhelmingly
common case, and without the `\r` the text just sits in the device's line
buffer. So `hillstone_send_input` appends a carriage return — except when the
input is obviously not a command line:

| `data` | behaviour |
| --- | --- |
| multi-character, no control characters, not blank | **appends `\r`** |
| a single key (`" "` to page, `"q"`) or anything containing control characters | **sent verbatim** |
| anything, with an explicit `submit: true / false` | the explicit value wins |

`submit` also accepts `"true"` / `"false"`, because a JSON-ish caller can hand
over a string and `submit: "false"` must not be read as truthy.

### The output cursor counts bytes

`hillstone_get_output` is the read half of `hillstone_send_input`: the agent
polls with a `since` cursor instead of re-reading everything or sleeping blindly.
That cursor is a **byte** offset, not a character offset. The transcript is
capped and re-sliced when it overflows, so a string index would shift underneath
a polling agent; a cursor landing inside a multi-byte character is walked back to
the lead byte rather than producing a replacement glyph. The `since < dropped`
test is what decides a cursor is too old — comparing against a moving total
instead makes every cursor look stale the moment any new output arrives.

### A ToolDefinition that breaks the contract does not throw

DSH's `ToolDefinition` requires `output.schema` and `output.render(args, value)`
and expects `parameters` to be a **flat property table** (`field → { type,
description, required? }`), not a JSON Schema object. Violating this does not
raise at registration time — the tool simply never appears in `Tool.listTools`.
The plugin looks healthy, the agent reports that it cannot operate devices, and
nothing in a log says why.

So both the regression suite and the bundle gate assert the contract itself, not
just the tool names: every tool must have a description, a flat parameter table,
an `execute`, and an `output.render` that turns a real result into readable text
blocks and renders a failure as readable text instead of throwing.

### Passwords never reach the browser

A device password is encrypted at rest with a per-profile key and decrypted only
inside the host process. The copy button is **server-side**: the host copies the
*ciphertext*, so duplicating a device never moves a plaintext password into the
page, and editing a copy with an empty password field keeps the inherited one.

Pressing 复制 does **not** create anything. It opens the 新增 dialog pre-filled
from the source, and only 保存 writes the record — so 取消 really cancels, instead
of leaving behind a `-副本` nobody asked for. The form is sent to the host as
overrides, so a duplicate retargeted at a new address, account or device type is
created with exactly what the operator typed, while every field they left alone
still comes from the source (and an empty password box means "inherit", not
"none").

### The sidebar belongs to a session, not to the app

When a connection comes up, the plugin opens its own right-sidebar tab. The trap
is that DSH's right bar is **per session**: every `openTab` / `toggleExpanded` /
`close` call resolves through `sessions.onScreen`, so it always lands on the
conversation the user is currently looking at. An agent that connects to a
device while you are reading a *different* conversation used to pop the terminal
up there instead.

So every connection carries the identity of whoever started it — `originSessionId`
on the host side, taken from the tool's `exec.agent.id` or sent by the page — and
the reveal is routed to that session: try the in-session `openTabIn` first (it
does not move you), and only if that session has never had a right bar do we
switch the main column to it with `uiWorkspace.openSession` and open the tab
there. The switch publishes the on-screen session through a subscription, so the
`openTab` has to wait for the next tick — doing it in the same tick re-creates
the exact bug being fixed. Re-opening a tab that already exists only focuses it
and never expands the column, hence the `isExpanded()` / `toggleExpanded()`
fallback.

### A connection lands you on 终端, not on 设备管理

Opening the panel is only half the job. The tab body is mounted by the sidebar,
so if the connection is noticed while the tab is still closed there is nobody
listening — the notification fires into the void and the panel comes up showing
the device list, which is the one view that says nothing about what the agent is
doing on the device right now.

So the intent to show the terminal is **parked before** the tab is opened, keyed
by the session it belongs to, and the body claims it on mount. Both halves of
that ordering matter. Parking first survives the case where `openTab` mounts the
body synchronously; asking first is what covers the case where the tab was never
open at all, and m04040 means the body that answers may be a different
conversation's, arriving a tick later.

An earlier version parked a single boolean. It looked correct in the common case
— one session, one panel — and would be claimed by whichever conversation's panel
happened to mount first, which is the same wrong-session bug one layer down. The
per-session map is what keeps that from coming back.

### What the tab says about itself

The right rail shows a tab's `guide` entry before anyone opens it, so that text
is the plugin's description to a user who has never seen the panel. It drifted
for a long time — it still advertised only "device management and an SSH
terminal" after the panel had grown search, pagination, a liveness probe, an
audit log and the auto-jump above. A stale guide is worse than a missing one:
there is no cue that what you are about to open is not what the label says.

Two things keep it honest. The wording now matches the panel, and the gate
asserts it, so deleting the description fails the build instead of shipping.
That assertion decodes the bundle's `\uXXXX` escapes before matching — esbuild
emits `charset: ascii`, and hand-copying escapes into a regex produced a check
that missed a string the artefact already contained.

### A local API on a fixed port

The browser half cannot call the host's services directly, so the host opens a
loopback HTTP server (`127.0.0.1:18783`, prefix `/ops-api`). It is guarded by a
per-session bearer token that the page fetches from `GET /ops-api/_session`,
which only answers a loopback request with no or a local `Origin` — otherwise any
web page the user visits while the harness runs could reach the API. The page
carries the token in `X-Ops-Token`.

### One log file per connection, per day

Every connection writes `<dataDir>/oplog/<YYYY-MM-DD>/<connId>.jsonl`: a header
line, one line per `input` / `command` / `event` entry, and a final line
recording the end reason. **No end line means the session is still active** — a
log that only records successes is not an audit trail, so the log is opened
before the SSH handshake and a refused port or a bad password is recorded too.
Device output is deliberately *not* logged: a `show tech-support` dump would
inflate the log by three orders of magnitude, and the device keeps its own logs.
Days are keyed in local time, and 30 days are kept.

---

## Development

```bash
node node_modules/typescript/bin/tsc --noEmit   # typecheck (build.mjs does NOT gate on this)
node build.mjs                                  # esbuild dual bundle
node test/terminal-regression.mjs               # offline end-to-end
node test/bundle-gate.mjs                       # greps the built product
```

Run them in that order. `bundle-gate` asserts against `dist/`, so a failed build
would otherwise leave it passing on the previous artefacts — it compares the
mtimes of `dist/*` against `src/**` + `build.mjs` and reports `MISS … (STALE)`.

`test/terminal-regression.mjs` boots the real `dist/index.mjs` against a
self-hosted fake StoneOS over real `ssh2`, including a fake pager that stops at
` --More--` and *eats* whatever is typed there — the same failure mode as the
real box. It also boots a second host instance with a recording tool registry,
because the tool surface is what an agent actually uses, and the browser's HTTP
API is not.

## License

MIT — see [LICENSE](LICENSE).
