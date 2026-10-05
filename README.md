# dsh-hillstone-cli-ops

A [DeepSeek Harness](https://github.com/deepseek-ai) (DSH) plugin that puts
Hillstone / StoneOS network devices into the right sidebar: manage them, open a
real SSH terminal, read the per-connection audit trail — and give the assistant
seven tools so it can do all of that itself.

The plugin is a two-half DSH plugin: a Node host half (SSH, encryption, session
logs, the agent tools) and a browser client half (the sidebar tab and an xterm.js
terminal). Both are built from one `src/` tree.

---

## What you get

**A 「设备运维」 tab in the right sidebar** with three sub-tabs:

| Tab | What it does |
| --- | --- |
| **设备管理** | CRUD devices (name / IP / account / password / SSH port / device type / web port / note). 新增, 复制 and 编辑 all run in one centred dialog. |
| **终端** | One xterm.js terminal per live connection. Input goes to the host, device output streams back over SSE. |
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

Requirements: Node 22+, a DSH build that exposes the `tools` and
`sidebarRightTabs` services, and `ssh2` / `xterm` (installed by `pnpm install`).

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
