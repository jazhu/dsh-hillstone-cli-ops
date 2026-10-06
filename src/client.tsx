/**
 * dsh-hillstone-cli-ops — client half (browser bundle).
 *
 * Registers a right-sidebar tab (mirrors dsh-ssh-ops):
 *   - declares the tab via the client `sidebarRightTabs` service
 *     (id/kind = PANEL_ID, priority 'extension'); this puts 「设备运维」 in the
 *     right rail's tab strip.
 *   - renders the tab body via the `sidebar.right.pane.tab` keyed slot.
 *
 * There is deliberately no conversation-header button (m03528): the right rail
 * is always present, so a second entry point in the chat header only duplicated
 * the tab and widened the header.
 *
 * The tab body is a multi-tab surface:
 *   Tab 1 设备管理   — CRUD devices (name/ip/account/password/port/type/webPort);
 *                     each card connects, edits, copies or deletes. 新增 / 编辑 /
 *                     复制 all run in one dialog (DeviceDialog): the right rail
 *                     is too narrow to show a form and the list at once, and 复制
 *                     lands there as a *pre-filled 新增 form* — it writes nothing
 *                     until 保存, so 取消 really cancels. The host duplicates the
 *                     encrypted password server-side, so it never reaches the
 *                     browser and never has to be re-typed.
 *   Tab 2 终端       — one terminal tab per live connection; input is POSTed to
 *                     the host, device output streams back via SSE.
 *   Tab 3 日志       — the per-connection audit trail: who connected to which
 *                     device, and what was typed or run while they were there.
 *
 * The two tabs are mutually exclusive, so 「CLI 登录」 (on 设备管理) cannot hand
 * work to the terminal tab by event: TerminalTab is not mounted at click time.
 * A module-level pending-connect bridge issues the request eagerly and parks
 * the result; OpsPage switches to 终端 and TerminalTab drains it on mount.
 * See `requestConnect` / `takePendingConnect` / `onPendingConnect`.
 *
 * All data goes through the host half's loopback /ops-api server (CORS-enabled)
 * at a fixed port. The token is bootstrapped from GET /_session on the same
 * loopback origin (mirrors dsh-knowledge-base).
 *
 * Styling uses only the host's --dsw-alias-* / --dsw-radius-* theme tokens via a
 * single injected <style> block (`panelCss`), so the panel follows the app's
 * light/dark palettes and accent. The only literal color is the terminal
 * canvas, which must stay dark in both themes. Controls are hand-built to match
 * the host look (no @deepseek-ai/dsh-client-ui-primitives import).
 */
import { createElement as h, Fragment, useState, useEffect, useRef, useCallback } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
// xterm CSS is imported as a text string (esbuild .css->text loader) and injected
// into <head> at runtime, because the harness does not expose xterm as a resolvable
// client module and we cannot rely on a separately-served stylesheet asset.
import xtermCss from 'xterm/css/xterm.css'
import type { DeviceDTO, ConnectionInfo, DeviceType, DeviceLiveness, LogEntry, SessionLog, SessionLogDetail, WebLoginState, WebLoginStatus, ExecPolicy, PolicyWindow } from './types.ts'
import { DEVICE_TYPES, DEVICE_TYPE_LABELS } from './types.ts'

// Inject xterm's stylesheet exactly once so the terminal renders correctly.
let cssInjected = false
function ensureXtermCss(): void {
  if (cssInjected || typeof document === 'undefined') return
  cssInjected = true
  try {
    const style = document.createElement('style')
    style.setAttribute('data-plugin', 'dsh-hillstone-cli-ops')
    style.textContent = typeof xtermCss === 'string' ? xtermCss : ''
    document.head.appendChild(style)
  } catch {
    /* ignore */
  }
}

/** Panel id — keys both the sidebar icon row and the `main` page. */
const PANEL_ID = 'dsh-hillstone-cli-ops'
const API_PORT = 18783
const API_BASE = `http://127.0.0.1:${API_PORT}`
const API = API_BASE + '/ops-api'
const TOKEN_KEY = 'dsh-hillstone-ops-token'

/** localStorage token (pasted by hand) always wins; session token is memory-only. */
let sessionToken = ''
let tokenProbed = false
let tokenNotice: ((reason: string) => void) | null = null

function setTokenNotice(fn: ((reason: string) => void) | null): void {
  tokenNotice = fn
}
function manualToken(): string {
  try {
    return (localStorage.getItem(TOKEN_KEY) || '').trim()
  } catch {
    return ''
  }
}
function setManualToken(token: string): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

async function bootstrapToken(): Promise<string> {
  if (tokenProbed) return manualToken() || sessionToken
  tokenProbed = true
  const m = manualToken()
  if (m) return m
  try {
    const r = await fetch(API + '/_session')
    const j = (await r.json()) as { token?: string; enabled?: boolean }
    if (j.enabled && j.token) sessionToken = j.token
  } catch {
    /* keep empty */
  }
  return sessionToken
}

async function api<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = await bootstrapToken()
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (token) headers['X-Ops-Token'] = token
  const res = await fetch(API + path, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
  if (res.status === 401) {
    // Surface a readable message everywhere: DeviceManager shows the thrown
    // error text inline, and OpsPage raises the paste-token banner. Both tabs
    // need this — the previous "「终端」或「Agent」页" wording pointed at the
    // removed Agent tab and told the user to paste a token the host no longer
    // requires for its own desktop webview.
    const reason = '设备运维访问令牌缺失或无效。host 已放行本机来源；若仍报错，请粘贴本机令牌后重试。'
    tokenNotice?.(reason)
    throw new Error(reason)
  }
  const j = (await res.json()) as T & { ok?: boolean; error?: { message?: string } }
  if (!j.ok && (j as any).error) throw new Error((j as any).error.message || 'request failed')
  return j
}

// ---- cross-tab connect bridge ----------------------------------------------
//
// 「CLI 登录」 is clicked on the 设备管理 tab, but the connection UI lives on the
// 终端 tab, which is unmounted at that moment. The previous implementation
// dispatched a window CustomEvent that only TerminalTab listened for, so the
// click silently did nothing until the user happened to switch tabs (and even
// then the event had already been lost). Instead: issue the connect request
// eagerly, park the result here, and let the always-mounted OpsPage switch tabs;
// TerminalTab drains this slot on mount.

let pendingConnect: { deviceId: string; deviceName: string } | null = null
let pendingConnectResult: ConnectionInfo | null = null
let pendingConnectError: string | null = null
const pendingConnectListeners = new Set<() => void>()

async function requestConnect(deviceId: string, deviceName: string): Promise<void> {
  pendingConnect = { deviceId, deviceName }
  pendingConnectResult = null
  pendingConnectError = null
  try {
    const j = (await api<{ connection: ConnectionInfo }>('/connect', {
      method: 'POST',
      // m04040: name the session the connection belongs to, so the host's
      // connect watcher can put the sidebar back in this conversation even if
      // the user has moved to another one in the meantime.
      body: panelSessionId ? { deviceId, originSessionId: panelSessionId } : { deviceId },
    })) as any
    pendingConnectResult = j.connection as ConnectionInfo
  } catch (e) {
    pendingConnectError = `连接 ${deviceName} 失败：${(e as Error).message}`
  }
  for (const fn of [...pendingConnectListeners]) fn()
}

function takePendingConnect(): { result: ConnectionInfo | null; error: string | null } {
  const out = { result: pendingConnectResult, error: pendingConnectError }
  pendingConnect = null
  pendingConnectResult = null
  pendingConnectError = null
  return out
}

// A subscriber set, not a single slot: OpsPage uses it to switch tabs and
// TerminalTab uses it to drain, and both may be mounted at once.
function onPendingConnect(fn: () => void): () => void {
  pendingConnectListeners.add(fn)
  return () => { pendingConnectListeners.delete(fn) }
}

// ---- "show me the terminal" bridge ------------------------------------------
//
// A connection can be opened by something the page never sees: the agent's
// hillstone_open_terminal / hillstone_run_and_analyze tools run on the host, and
// a hillstone_open_terminal call leaves a pty open that the operator is supposed
// to be able to see and type into. Nothing pushes from the host to the page, and
// the connect bridge above only covers clicks made inside this panel — so a
// host-side connect used to be invisible until the user happened to open the
// panel and look at the session list.
const revealListeners = new Set<() => void>()
// The tab body is only mounted once the sidebar tab is open, and the notify can
// happen before that — m04040 opens the tab first, but on a session that has
// never had a sidebar the openTabIn/openSession dance can take a tick. So a
// connection made while the tab was closed used to open the panel on 设备管理
// instead of 终端, which is exactly the thing the operator does not want to see
// when an agent is working on a device for them. The intent therefore has to
// survive until mount, keyed by the session it belongs to: a bare boolean would
// be consumed by whichever conversation's panel happens to mount first, which is
// the same cross-session mistake one layer down.
const pendingReveals = new Set<string>()
// Takes the session that asked for the connection, so the tab can open there
// (m04040) instead of in whatever session happens to be on screen.
let revealSidebar: ((originSessionId?: string) => void) | null = null
let connectWatch: (() => void) | null = null

// The DSH session this panel is rendered in. The right-sidebar tab slot is
// scoped to one session, so the panel can name its own session and hand it to
// the host with every connect request. Read by requestConnect below, which is a
// plain module function with no access to props.
let panelSessionId: string | null = null

function onRevealTerminal(fn: () => void): () => void {
  revealListeners.add(fn)
  return () => { revealListeners.delete(fn) }
}

// Ask every mounted panel to switch to 终端, or — if none is mounted, which is the
// normal case when the connection came from the agent — park the intent for the
// session that owns it so OpsPage can pick it up when it mounts.
function requestRevealTerminal(originSessionId?: string): void {
  if (revealListeners.size > 0) {
    for (const fn of [...revealListeners]) fn()
    // A mounted panel can only ever be the one on screen. If the connection
    // belongs to a DIFFERENT session, m04040 is about to move the main column
    // there, which unmounts this body and mounts the right one a tick later.
    // Notifying now would light up the wrong conversation, and the mount below
    // would find nothing left to consume — so park it as well.
    if (originSessionId && originSessionId !== panelSessionId) {
      pendingReveals.add(originSessionId)
    }
    return
  }
  pendingReveals.add(originSessionId ?? panelSessionId ?? '')
}

// Consume a parked intent, but only for our own session. An intent parked for
// another conversation is left alone.
function takePendingReveal(sessionId: string | null): boolean {
  const key = sessionId ?? ''
  if (!pendingReveals.has(key)) return false
  pendingReveals.delete(key)
  return true
}

// The poll only opens the panel, and only for a session the panel has never
// shown: no focus stealing every 4s while the operator is reading a long
// `show tech-support`, and no re-opening after they deliberately close the
// panel. 4s is fast enough that an agent connect reads as immediate and slow
// enough to be invisible next to the host's own work.
const REVEAL_POLL_MS = 4000

// Declared before startConnectWatch so the tick can read it; a `const` at the
// bottom of the block would be a TDZ crash on the first poll.
const seenConnIds = new Set<string>()

function startConnectWatch(): void {
  if (connectWatch) return
  let prev = ''
  // The first poll only establishes a baseline. Without this, every session
  // left open from yesterday would count as "just connected" and pop the panel
  // open over the conversation on each DSH start — which is the opposite of
  // what the reveal is for.
  let primed = false
  const tick = async () => {
    if (!revealSidebar) return
    try {
      const j = (await api<{ connections: ConnectionInfo[] }>('/conn')) as any
      const list = (j.connections || []) as ConnectionInfo[]
      const live = list.filter((c) => c.status === 'ready' || c.status === 'connecting')
      const now = live.map((c) => c.connId).sort().join(',')
      if (!primed) {
        primed = true
        prev = now
        for (const c of list) seenConnIds.add(c.connId)
        return
      }
      if (now && now !== prev) {
        const fresh = live.filter((c) => !seenConnIds.has(c.connId))
        prev = now
        for (const c of list) seenConnIds.add(c.connId)
        if (fresh.length) {
          // Park the intent FIRST, then open the tab. The order is not cosmetic:
          // m04040 may have to switch the on-screen session and the sidebar
          // follows that signal a tick later, so the tab body is usually not
          // mounted yet and a plain notify would reach nobody. Parking first also
          // survives an openTab that mounts the body synchronously — a body that
          // mounts in the same tick consumes the parked intent itself.
          for (const c of fresh) requestRevealTerminal(c.originSessionId)
          // m04040: a host-side connect names the session that asked for it.
          // Open that session's sidebar, not the one that happens to be on
          // screen — otherwise an agent connect pops the panel open over
          // whatever conversation the user moved to in the meantime.
          for (const c of fresh) revealSidebar?.(c.originSessionId)
        }
      } else if (!now) {
        prev = ''
      }
    } catch {
      /* the panel may be closed or the host restarting; retry next tick */
    }
  }
  const iv = setInterval(() => void tick(), REVEAL_POLL_MS)
  connectWatch = () => clearInterval(iv)
}

// ---- styles ----------------------------------------------------------------
// Every color comes from the host's theme tokens (--dsw-alias-*, served by
// @deepseek-ai/dsh-client-ui-theme), so the panel follows the app's light/dark
// palettes and accent instead of freezing on hardcoded dark colors. Fallbacks
// mirror the dark palette and only matter before the theme stylesheet lands.
// Radii / fonts / durations reuse --dsw-radius-* / --dsw-font-family /
// --ds-transition-duration-*. Host reference patterns:
//   row separator   border-bottom: .5px solid var(--dsw-alias-border-l2)
//   title 14px/22px w400-500 label-primary · desc 12px/18px label-tertiary
//   control surface bg-module-platform / bg-layer-2, radius --dsw-radius-sm
// A literal color is only allowed for artwork (the terminal canvas), never for
// a surface or a label.
const panelCss = `
.ops-root { display: flex; flex-direction: column; height: 100%; box-sizing: border-box; font-family: var(--dsw-font-family, inherit); }

/* Page header */
.ops-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 0 0 10px; }
.ops-title { font-size: 15px; line-height: 22px; font-weight: 600; color: var(--dsw-alias-label-primary, #e7e7ea); margin: 0; }
.ops-sub { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-head-right { margin-left: auto; display: flex; align-items: center; gap: 6px; }

/* Segmented tab switcher */
.ops-seg { display: inline-flex; align-items: center; gap: 2px; padding: 2px; border-radius: var(--dsw-radius-md, 12px); background: var(--dsw-alias-bg-layer-1, #1a1b1f); border: 1px solid var(--dsw-alias-border-l2, #2a2a36); box-shadow: var(--dsw-shadow-lv1, 0 1px 3px 0 rgba(0,0,0,.18)); }
.ops-seg button { border: none; background: transparent; color: var(--dsw-alias-label-tertiary, #9a9aa6); padding: 4px 14px; border-radius: var(--dsw-radius-sm, 8px); cursor: pointer; font-family: inherit; font-size: 13px; line-height: 20px; white-space: nowrap; transition: background var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-seg button:hover { color: var(--dsw-alias-label-primary, #e7e7ea); background: var(--dsw-alias-interactive-bg-hover, #ffffff10); }
.ops-seg button.on { background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 18%, transparent); color: var(--dsw-alias-label-primary, #e7e7ea); font-weight: 500; box-shadow: 0 1px 2px 0 rgba(0,0,0,.18); }

/* Minimal buttons: the card already carries enough weight, so the buttons
   stay quiet — a near-flat surface that only tints on hover, thin borders,
   and accent fills dialled right down so the everyday verbs don't shout. */
.ops-btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; background: color-mix(in srgb, var(--dsw-alias-bg-layer-3, #2c2c2e) 55%, transparent); border: 1px solid var(--dsw-alias-border-l2, #3a414b); color: var(--dsw-alias-label-secondary, #cfd3d6); border-radius: var(--dsw-radius-sm, 8px); cursor: pointer; font-family: inherit; font-size: 13px; line-height: 20px; padding: 4px 12px; white-space: nowrap; transition: background var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), border-color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), box-shadow var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), transform var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, #ffffff14); color: var(--dsw-alias-label-primary, #f9fafb); border-color: var(--dsw-alias-border-l4, #4a4d55); }
.ops-btn:active:not(:disabled) { background: var(--dsw-alias-interactive-bg-active, #ffffff1f); border-color: var(--dsw-alias-border-l4, #4a4d55); transform: translateY(1px); }
.ops-btn:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #4176e6); outline-offset: 1px; }
.ops-btn:disabled { opacity: .45; cursor: default; }
.ops-btn.sm { padding: 2px 10px; font-size: 12px; }
.ops-btn.primary { color: var(--dsw-alias-state-business-primary, #4176e6); border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 30%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 8%, transparent); }
.ops-btn.primary:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 14%, transparent); color: var(--dsw-alias-state-business-primary, #4176e6); }
.ops-btn.danger { color: var(--dsw-alias-state-error-primary, #f85149); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 24%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 7%, transparent); }
.ops-btn.danger:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 13%, transparent); color: var(--dsw-alias-state-error-primary, #f85149); }
.ops-btn.plain { background: transparent; border-color: transparent; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-btn.plain:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, #ffffff14); border-color: transparent; color: var(--dsw-alias-label-primary, #f9fafb); }
.ops-btn.on { color: var(--dsw-alias-state-business-primary, #4176e6); border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 40%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 12%, var(--dsw-alias-bg-layer-3, #2c2c2e)); }

/* Form */
.ops-field { display: block; margin-bottom: 12px; }
.ops-label { display: block; margin-bottom: 5px; font-size: 12.5px; line-height: 18px; color: var(--dsw-alias-label-secondary, #cfd3d6); }
.ops-label i { font-style: normal; color: var(--dsw-alias-label-caption, #81858c); font-size: 11.5px; margin-left: 4px; }
.ops-input { box-sizing: border-box; width: 100%; padding: 5px 10px; border-radius: var(--dsw-radius-sm, 8px); border: 1px solid var(--dsw-alias-border-l2, #3a414b); background: var(--dsw-alias-bg-layer-2, #232324); color: var(--dsw-alias-label-primary, #f9fafb); font-family: inherit; font-size: 13px; line-height: 20px; outline: none; transition: border-color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), background var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-input::placeholder { color: var(--dsw-alias-label-caption, #81858c); }
.ops-input:hover { border-color: var(--dsw-alias-border-l4, #4a4d55); }
.ops-input:focus { border-color: var(--dsw-alias-state-business-primary, #4176e6); background: var(--dsw-alias-bg-layer-1, #1e1f23); }
.ops-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 12px; }

/* Execution-policy form bits (执行策略). The switch is a label-wrapped checkbox
   so the OS keeps the a11y semantics; the visible track is pure CSS. */
.ops-switch { display: inline-flex; align-items: center; cursor: pointer; }
.ops-switch input { position: absolute; opacity: 0; width: 0; height: 0; }
.ops-switch-track { position: relative; width: 38px; height: 22px; border-radius: 999px; background: var(--dsw-alias-bg-layer-3, #2c2c2e); border: 1px solid var(--dsw-alias-border-l4, #4a4d55); transition: background var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), border-color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-switch-track::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: var(--dsw-alias-label-secondary, #cfd3d6); transition: transform var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), background var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-switch input:checked + .ops-switch-track { background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 36%, transparent); border-color: var(--dsw-alias-state-success-primary, #22c55e); }
.ops-switch input:checked + .ops-switch-track::after { transform: translateX(16px); background: var(--dsw-alias-state-success-primary, #22c55e); }
.ops-switch input:focus-visible + .ops-switch-track { box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 50%, transparent); }
.ops-textarea { resize: vertical; min-height: 96px; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; line-height: 19px; }
.ops-form-hint { margin-top: 10px; font-size: 11.5px; line-height: 18px; color: var(--dsw-alias-label-caption, #81858c); }

/* What the 执行策略 tab is FOR, shown once above the list.
   Without it the tab reads as another settings page: the operator cannot tell
   from "3 条策略" that these rules are aimed at the agent, not at the panel. */
.ops-intro { margin: 0 0 12px; padding: 11px 13px; border: 1px solid var(--dsw-alias-border-l2, #2a2a36); border-radius: var(--dsw-radius-sm, 6px); background: var(--dsw-alias-bg-layer-1, #1e1f23); font-size: 12px; line-height: 19px; color: var(--dsw-alias-label-secondary, #c9c9cf); }
.ops-intro b { color: var(--dsw-alias-label-primary, #f9fafb); font-weight: 500; }
.ops-intro .ops-intro-scope { display: block; margin-top: 5px; color: var(--dsw-alias-label-tertiary, #9a9aa6); }

/* Device dialog (新增 / 编辑 / 复制 / 删除确认 / 日志明细).
   The right rail is only a few hundred px wide, so an inline form and the device
   list cannot share it; every device edit happens in a dialog instead. OpsModal
   portals it to <body>, because the rail renders inside a low z-index stacking
   context and a fixed overlay painted in place would slip under the host's own
   chrome.

   The card is anchored to the RIGHT edge and the scrim is deliberately almost
   transparent (m03664). Two earlier attempts hurt: a full-viewport centred
   overlay made the dialog feel like a system modal taking over the whole app,
   and a 40px background blur behind the scrim — copied from the host's own menu
   styling — smeared the entire conversation into an unreadable wash. An ops
   dialog is context, not a takeover: the main UI stays legible and clickable
   underneath, and the card sits next to the panel that opened it so the eye does
   not have to travel. Clicks on the app behind still reach the app. */
.ops-modal-scrim { position: fixed; inset: 0; z-index: 1100; display: flex; align-items: center; justify-content: flex-end; padding: 32px 32px 32px 8px; box-sizing: border-box; background: var(--dsw-alias-bg-mask-2, #00000008); pointer-events: none; }
.ops-modal-scrim > .ops-modal { pointer-events: auto; }
.ops-modal { width: min(480px, 100%); max-height: min(84vh, 760px); display: flex; flex-direction: column; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2, #2a2a36); border-radius: var(--dsw-radius-lg, 16px); background: var(--dsw-alias-bg-layer-1, #232324); box-shadow: var(--dsw-shadow-lv4, 0 0 1px 0 #0000001a, 0 16px 48px 0 #00000033); overflow: hidden; animation: ops-modal-in .12s var(--ds-ease-in-out, ease); }
.ops-modal-head { display: flex; align-items: center; gap: 8px; padding: 13px 16px; border-bottom: .5px solid var(--dsw-alias-border-l1, #ffffff0f); }
.ops-modal-head b { font-size: 14px; line-height: 22px; font-weight: 600; color: var(--dsw-alias-label-primary, #f9fafb); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-modal-close { margin-left: auto; width: 26px; height: 26px; padding: 0; font-size: 13px; line-height: 1; }
.ops-modal-body { padding: 14px 16px 2px; overflow: auto; }
.ops-modal-foot { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-top: .5px solid var(--dsw-alias-border-l1, #ffffff0f); background: var(--dsw-alias-bg-layer-2, #2c2c2e); }
@keyframes ops-modal-in { from { opacity: 0; } to { opacity: 1; } }

/* Confirm dialog (delete). The device being removed is the only thing the user
   must check, so it is shown as a labelled fact list rather than prose: a
   paraphrase in a sentence is what people skim past. */
.ops-confirm-target { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l2, #2a2a36); border-radius: var(--dsw-radius-sm, 8px); background: var(--dsw-alias-bg-layer-2, #1e1f23); }
.ops-confirm-target div { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.ops-confirm-target span { flex: none; width: 52px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-confirm-target b { flex: 1; min-width: 0; font-size: 13px; line-height: 20px; font-weight: 500; color: var(--dsw-alias-label-primary, #f9fafb); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-confirm-warn { font-size: 12.5px; line-height: 20px; color: var(--dsw-alias-state-error-primary, #f85149); }

/* Device list search + pagination. The rail shows ~20 cards comfortably; past
   that, scrolling becomes the only way to reach a device and the cards are tall
   enough that the target is off-screen most of the time. */
.ops-toolbar { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
.ops-search { flex: 1; min-width: 0; position: relative; display: flex; align-items: center; }
.ops-search .ops-input { padding-left: 26px; }
.ops-search-mark { position: absolute; left: 8px; font-size: 12px; line-height: 1; color: var(--dsw-alias-label-caption, #81858c); pointer-events: none; }
.ops-search-clear { position: absolute; right: 6px; width: 20px; height: 20px; padding: 0; border: none; background: transparent; color: var(--dsw-alias-label-tertiary, #9a9aa6); cursor: pointer; font-size: 12px; line-height: 1; border-radius: var(--dsw-radius-xs, 4px); }
.ops-search-clear:hover { background: var(--dsw-alias-interactive-bg-hover, #ffffff14); color: var(--dsw-alias-label-primary, #f9fafb); }
.ops-pager { display: flex; align-items: center; gap: 6px; margin-top: 10px; padding-top: 10px; border-top: .5px solid var(--dsw-alias-border-l2, #2a2a36); }
.ops-pager-info { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); font-variant-numeric: tabular-nums; }
.ops-pager-acts { margin-left: auto; display: flex; align-items: center; gap: 6px; }

/* Device cards — a table forced a 6-column squeeze into a narrow right rail;
   stacked cards keep the identity readable and the actions thumb-reachable. */
.ops-list { display: flex; flex-direction: column; gap: 10px; }
.ops-dev { border: 1px solid var(--dsw-alias-border-l2, #2a2a36); border-radius: var(--dsw-radius-md, 12px); background: var(--dsw-alias-bg-layer-2, #1e1f23); padding: 12px 14px 10px; box-shadow: var(--dsw-shadow-lv1, 0 1px 3px 0 rgba(0,0,0,.18)); transition: border-color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), box-shadow var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), transform var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-dev:hover { border-color: var(--dsw-alias-border-l4, #4a4d55); box-shadow: var(--dsw-shadow-lv2, 0 6px 16px 0 rgba(0,0,0,.22)); transform: translateY(-1px); }
/* The name row holds the lamp, the identity and the two ways in. It wraps: at
   rail width the lamp plus a truncated name are the part worth keeping, and a
   button group that refuses to shrink would shove both off the card. */
.ops-dev-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
/* Name and address are one identity (m05901). The account and the SSH or web
   port live on in the lamp's tooltip and in the edit dialog; printing them
   under every name made the list read like a database dump. */
.ops-dev-id { display: flex; align-items: baseline; gap: 8px; flex: 1 1 auto; min-width: 0; }
.ops-dev-name { font-size: 14px; line-height: 22px; font-weight: 500; color: var(--dsw-alias-label-primary, #f9fafb); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-dev-ip { flex: none; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-dev-note { margin-top: 6px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-caption, #81858c); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* m05847 — the two ways in, parked on the name row so the card opens with how
   to get onto the box instead of with record-management verbs. */
.ops-dev-logins { display: flex; align-items: center; gap: 6px; flex: none; margin-left: auto; }
.ops-btn.login { gap: 5px; padding: 4px 11px; font-size: 12px; line-height: 18px; font-weight: 500; background: color-mix(in srgb, var(--dsw-alias-bg-layer-3, #2c2c2e) 55%, transparent); border-color: var(--dsw-alias-border-l2, #3a414b); }
.ops-btn.login:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, #ffffff14); border-color: var(--dsw-alias-border-l4, #4a4d55); }
.ops-btn.login svg { flex: none; opacity: .9; }
/* The CLI path is the everyday one, so it keeps the faintest accent tint at
   rest and deepens on hover; WebUI stays neutral. Needed explicitly because
   .login sets a background that would otherwise win over .primary on equal
   specificity. */
.ops-btn.login.cli { color: var(--dsw-alias-state-business-primary, #4176e6); border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 32%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 8%, transparent); }
.ops-btn.login.cli:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 14%, transparent); border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 48%, transparent); }
.ops-btn.login.cli:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 24%, var(--dsw-alias-bg-layer-3, #2c2c2e)); border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 55%, transparent); }
/* m05915 — the liveness verdict as a lamp, not as a word. Nothing renders
   before the first scan: a lamp that is merely unlit would read as a verdict,
   and "not looked at yet" is not one. The glow is the point — a status light
   that does not glow reads as a painted dot, not as "this box is on". */
.ops-dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--dsw-alias-border-l4, #4a4d55); }
.ops-dot.online { background: var(--dsw-alias-state-success-primary, #22c55e); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 22%, transparent), 0 0 8px 1px color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 55%, transparent); }
.ops-dot.offline { background: var(--dsw-alias-state-error-primary, #f85149); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 22%, transparent), 0 0 8px 1px color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 50%, transparent); }
.ops-dot.probing { background: var(--dsw-alias-label-caption, #81858c); box-shadow: 0 0 6px 0 color-mix(in srgb, var(--dsw-alias-label-caption, #81858c) 45%, transparent); animation: ops-blink 1.1s ease-in-out infinite; }
@keyframes ops-blink { 0%, 100% { opacity: 1 } 50% { opacity: .35 } }
.ops-dev-acts { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding-top: 10px; margin-top: 10px; border-top: .5px solid var(--dsw-alias-border-l2, #2a2a36); }
.ops-dev-tags { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 7px; }
/* A native <select> keeps the OS popup, so appearance:auto stays — but then the
   UA paints its own background, which is WHITE in dark mode. Text colour comes
   from the theme (near-white), so every CJK label vanished white-on-white.
   Pin the fill to the themed layer colour and keep the theme's border. */
.ops-select { appearance: auto; cursor: pointer; background-color: var(--dsw-alias-bg-layer-2, #2c2c2e); color: var(--dsw-alias-label-primary, #f9fafb); }
.ops-select option { background-color: var(--dsw-alias-bg-layer-2, #2c2c2e); color: var(--dsw-alias-label-primary, #f9fafb); }

/* WebUI login (m05288). The verdict lives under the buttons rather than in the
   top-level banner because it is per device: a banner can only say one thing at
   a time, and the operator pressing 登录 on three boxes needs to see all three
   outcomes. The captcha state gets the warn colour because it is the one state
   that needs the operator to go and do something, in the window, by hand. */
.ops-webui { display: flex; align-items: flex-start; gap: 6px; margin-top: 8px; padding: 6px 9px; border-radius: var(--dsw-radius-sm, 8px); font-size: 12px; line-height: 18px; border: 1px solid transparent; }
.ops-webui b { flex: none; font-weight: 500; }
.ops-webui span { min-width: 0; word-break: break-word; }
.ops-webui.ready { color: var(--dsw-alias-state-success-primary, #22c55e); background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 10%, transparent); border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 26%, transparent); }
.ops-webui.captcha { color: var(--dsw-alias-state-warn-label, #dd8629); background: color-mix(in srgb, var(--dsw-alias-state-warn-label, #dd8629) 12%, transparent); border-color: color-mix(in srgb, var(--dsw-alias-state-warn-label, #dd8629) 28%, transparent); }
.ops-webui.error { color: var(--dsw-alias-state-error-primary, #f85149); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 10%, transparent); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 26%, transparent); }

/* Badges / status dots */
.ops-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; line-height: 18px; padding: 1px 9px; border-radius: 999px; }
.ops-badge b { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }
.ops-badge.ready { color: var(--dsw-alias-state-success-primary, #22c55e); background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 14%, transparent); }
.ops-badge.connecting { color: var(--dsw-alias-state-business-primary, #4176e6); background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 14%, transparent); }
.ops-badge.error { color: var(--dsw-alias-state-error-primary, #f85149); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 14%, transparent); }
.ops-badge.idle { color: var(--dsw-alias-label-secondary, #cfd3d6); background: color-mix(in srgb, var(--dsw-alias-label-tertiary, #9a9aa6) 16%, transparent); }
.ops-badge.agent { color: var(--dsw-alias-state-warn-label, #dd8629); background: color-mix(in srgb, var(--dsw-alias-state-warn-label, #dd8629) 16%, transparent); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-badge.type { color: var(--dsw-alias-state-business-primary, #4176e6); background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 14%, transparent); }

/* Messages */
.ops-msg { display: flex; align-items: flex-start; gap: 8px; padding: 9px 12px; margin-bottom: 12px; border-radius: var(--dsw-radius-sm, 8px); font-size: 12.5px; line-height: 20px; border: 1px solid transparent; }
.ops-msg.ok { color: var(--dsw-alias-state-success-primary, #22c55e); background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 10%, transparent); border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 28%, transparent); }
.ops-msg.err { color: var(--dsw-alias-state-error-primary, #f85149); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 10%, transparent); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 28%, transparent); }
.ops-msg code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; flex: 1; min-width: 0; }
.ops-msg-acts { display: flex; gap: 6px; margin-top: 8px; }

/* Empty state */
.ops-empty { border: 1.5px dashed var(--dsw-alias-border-l3, #3a414b); border-radius: var(--dsw-radius-md, 12px); padding: 26px 16px; text-align: center; color: var(--dsw-alias-label-tertiary, #9a9aa6); font-size: 12.5px; line-height: 20px; }
.ops-empty b { display: block; font-size: 13.5px; line-height: 20px; font-weight: 500; color: var(--dsw-alias-label-primary, #f9fafb); margin-bottom: 4px; }
.ops-loading { display: flex; align-items: center; gap: 8px; color: var(--dsw-alias-label-tertiary, #9a9aa6); font-size: 12.5px; line-height: 20px; padding: 18px 2px; }

/* Terminal. The right rail is narrow, so the identity row wraps internally
   instead of clipping the agent badge against the action buttons. */
.ops-term-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 6px 2px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-term-id { display: inline-flex; align-items: center; gap: 7px; min-width: 0; flex: 1 1 auto; flex-wrap: wrap; overflow: hidden; }
.ops-term-id b { font-size: 13px; line-height: 18px; font-weight: 500; color: var(--dsw-alias-label-primary, #f9fafb); }
.ops-term-id code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; color: var(--dsw-alias-label-caption, #81858c); }
.ops-term-acts { display: flex; align-items: center; gap: 6px; margin-left: auto; flex-shrink: 0; }
/* The canvas is artwork, not a themed surface: a terminal must stay dark even
   in the light palette, so this one color is deliberately literal. */
.ops-term-canvas { flex: 1; min-height: 0; background: #0d0d12; border: 1px solid var(--dsw-alias-border-l2, #2a2a36); border-radius: var(--dsw-radius-md, 12px); padding: 6px 4px; overflow: hidden; }
.ops-conns { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.ops-conns-label { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); margin-right: 2px; }

/* Session log. A single column of sessions; the transcript opens in a dialog
   (m03664), because two columns in a ~400px rail squeezed both — the session
   names truncated to unreadable slivers and the transcript got the leftovers. */
.ops-logs { display: flex; flex-direction: column; gap: 10px; }
.ops-log-list { display: flex; flex-direction: column; gap: 6px; }
.ops-log-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-log-row { display: block; width: 100%; text-align: left; font-family: inherit; cursor: pointer; border: 1px solid var(--dsw-alias-border-l2, #2a2a36); border-radius: var(--dsw-radius-sm, 8px); background: var(--dsw-alias-bg-layer-2, #1e1f23); padding: 8px 11px; color: inherit; transition: border-color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-log-row:hover { border-color: var(--dsw-alias-border-l4, #4a4d55); }
.ops-log-row-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ops-log-row-top b { font-size: 13px; line-height: 20px; font-weight: 500; color: var(--dsw-alias-label-primary, #f9fafb); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-log-row-meta { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin-top: 4px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-log-row-meta code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
.ops-log-row-sub { margin-top: 3px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-caption, #81858c); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-log-detail { border: 1px solid var(--dsw-alias-border-l2, #2a2a36); border-radius: var(--dsw-radius-md, 12px); background: var(--dsw-alias-bg-layer-2, #1e1f23); padding: 12px 14px; }
.ops-log-detail-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 13.5px; }
.ops-log-detail-head b { font-weight: 500; color: var(--dsw-alias-label-primary, #f9fafb); }
.ops-log-detail-head code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; color: var(--dsw-alias-label-caption, #81858c); }
/* Inside a dialog the detail sits on the dialog's own surface, so it drops its
   frame and padding: a panel-in-a-panel is noise. */
.ops-modal .ops-log-detail { border: none; border-radius: 0; background: none; padding: 0; }
.ops-log-detail-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 6px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-log-detail-acts { margin-top: 8px; }
.ops-log-entries { margin-top: 8px; border-top: .5px solid var(--dsw-alias-border-l2, #2a2a36); }
.ops-log-entry { display: flex; align-items: baseline; gap: 7px; padding: 4px 0; border-bottom: .5px solid var(--dsw-alias-border-l1, #202027); font-size: 12px; line-height: 18px; }
.ops-log-entry-time { flex: none; color: var(--dsw-alias-label-caption, #81858c); font-variant-numeric: tabular-nums; }
.ops-log-entry-kind { flex: none; width: 10px; text-align: center; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-log-entry-src { flex: none; min-width: 34px; color: var(--dsw-alias-label-caption, #81858c); }
.ops-log-entry-text { flex: 1; min-width: 0; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; color: var(--dsw-alias-label-secondary, #cfd3d6); word-break: break-all; white-space: pre-wrap; }
.ops-log-entry.command .ops-log-entry-text { color: var(--dsw-alias-label-primary, #f9fafb); }
.ops-log-entry.event .ops-log-entry-text { color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-log-entry.input .ops-log-entry-text { color: var(--dsw-alias-label-caption, #81858c); }
`

let stylesInjected = false
function injectStyles(): void {
  if (stylesInjected || typeof document === 'undefined') return
  stylesInjected = true
  try {
    const id = 'dsh-hillstone-cli-ops-style'
    if (document.getElementById(id)) return
    const el = document.createElement('style')
    el.id = id
    el.textContent = panelCss
    document.head.appendChild(el)
  } catch {
    /* ignore */
  }
}

const STATUS_TEXT: Record<string, string> = {
  connecting: '连接中',
  ready: '已连接',
  closed: '已断开',
  error: '连接异常',
}
const STATUS_CLASS: Record<string, string> = {
  connecting: 'connecting',
  ready: 'ready',
  closed: 'idle',
  error: 'error',
}

function StatusBadge({ status }: { status: string }): ReactElement {
  return h('span', { className: 'ops-badge ' + (STATUS_CLASS[status] || 'idle') },
    h('b', null),
    STATUS_TEXT[status] || status,
  )
}

function Field({ label, hint, ...rest }: { label: string; hint?: string } & Record<string, any>): ReactElement {
  return h('label', { className: 'ops-field' },
    h('span', { className: 'ops-label' }, label, hint ? h('i', null, hint) : null),
    h('input', { className: 'ops-input', ...rest }),
  )
}

/** Devices per page in the device list (m03664). */
const PAGE_SIZE = 20

/**
 * WebUI login verdicts (m05288), rendered on the card that earned them.
 *
 * `captcha` is deliberately NOT labelled 失败: the device did not fail to
 * respond, it asked for a human. Calling that an error would tell the operator
 * to press something that is already the only thing left to press.
 */
const WEBUI_TEXT: Record<WebLoginStatus, string> = {
  idle: '未登录',
  ready: '已登录',
  captcha: '需人工完成',
  error: '失败',
}

/**
 * One device's management-UI verdict.
 *
 * The message is not truncated: it says what the device refused and what to do
 * next ("请在打开的窗口里手动完成"), and clipping that off to fit a narrow rail
 * is what turns a clear instruction into a shrug.
 */
function WebUiVerdict({ state }: { state: WebLoginState }): ReactElement {
  return h('div', { className: 'ops-webui ' + state.status, title: state.message || state.url },
    h('b', null, `WebUI ${WEBUI_TEXT[state.status] ?? state.status}`),
    h('span', null, state.message || state.url),
  )
}

// DeviceLiveness is shared with the host so the probe endpoint's response shape
// and the card badge cannot drift apart. `online` means the SSH port completed a
// TCP handshake — it says nothing about the account or the password, which is
// why the badge says 端口可达 rather than 在线 and repeats the caveat in its
// tooltip.
const LIVENESS_TEXT: Record<string, string> = { online: '端口可达', offline: '端口不可达', probing: '检测中' }
const LIVENESS_TITLE: Record<string, string> = {
  online: 'TCP 握手成功：这台设备的 SSH 端口在监听，账号密码尚未校验。',
  offline: 'TCP 握手失败：设备关机、IP 不通，或被防火墙拦截了 SSH 端口。',
  probing: '正在做 TCP 连接测试…',
}

// The verdicts live at module scope (m05915), not in the list component: the
// device list unmounts the moment the operator glances at another tab, and a
// lamp that goes dark on the way back is not the 常驻 display it promises. So a
// scan result outlives the tab switch and is replaced only by the next scan.
// Devices that are renamed or deleted are still pruned against the current
// list, so this is never a verdict about a device that no longer exists.
let livenessStore: Record<string, DeviceLiveness> = {}
const livenessListeners = new Set<() => void>()

function subscribeLiveness(fn: () => void): () => void {
  livenessListeners.add(fn)
  return () => { livenessListeners.delete(fn) }
}

function putLiveness(next: Record<string, DeviceLiveness>): void {
  livenessStore = next
  for (const fn of [...livenessListeners]) fn()
}

/**
 * The liveness verdict as a lamp in front of the device name (m05915).
 *
 * A lamp instead of a word: the name row also carries the two login buttons,
 * and a three-character badge was what pushed long names and the address off
 * the card. Everything the badge used to say survives in the tooltip — the
 * caveat in particular, because a green lamp says "reachable", never "logged
 * in", and that difference is the whole reason the wording says 端口可达.
 */
function LivenessDot({ liveness, port }: { liveness: DeviceLiveness; port: number }): ReactElement {
  const cls = liveness.state === 'online' ? 'online' : liveness.state === 'offline' ? 'offline' : 'probing'
  const detail = liveness.state === 'online' && liveness.ms !== undefined
    ? `${LIVENESS_TEXT[cls]}（${liveness.ms}ms）`
    : LIVENESS_TEXT[cls]
  return h('span', {
    className: 'ops-dot ' + cls,
    role: 'img',
    'aria-label': detail,
    // The error is the actionable part of a failed probe (refused vs timeout vs
    // unreachable), so it goes in the tooltip rather than being flattened away.
    title: [detail, LIVENESS_TITLE[cls], `SSH ${liveness.ip}:${port ?? liveness.port}`, liveness.error].filter(Boolean).join('\n'),
  })
}

/**
 * Anchored dialog, portalled to <body>.
 *
 * The panel is mounted in the right rail, whose subtree sits in a low z-index
 * stacking context, so a `position: fixed` scrim rendered in place is clipped
 * behind the host's own chrome. Portalling to the document root puts the dialog
 * above it; the fallback keeps the dialog usable if createPortal is unavailable.
 *
 * The scrim is click-through (m03664): the app stays visible AND interactive
 * underneath, so a click outside the card both reaches the app and dismisses
 * this dialog. That makes the dialog transient by design — the operator who
 * wants to keep a half-filled form while checking something in the chat has to
 * close it deliberately instead. Pressing Escape always closes, and a click or
 * drag that *started* inside the card never counts as a click-away, so releasing
 * a text selection past the card's edge does not throw away the form.
 */
function OpsModal({ title, onClose, foot, children }: {
  title: ReactNode
  onClose: () => void
  foot?: ReactNode
  children?: ReactNode
}): ReactElement {
  // Track where the press started, not where it ended: a mousedown on the card
  // followed by a mouseup over the app is a drag or a selection, not a dismissal.
  const downInside = useRef(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    const onDown = (e: MouseEvent) => {
      downInside.current = !!e.target && !!(e.target as HTMLElement).closest?.('.ops-modal')
    }
    const onClick = (e: MouseEvent) => {
      if (downInside.current) return
      if (!(e.target as HTMLElement)?.closest?.('.ops-modal')) onClose()
    }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('mousedown', onDown, true)
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('mousedown', onDown, true)
      document.removeEventListener('click', onClick, true)
    }
  }, [onClose])

  const panel = h('div', { className: 'ops-modal', role: 'dialog', 'aria-modal': false, 'aria-label': typeof title === 'string' ? title : undefined },
    h('div', { className: 'ops-modal-head' },
      h('b', null, title),
      h('button', { className: 'ops-btn plain ops-modal-close', onClick: onClose, 'aria-label': '关闭', title: '关闭' }, '✕'),
    ),
    h('div', { className: 'ops-modal-body' }, children),
    foot ? h('div', { className: 'ops-modal-foot' }, foot) : null,
  )
  const scrim = h('div', { className: 'ops-modal-scrim' }, panel)
  if (typeof document !== 'undefined' && typeof createPortal === 'function') return createPortal(scrim, document.body)
  return scrim
}

/**
 * Confirmation dialog, in the same language as the edit dialog (m03664).
 *
 * `window.confirm` was doing this job before, and it is wrong here for two
 * reasons: it is a system dialog that blocks the whole app — the exact "covers
 * the entire application" complaint this change set is fixing — and it cannot
 * show the device name and IP that a mis-click needs. The button says what it
 * does rather than 确认, because a confirmation whose action is unlabelled is
 * the thing people click through.
 */
function ConfirmDialog({ title, lines, warning, confirmText, onConfirm, onClose }: {
  title: ReactNode
  lines: { label: string; value: ReactNode }[]
  warning?: ReactNode
  confirmText: string
  onConfirm: () => void
  onClose: () => void
}): ReactElement {
  return h(OpsModal, { title, onClose, foot: h(Fragment, null,
    h('button', { className: 'ops-btn danger', onClick: onConfirm, autoFocus: true }, confirmText),
    h('button', { className: 'ops-btn plain', onClick: onClose }, '取消'),
  ) },
    h('div', { className: 'ops-confirm-target' },
      lines.map((l, i) => h('div', { key: i }, h('span', null, l.label), h('b', { title: typeof l.value === 'string' ? l.value : undefined }, l.value))),
    ),
    warning ? h('div', { className: 'ops-confirm-warn' }, warning) : null,
  )
}

// ---- device management tab ------------------------------------------------

/** One row of the device form. `form` is flat so setForm stays a single call. */
interface DeviceForm {
  name: string
  ip: string
  account: string
  password: string
  port: string
  webPort: string
  deviceType: DeviceType
  note: string
}

const EMPTY_FORM: DeviceForm = {
  name: '',
  ip: '',
  account: '',
  password: '',
  port: '22',
  webPort: '',
  deviceType: 'next-gen-firewall',
  note: '',
}

/** A form pre-filled from a device. `password` stays blank: the host never
 *  sends it back, and an empty field means "keep the stored one" on PUT — or
 *  "inherit the source's" on a copy, which the host does by duplicating the
 *  ciphertext. `name` is overridable so a copy can start from a fresh name
 *  instead of the source's. */
function formFrom(d: DeviceDTO, name?: string): DeviceForm {
  return {
    name: name ?? d.name,
    ip: d.ip,
    account: d.account,
    password: '',
    port: String(d.port),
    webPort: d.webPort ? String(d.webPort) : '',
    deviceType: d.deviceType ?? 'other',
    note: d.note || '',
  }
}

/**
 * The name a copy will be created under, shown in the dialog before it exists.
 *
 * Mirrors the host's dedupe so the operator sees the real name they are about
 * to save instead of a name the host would silently change on the way in. The
 * host still dedupes — this is display, not an authority.
 */
function defaultCopyName(source: DeviceDTO, all: DeviceDTO[]): string {
  const taken = new Set(all.map((d) => d.name))
  const base = `${source.name}-副本`
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base} (${n})`)) n++
  return `${base} (${n})`
}

/**
 * 新增 / 编辑 device dialog, and the landing spot for 复制.
 *
 * The form used to be an inline card in the device list, but the right rail is
 * only a few hundred px wide: eight fields in two columns plus a footer left no
 * room to see the list being edited. It also gives 复制 a natural home — 复制 used
 * to POST the duplicate the instant the button was pressed and then open this
 * dialog on the result, so pressing 取消 left an orphaned `-副本` behind that
 * nobody had asked for. A copy is now a *pending* form: the dialog opens
 * pre-filled, nothing is written until 保存, and the dialog says which device it
 * was copied from.
 */
function DeviceDialog({ editing, copyFrom, form, setForm, busy, notice, error, onSave, onClose }: {
  editing: Partial<DeviceDTO>
  /** Set when this dialog was opened by 复制: the device being duplicated. The
   *  record does not exist yet — saving POSTs to that device's /copy with the
   *  form as overrides, so the password is inherited server-side. */
  copyFrom: DeviceDTO | null
  form: DeviceForm
  setForm: (f: DeviceForm) => void
  busy: boolean
  /** Info shown inside the dialog (e.g. where a copy came from). */
  notice: string | null
  /** Validation / save failure. Lives in the dialog: a banner behind the scrim
   *  is invisible, which is exactly where a rejected save would be reported. */
  error: string | null
  onSave: () => void
  onClose: () => void
}): ReactElement {
  const isNew = !editing.id || editing.id === '__new__'
  const set = (patch: Partial<DeviceForm>) => setForm({ ...form, ...patch })
  const title = copyFrom
    ? `新增设备 · 复制自 ${copyFrom.name}`
    : isNew ? '新增设备' : `编辑设备 · ${editing.name ?? ''}`
  return h(OpsModal, {
    title,
    onClose,
    foot: h(Fragment, null,
      h('button', { className: 'ops-btn primary', onClick: onSave, disabled: busy }, busy ? '保存中…' : '保存'),
      h('button', { className: 'ops-btn plain', onClick: onClose, disabled: busy }, '取消'),
    ),
    children: h(Fragment, null,
      error ? h('div', { className: 'ops-msg err', style: { marginBottom: 12 } }, h('code', null, error)) : null,
      notice ? h('div', { className: 'ops-msg ok', style: { marginBottom: 12 } }, h('code', null, notice)) : null,
      h('div', { className: 'ops-grid2' },
        Field({ label: '设备名称', value: form.name, placeholder: '例如：核心交换机', onChange: (e: any) => set({ name: e.target.value }) }),
        Field({ label: 'IP 地址', value: form.ip, placeholder: '例如：192.168.1.10', onChange: (e: any) => set({ ip: e.target.value }) }),
        h('label', { className: 'ops-field' },
          h('span', { className: 'ops-label' }, '设备类型'),
          h('select', {
            className: 'ops-input ops-select',
            value: form.deviceType,
            onChange: (e: any) => set({ deviceType: e.target.value as DeviceType }),
          }, DEVICE_TYPES.map((t) => h('option', { key: t, value: t }, DEVICE_TYPE_LABELS[t]))),
        ),
        Field({ label: '账号', value: form.account, placeholder: 'admin', onChange: (e: any) => set({ account: e.target.value }) }),
        // On a copy the host duplicates the ciphertext, so an empty box means
        // "same password as 核心交换机" rather than "no password" — worth spelling
        // out, because on this dialog an empty box means the opposite in edit mode.
        Field({ label: '密码', hint: copyFrom ? '留空继承原设备' : isNew ? '必填' : '留空表示不修改', type: 'password', value: form.password, onChange: (e: any) => set({ password: e.target.value }) }),
        Field({ label: 'SSH 端口', value: form.port, placeholder: '22', onChange: (e: any) => set({ port: e.target.value }) }),
        Field({ label: 'Web 端口', hint: '管理页面', value: form.webPort, placeholder: '443', onChange: (e: any) => set({ webPort: e.target.value }) }),
        Field({ label: '备注', value: form.note, placeholder: '可选', onChange: (e: any) => set({ note: e.target.value }) }),
      ),
    ),
  })
}

// Two glyphs for the login buttons (m05847). They are decoration, not
// information: the label already says which way in this is. What they buy is a
// glanceable difference at 12px in a rail that is often narrower than the two
// Chinese labels side by side.
function CliIcon(): ReactElement {
  return h('svg', { viewBox: '0 0 16 16', width: 12, height: 12, 'aria-hidden': 'true', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('path', { d: 'M3 4.5 6.5 8 3 11.5' }),
    h('path', { d: 'M8.5 12h4.5' }),
  )
}

function WebIcon(): ReactElement {
  return h('svg', { viewBox: '0 0 16 16', width: 12, height: 12, 'aria-hidden': 'true', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4 },
    h('circle', { cx: 8, cy: 8, r: 5.6 }),
    h('path', { d: 'M2.6 8h10.8' }),
    h('path', { d: 'M8 2.4c1.6 2 2.4 3.6 2.4 5.6S9.6 11.6 8 13.6c-1.6-2-2.4-3.6-2.4-5.6S6.4 4.4 8 2.4z' }),
  )
}

function DeviceManager(): ReactElement {
  const [devices, setDevices] = useState<DeviceDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<DeviceDTO> | null>(null)
  const [form, setForm] = useState<DeviceForm>(EMPTY_FORM)
  // Dialog-scoped feedback. A banner rendered behind the scrim would be invisible,
  // so messages raised while the dialog is open live in the dialog itself.
  const [formNotice, setFormNotice] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  // m03664: the device awaiting delete confirmation, kept out of `editing` so an
  // edit dialog and a confirm dialog can never both be open.
  const [removing, setRemoving] = useState<DeviceDTO | null>(null)
  // The device a pending 复制 is duplicating. The duplicate does not exist yet:
  // opening the dialog must not write anything, so 保存 is what POSTs to that
  // device's /copy. Distinct from `editing` because a copy is a *new* record
  // whose id is not known until it is created.
  const [copyFrom, setCopyFrom] = useState<DeviceDTO | null>(null)
  // Search + paging state (m03664). Kept in DeviceManager rather than the host
  // because the whole device list already arrives in one response; paging is a
  // view concern, and pushing it server-side would need it to reset whenever the
  // list is refreshed underneath the user.
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  // The verdicts themselves live in the module store above; this is only a
  // re-render trigger for them. Pruning against the current device list happens
  // where the list is rendered.
  const [, bumpLiveness] = useState(0)
  useEffect(() => subscribeLiveness(() => bumpLiveness((n) => n + 1)), [])
  const liveness = livenessStore
  const [probing, setProbing] = useState(false)
  // m05288: the last WebUI login verdict per device, and which device has a
  // login in flight. Kept apart because one is a report from the host and the
  // other is local optimism — the button must say 登录中… on its own evidence,
  // not on a state that only changes when a request comes back.
  const [webUi, setWebUi] = useState<Record<string, WebLoginState>>({})
  const [webUiBusy, setWebUiBusy] = useState<string | null>(null)

  /**
   * Ask the host to open a device's management UI and log in (m05288).
   *
   * The host is the only side that holds the password, so this posts a
   * deviceId and gets back a verdict — never a secret. The window itself opens
   * on the operator's desktop, so a success here is not "you are logged in",
   * it is "the window you asked for is on screen".
   */
  const webLogin = async (d: DeviceDTO) => {
    if (webUiBusy) return
    setWebUiBusy(d.id)
    // Optimistic, so a slow browser launch still shows something happening on
    // the right card. The host overwrites it with the real verdict.
    setWebUi((prev) => ({
      ...prev,
      [d.id]: { deviceId: d.id, url: '', status: 'idle', at: new Date().toISOString(), message: '正在打开浏览器并登录…' },
    }))
    try {
      const j = (await api<{ state: WebLoginState }>('/web-login', { method: 'POST', body: { deviceId: d.id } })) as any
      const state = j.state as WebLoginState | undefined
      if (state) setWebUi((prev) => ({ ...prev, [d.id]: state }))
      else setMsg({ kind: 'err', text: `WebUI 登录失败：host 没有返回结果（${d.name}）` })
    } catch (e) {
      const text = `WebUI 登录失败：${(e as Error).message}`
      setWebUi((prev) => ({
        ...prev,
        [d.id]: { deviceId: d.id, url: '', status: 'error', at: new Date().toISOString(), message: text },
      }))
    } finally {
      setWebUiBusy(null)
    }
  }
  const webLoginClose = async (d: DeviceDTO) => {
    setWebUiBusy(d.id)
    try {
      await api('/web-login/close', { method: 'POST', body: { deviceId: d.id } })
      setWebUi((prev) => {
        const next = { ...prev }
        delete next[d.id]
        return next
      })
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message })
    } finally {
      setWebUiBusy(null)
    }
  }

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const j = (await api<{ devices: DeviceDTO[] }>('/devices')) as any
      setDevices(j.devices || [])
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message })
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Pull the host's WebUI window report (m05288).
   *
   * Separate from `refresh` on purpose: it is the one piece of device state the
   * host can change without anyone touching the panel — the operator closing a
   * browser window is an action the panel never sees. So the report is also
   * polled while the tab is open, or the card would keep advertising a window
   * that is gone until the next manual refresh.
   */
  const refreshWebUi = useCallback(async () => {
    try {
      const j = (await api<{ states: WebLoginState[] }>('/web-login')) as any
      const next: Record<string, WebLoginState> = {}
      for (const s of (j.states || []) as WebLoginState[]) next[s.deviceId] = s
      // Never clobber a verdict that a request in flight is still filling in.
      setWebUi((prev) => {
        if (webUiBusy && prev[webUiBusy]?.message === '正在打开浏览器并登录…') {
          return { ...next, [webUiBusy]: prev[webUiBusy] }
        }
        return next
      })
    } catch {
      /* the report is advisory; a failed poll must not disturb the panel */
    }
  }, [webUiBusy])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Poll the WebUI report while this tab is open (see refreshWebUi). 8s: the
  // only change being detected is a window the operator closed by hand, which
  // is a low-frequency event and not worth a tighter poll.
  useEffect(() => {
    refreshWebUi()
    const iv = setInterval(() => void refreshWebUi(), 8000)
    return () => clearInterval(iv)
  }, [refreshWebUi])

  const openCreate = () => {
    setEditing({ id: '__new__' })
    setForm({ ...EMPTY_FORM })
    setCopyFrom(null)
    setFormNotice(null)
    setFormError(null)
  }
  const openEdit = (d: DeviceDTO) => {
    setEditing(d)
    setForm(formFrom(d))
    setCopyFrom(null)
    setFormNotice(null)
    setFormError(null)
  }
  /**
   * 复制: open the 新增 dialog pre-filled from `source`, writing nothing yet.
   *
   * This used to POST the duplicate immediately and then open the dialog on the
   * result. That made 取消 a lie — it discarded a form the operator thought they
   * were dismissing, and left a `-副本` record behind that nothing referenced.
   * Now the duplicate exists exactly when the operator presses 保存.
   */
  const openCopy = (source: DeviceDTO) => {
    setEditing({ id: '__new__' })
    setForm(formFrom(source, defaultCopyName(source, devices)))
    setCopyFrom(source)
    setFormNotice(`已复制「${source.name}」的信息，保存后创建新设备（密码继承原设备）`)
    setFormError(null)
  }
  const closeForm = () => {
    setEditing(null)
    setCopyFrom(null)
  }

  const save = async () => {
    const isNew = !editing?.id || editing.id === '__new__'
    // A copy inherits the source password, so the only required fields are the
    // ones the operator is expected to have a value for. Asking for a password
    // here would defeat the point of a server-side copy.
    if (!form.name || !form.ip || !form.account || (isNew && !copyFrom && !form.password)) {
      setFormError(copyFrom
        ? '名称 / IP / 账号 不能为空'
        : '名称 / IP / 账号 / 密码（新建时必填）不能为空')
      return
    }
    setBusy(true)
    setFormError(null)
    try {
      const payload = {
        name: form.name,
        ip: form.ip,
        account: form.account,
        port: Number(form.port) || 22,
        deviceType: form.deviceType,
        // An empty web-port box must clear the stored value, so send null
        // rather than omitting the key (omitted means "leave alone" on PUT).
        webPort: form.webPort.trim() ? Number(form.webPort) : null,
        note: form.note,
      }
      if (copyFrom) {
        // A copy is a create: the record does not exist until this POST lands.
        // The form is sent as overrides so whatever the operator typed — a new
        // name, a different IP, another device type — is what gets created, and
        // the host carries the encrypted password over from the source.
        // A typed password still wins, because the host is what decides: an
        // override without `password` keeps the source's ciphertext.
        const j = (await api<{ device?: DeviceDTO }>(`/devices/${copyFrom.id}/copy`, {
          method: 'POST',
          body: { ...payload, password: form.password || undefined },
        })) as any
        const created: DeviceDTO | undefined = j?.device
        if (!created?.id || created.id === copyFrom.id) {
          // Without a distinct id the host did not create a new record, so
          // reporting success and refreshing would be a lie.
          setFormError('复制失败：host 没有返回新设备，已放弃保存（没有写入任何记录）')
          return
        }
        setMsg({ kind: 'ok', text: `已保存：新增「${created.name}」（含原设备密码）` })
      } else if (isNew) {
        await api('/devices', { method: 'POST', body: { ...payload, password: form.password } })
        setMsg({ kind: 'ok', text: '已保存' })
      } else {
        await api(`/devices/${editing!.id}`, { method: 'PUT', body: { ...payload, password: form.password || undefined } })
        setMsg({ kind: 'ok', text: '已保存' })
      }
      closeForm()
      refresh()
    } catch (e) {
      setFormError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  const remove = async (id: string) => {
    // `window.confirm` is gone (m03664): a system dialog blocks and covers the
    // whole app, and it cannot show the operator which device is about to go.
    // The dialog names the device, and the button says 删除 rather than 确认.
    setBusy(true)
    try {
      await api(`/devices/${id}`, { method: 'DELETE' })
      setRemoving(null)
      setMsg({ kind: 'ok', text: `已删除「${devices.find((d) => d.id === id)?.name ?? '设备'}」` })
      refresh()
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  // The terminal tab is NOT mounted while the user is on 设备管理, so a
  // window-level CustomEvent alone would reach nobody. The connect request is
  // issued here and the resulting connection is parked in a module-level
  // pending slot that TerminalTab drains when it mounts; OpsPage then switches
  // to the 终端 tab. See requestConnect / takePendingConnect.
  const [connectingId, setConnectingId] = useState<string | null>(null)
  const connectDevice = async (d: DeviceDTO) => {
    setConnectingId(d.id)
    setMsg({ kind: 'ok', text: `正在连接 ${d.name}…` })
    try {
      await requestConnect(d.id, d.name)
    } finally {
      setConnectingId(null)
    }
  }

  /**
   * Manual liveness scan (m03664).
   *
   * The browser cannot open a raw TCP socket, so this asks the host, which owns
   * the loopback API anyway. Deliberately manual: a page that probes on a timer
   * would emit network traffic to every device on the list forever, and a firewall
   * with a scan-detection policy would start dropping the operator's own SSH
   * sessions. One press, one burst, then a verdict per card.
   */
  const scanLiveness = async () => {
    if (probing) return
    setProbing(true)
    // Mark every device in the visible list as probing first, so a 20-device
    // list does not sit blank for the length of the slowest timeout.
    putLiveness({
      ...livenessStore,
      ...Object.fromEntries(devices.map((d) => [d.id, { deviceId: d.id, ip: d.ip, port: d.port, state: 'probing' as const }])),
    })
    try {
      const j = (await api<{ results: DeviceLiveness[] }>('/devices/ping', { method: 'POST', body: {} })) as any
      const results = (j.results || []) as DeviceLiveness[]
      putLiveness({
        ...livenessStore,
        ...Object.fromEntries(results.map((r) => [r.deviceId, r])),
      })
      const up = results.filter((r) => r.state === 'online').length
      setMsg({
        kind: 'ok',
        text: results.length
          ? `存活检测：${up}/${results.length} 台 SSH 端口可达`
          : '没有可检测的设备',
      })
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message })
    } finally {
      setProbing(false)
    }
  }

  // ---- search + paging ----------------------------------------------------
  // Filtered on name / IP / account / type / note, case-insensitively. Each term
  // must match somewhere: splitting on whitespace makes "core 10.1" work, which
  // a plain substring test would miss.
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const filtered = devices.filter((d) => {
    if (!terms.length) return true
    const hay = [d.name, d.ip, d.account, d.note, DEVICE_TYPE_LABELS[d.deviceType ?? 'other']]
      .filter(Boolean).join(' ').toLowerCase()
    return terms.every((t) => hay.includes(t))
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  // Clamp instead of resetting: deleting the last row of the last page should
  // land on the previous page, not on an empty one.
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  // Prune verdicts for devices that no longer exist, so a deleted device does
  // not keep a badge alive in the map forever.
  const knownIds = new Set(devices.map((d) => d.id))
  const liveLiveness = Object.fromEntries(Object.entries(liveness).filter(([id]) => knownIds.has(id)))
  // Same rule for the WebUI verdicts, plus the host's own report: a device whose
  // window the operator closed is no longer a device with a verdict.
  const liveWebUi = Object.fromEntries(Object.entries(webUi).filter(([id]) => knownIds.has(id)))

  return h(Fragment, null,
    h('div', { className: 'ops-head' },
      h('div', null,
        h('h2', { className: 'ops-title' }, '设备管理'),
        h('div', { className: 'ops-sub' },
          filtered.length === devices.length
            ? `共 ${devices.length} 台设备`
            : `匹配 ${filtered.length} / ${devices.length} 台设备`),
      ),
      h('div', { className: 'ops-head-right' },
        h('button', {
          className: 'ops-btn',
          onClick: () => void scanLiveness(),
          disabled: probing || devices.length === 0,
          title: '对每台设备的 SSH 端口做一次 TCP 连接测试（不建立 SSH 会话）',
        }, probing ? '检测中…' : '检测存活'),
        h('button', { className: 'ops-btn', onClick: () => void refresh(), disabled: loading }, '刷新'),
        h('button', { className: 'ops-btn primary', onClick: openCreate, disabled: busy }, '+ 新增设备'),
      ),
    ),
    msg && h('div', { className: 'ops-msg ' + (msg.kind === 'ok' ? 'ok' : 'err') }, h('code', null, msg.text)),
    devices.length > 0 && h('div', { className: 'ops-toolbar' },
      h('div', { className: 'ops-search' },
        h('span', { className: 'ops-search-mark' }, '⌕'),
        h('input', {
          className: 'ops-input',
          value: query,
          placeholder: '搜索名称 / IP / 账号 / 备注',
          onChange: (e: any) => { setQuery(e.target.value); setPage(1) },
        }),
        query ? h('button', {
          className: 'ops-search-clear',
          onClick: () => { setQuery(''); setPage(1) },
          'aria-label': '清除搜索',
          title: '清除',
        }, '✕') : null,
      ),
    ),
    editing && h(DeviceDialog, {
      editing,
      copyFrom,
      form,
      setForm,
      busy,
      notice: formNotice,
      error: formError,
      onSave: () => void save(),
      onClose: closeForm,
    }),
    removing && h(ConfirmDialog, {
      title: '删除设备',
      lines: [
        { label: '名称', value: removing.name },
        { label: 'IP', value: `${removing.ip}:${removing.port}` },
        { label: '账号', value: removing.account },
        { label: '类型', value: DEVICE_TYPE_LABELS[removing.deviceType ?? 'other'] },
      ],
      warning: '删除后无法恢复，该设备的密码与配置会一并移除。已保存的连接日志会保留。',
      confirmText: '删除',
      onConfirm: () => void remove(removing.id),
      onClose: () => setRemoving(null),
    }),
    loading && devices.length === 0
      ? h('div', { className: 'ops-loading' }, '加载中…')
      : devices.length === 0
        ? h('div', { className: 'ops-empty' },
            h('b', null, '还没有设备'),
            '点击右上角「+ 新增设备」录入第一台设备，保存后即可一键连接 SSH 终端。',
          )
        : filtered.length === 0
          ? h('div', { className: 'ops-empty' },
              h('b', null, '没有匹配的设备'),
              `没有设备包含「${query.trim()}」，换个关键词或清除搜索。`,
            )
          : h(Fragment, null,
              h('div', { className: 'ops-list' }, pageItems.map((d) => {
                const live = liveLiveness[d.id]
                const wu = liveWebUi[d.id]
                const wuBusy = webUiBusy === d.id
                return h('div', { key: d.id, className: 'ops-dev' },
                  h('div', { className: 'ops-dev-top' },
                    live ? h(LivenessDot, { liveness: live, port: d.port }) : null,
                    h('div', { className: 'ops-dev-id' },
                      h('span', { className: 'ops-dev-name', title: d.name }, d.name),
                      h('code', { className: 'ops-dev-ip', title: `${d.account}@${d.ip}:${d.port}` }, d.ip),
                    ),
                    // m05847: the two ways onto the box, both on the name row and
                    // right-aligned. They are one decision ("get me onto this
                    // device"), so they sit together; 编辑/复制/删除 are record
                    // management and stay on the row below.
                    h('div', { className: 'ops-dev-logins' },
                      h('button', {
                        className: 'ops-btn login cli primary',
                        onClick: () => connectDevice(d),
                        disabled: connectingId === d.id,
                        title: `用 ${d.account} 打开 ${d.ip}:${d.port} 的 SSH 终端（CLI）`,
                      }, h(CliIcon), connectingId === d.id ? '连接中…' : 'CLI 登录'),
                      // m05288: opens the management UI in a real browser window and
                      // logs in with the stored account. The password is filled in by
                      // the host, so this button never has one to send.
                      h('button', {
                        className: 'ops-btn login web' + (wu?.status === 'ready' ? ' on' : ''),
                        onClick: () => void webLogin(d),
                        disabled: wuBusy,
                        title: `打开 ${d.ip} 的 Web 管理界面并自动登录（用设备表里保存的账号密码）`,
                      }, h(WebIcon), wuBusy ? '登录中…' : 'WebUI 登录'),
                    ),
                  ),
                  h('div', { className: 'ops-dev-tags' },
                    h('span', { className: 'ops-badge type', title: '设备类型' }, DEVICE_TYPE_LABELS[d.deviceType ?? 'other']),
                  ),
                  d.note ? h('div', { className: 'ops-dev-note', title: d.note }, d.note) : null,
                  h('div', { className: 'ops-dev-acts' },
                    h('button', { className: 'ops-btn sm', onClick: () => openEdit(d) }, '编辑'),
                    h('button', {
                      className: 'ops-btn sm',
                      onClick: () => openCopy(d),
                      title: `以「${d.name}」的信息预填新增表单（含已保存的密码），点保存后才创建`,
                    }, '复制'),
                    h('button', { className: 'ops-btn sm plain danger', onClick: () => setRemoving(d) }, '删除'),
                    // Only offered while a window is actually open: a close
                    // control that appears unconditionally teaches the operator
                    // to press a button that does nothing.
                    wu ? h('button', {
                      className: 'ops-btn sm plain',
                      onClick: () => void webLoginClose(d),
                      disabled: wuBusy,
                      title: '关闭该设备的管理界面窗口',
                    }, '关闭窗口') : null,
                  ),
                  wu ? h(WebUiVerdict, { state: wu }) : null,
                )
              })),
              totalPages > 1 && h('div', { className: 'ops-pager' },
                h('span', { className: 'ops-pager-info' },
                  `第 ${currentPage}/${totalPages} 页 · ${filtered.length} 台`),
                h('div', { className: 'ops-pager-acts' },
                  h('button', {
                    className: 'ops-btn sm', disabled: currentPage <= 1, onClick: () => setPage(currentPage - 1),
                  }, '上一页'),
                  h('button', {
                    className: 'ops-btn sm', disabled: currentPage >= totalPages, onClick: () => setPage(currentPage + 1),
                  }, '下一页'),
                ),
              ),
            ),
  )
}

// ---- terminal tab ---------------------------------------------------------

/**
 * Terminal palette. The device paints with its own ANSI colours; with xterm's
 * default two-colour theme every one of them collapsed onto the same grey,
 * which is what made structured CLI output (config dumps, tables, severity
 * colours) unreadable. These values are the artwork of a dark terminal and are
 * deliberately literal — they must not follow the app theme, because a device
 * emits SGR codes that assume a dark background.
 */
const TERM_THEME = {
  background: '#0d0d12',
  foreground: '#e8e8ec',
  cursor: '#e8e8ec',
  cursorAccent: '#0d0d12',
  selectionBackground: 'rgba(122, 152, 205, 0.35)',
  black: '#1b1e25',
  red: '#f85149',
  green: '#3fb950',
  yellow: '#d6a419',
  blue: '#4c8dff',
  magenta: '#bc8cff',
  cyan: '#39c5cf',
  white: '#c3c9d4',
  brightBlack: '#6b7280',
  brightRed: '#ff8078',
  brightGreen: '#5ad46a',
  brightYellow: '#e8c05a',
  brightBlue: '#79b8ff',
  brightMagenta: '#d2a8ff',
  brightCyan: '#56d4dd',
  brightWhite: '#f2f5f9',
}

/**
 * Explicit monospace stack. Left to itself xterm uses its own default, which on
 * Windows resolves to a proportional-ish fallback on some machines and makes
 * columns drift, so the device's box-drawing and column output stop lining up.
 */
const TERM_FONT =
  '"Cascadia Mono", "JetBrains Mono", Consolas, "SF Mono", Menlo, "DejaVu Sans Mono", monospace'

const FONT_SIZES = [11, 12, 13, 14, 16, 18]
const DEFAULT_FONT = 2
/**
 * Keystrokes are batched for this long before one POST. A request per keypress
 * meant dozens of in-flight round trips per second; they also had no guaranteed
 * order, so a fast typist could reach the device with their characters
 * shuffled. 8ms keeps the wire silent for a human and costs no perceived lag.
 */
const INPUT_FLUSH_MS = 8
/** Above this a single batch is sent immediately rather than waiting for the timer. */
const INPUT_MAX = 4096
/** Cap on pending output held between two paints, so a flood cannot exhaust memory. */
const OUT_MAX = 512 * 1024

function TerminalPane({ conn }: { conn: ConnectionInfo }): ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitRef = useRef<FitAddon | null>(null)
  const esRef = useRef<EventSource | null>(null)
  const sizeObserverRef = useRef<ResizeObserver | null>(null)
  const pushSizeRef = useRef<(() => void) | null>(null)
  const [status, setStatus] = useState<ConnectionInfo['status']>(conn.status)
  const [agentCmd, setAgentCmd] = useState<string | null>(null)
  const [fontIdx, setFontIdx] = useState(DEFAULT_FONT)
  const [inputErr, setInputErr] = useState<string | null>(null)
  const [link, setLink] = useState<'up' | 'down'>('up')

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    ensureXtermCss()
    // scrollback so a long `show version` dump stays readable after it scrolls
    // by; the device wraps at the width we advertise, so keep the two in sync.
    const term = new Terminal({
      convertEol: true,
      fontFamily: TERM_FONT,
      fontSize: FONT_SIZES[fontIdx],
      lineHeight: 1.25,
      scrollback: 20000,
      cursorBlink: true,
      cursorStyle: 'bar',
      drawBoldTextInBrightColors: true,
      theme: TERM_THEME,
    })
    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(el)
    try { fit.fit() } catch { /* ignore */ }
    termRef.current = term
    fitRef.current = fit

    // ---- output: one write per frame, not per SSE frame -------------------
    // A device flushing a table delivers hundreds of chunks per second. Feeding
    // each one straight into term.write queues thousands of parse jobs and the
    // terminal visibly lags behind (and stops accepting input promptly). Bytes
    // are accumulated here and handed to xterm once per animation frame, which
    // is also the rate at which the result can be seen.
    let pending = ''
    let dropped = 0
    let cancelPaint: (() => void) | null = null
    const flushOut = () => {
      cancelPaint = null
      if (!pending) return
      const text = pending
      pending = ''
      try { term.write(text) } catch { /* ignore */ }
      if (dropped > 0) {
        const n = dropped
        dropped = 0
        try {
          term.write(`\r\n\x1b[33m[界面来不及绘制，已省略 ${n} 批输出]\x1b[0m\r\n`)
        } catch { /* ignore */ }
      }
    }
    const paint = () => {
      if (cancelPaint) return
      if (typeof requestAnimationFrame === 'function') {
        const id = requestAnimationFrame(flushOut)
        cancelPaint = () => cancelAnimationFrame(id)
      } else {
        const id = window.setTimeout(flushOut, 16)
        cancelPaint = () => window.clearTimeout(id)
      }
    }
    const pushOut = (text: string) => {
      pending += text
      if (pending.length > OUT_MAX) {
        pending = pending.slice(-OUT_MAX)
        dropped += 1
      }
      paint()
    }

    // Tell the device how wide/tall the operator's view is. Without this the
    // CLI falls back to its own pager and stops at `--More--`.
    const pushSize = () => {
      const { cols, rows } = term
      if (!cols || !rows) return
      api('/conn/resize', { method: 'POST', body: { connId: conn.connId, cols, rows } }).catch(() => {})
    }
    pushSizeRef.current = pushSize
    pushSize()
    term.onResize(pushSize)

    const onResize = () => {
      try { fit.fit() } catch { /* ignore */ }
      pushSize()
    }
    window.addEventListener('resize', onResize)
    if (typeof ResizeObserver !== 'undefined') {
      try {
        const ro = new ResizeObserver(onResize)
        ro.observe(el)
        sizeObserverRef.current = ro
      } catch { /* ignore */ }
    }

    // ---- input: batch, never echo locally --------------------------------
    // No local echo: the pty echoes what it receives, so writing the character
    // here as well would double every keystroke on screen. Latency is one
    // loopback round trip either way; the win is fewer, ordered requests.
    let inputBuf = ''
    let inputTimer: number | undefined
    const flushInput = () => {
      if (inputTimer !== undefined) {
        window.clearTimeout(inputTimer)
        inputTimer = undefined
      }
      if (!inputBuf) return
      const data = inputBuf
      inputBuf = ''
      api('/conn/input', { method: 'POST', body: { connId: conn.connId, data } }).then(
        () => setInputErr(null),
        (e: Error) => setInputErr(`输入未送达设备：${e.message}`),
      )
    }
    const pushInput = (data: string) => {
      inputBuf += data
      if (inputBuf.length >= INPUT_MAX) flushInput()
      else if (inputTimer === undefined) inputTimer = window.setTimeout(flushInput, INPUT_FLUSH_MS)
    }
    const onData = term.onData((d) => pushInput(d))

    // ---- output stream: reconnect and restore ----------------------------
    // EventSource gives up for good when the endpoint answers a non-2xx (a dead
    // session 404s), and it does not tell the page that a reattach replays the
    // session log instead of continuing live output. Both matter: without the
    // replay the terminal comes back blank, and without the retry it never
    // comes back at all.
    let stopped = false
    let seenStream = false
    let retries = 0
    let retryTimer: number | undefined
    let es: EventSource | null = null

    const open = () => {
      if (stopped) return
      const s = new EventSource(API + `/conn/${conn.connId}/stream`)
      es = s
      esRef.current = s
      s.addEventListener('data', (ev) => {
        let p: any
        try { p = JSON.parse((ev as MessageEvent).data) } catch { return }
        const text = typeof p?.text === 'string' ? p.text : ''
        if (p?.snapshot && seenStream) {
          // Reattach replay: rebuild the screen instead of stacking a second
          // copy of the transcript under the one already on it.
          pending = ''
          try { term.reset() } catch { /* ignore */ }
        }
        if (text) {
          seenStream = true
          pushOut(text)
        }
      })
      s.addEventListener('status', (ev) => {
        try {
          const p = JSON.parse((ev as MessageEvent).data)
          setStatus(p.status)
          // The shell itself is gone — retrying cannot help, and the operator
          // needs to reconnect rather than watch a spinner.
          if (p.status === 'closed' || p.status === 'error') stopped = true
        } catch { /* ignore */ }
      })
      // The host tells us when the agent takes over this shell, so the header can
      // show who is typing.
      s.addEventListener('agent', (ev) => {
        try {
          const p = JSON.parse((ev as MessageEvent).data)
          setAgentCmd(p.active ? String(p.command ?? '') : null)
        } catch { /* ignore */ }
      })
      s.onerror = () => {
        try { s.close() } catch { /* ignore */ }
        if (es === s) esRef.current = null
        if (stopped) return
        setLink('down')
        retries += 1
        const wait = Math.min(5000, 250 * 2 ** Math.min(retries, 5))
        retryTimer = window.setTimeout(open, wait)
      }
    }
    open()

    return () => {
      stopped = true
      if (retryTimer !== undefined) window.clearTimeout(retryTimer)
      cancelPaint?.()
      if (inputTimer !== undefined) window.clearTimeout(inputTimer)
      onData.dispose()
      window.removeEventListener('resize', onResize)
      pushSizeRef.current = null
      try { sizeObserverRef.current?.disconnect() } catch { /* ignore */ }
      sizeObserverRef.current = null
      try { esRef.current?.close() } catch { /* ignore */ }
      try { term.dispose() } catch { /* ignore */ }
    }
  }, [conn.connId])

  // Font size is applied to the live terminal instead of remounting it, so the
  // connection, the stream and the scrollback all survive the change.
  useEffect(() => {
    const term = termRef.current
    if (!term) return
    try { term.options.fontSize = FONT_SIZES[fontIdx] } catch { /* ignore */ }
    try { fitRef.current?.fit() } catch { /* ignore */ }
    pushSizeRef.current?.()
  }, [fontIdx])

  const fontSmaller = fontIdx > 0
  const fontBigger = fontIdx < FONT_SIZES.length - 1

  return h('div', { style: { display: 'flex', flexDirection: 'column', height: '100%' } },
    h('div', { className: 'ops-term-bar' },
      h('span', { className: 'ops-term-id' },
        h('b', null, conn.deviceName),
        h(StatusBadge, { status: status || 'connecting' }),
        h('code', null, conn.connId.slice(0, 8)),
        // While the agent drives this shell, say so — the command is typed by
        // the host, not by the operator, and the output below is live.
        agentCmd ? h('span', { className: 'ops-badge agent', title: 'Agent 正在这条会话上执行命令，回显会实时出现在下方' }, `agent: ${agentCmd}`) : null,
        link === 'down' ? h('span', { className: 'ops-badge error', title: '输出流已断开，正在自动重连并恢复滚屏' }, '输出流断开，重连中…') : null,
        inputErr ? h('span', { className: 'ops-badge error', title: '输入没有送达设备，检查连接后重试' }, inputErr) : null,
      ),
      h('span', { className: 'ops-term-acts' },
        h('button', {
          className: 'ops-btn sm plain',
          disabled: !fontSmaller,
          title: '缩小字号',
          onClick: () => setFontIdx((i) => Math.max(0, i - 1)),
        }, 'A-'),
        h('button', {
          className: 'ops-btn sm plain',
          disabled: !fontBigger,
          title: '放大字号',
          onClick: () => setFontIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1)),
        }, 'A+'),
        h('button', { className: 'ops-btn sm', onClick: () => { try { termRef.current?.clear() } catch { /* ignore */ } } }, '清屏'),
        h('button', { className: 'ops-btn sm danger', onClick: () => api('/disconnect', { method: 'POST', body: { connId: conn.connId } }).catch(() => {}) }, '断开'),
      ),
    ),
    h('div', { ref: containerRef, className: 'ops-term-canvas' }),
  )
}

// ---- log tab ----------------------------------------------------------------

/** `2026-10-05T02:17:33.481Z` → `10-05 10:17:33` in the viewer's local zone. */
function fmtTime(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/**
 * Make recorded keystrokes readable. `input` entries hold raw bytes, so CR/LF
 * and the control characters a terminal uses for editing would otherwise dump
 * as mojibake in the log view.
 */
function fmtInput(text: string): string {
  return text
    .replace(/\r/g, '⏎')
    .replace(/\n/g, '⏎')
    .replace(/\x7f|\x08/g, '⌫')
    .replace(/\x03/g, '^C')
    .replace(/\x1b\[([A-Za-z])/g, '^[')
    .replace(/[\x00-\x1f]/g, '')
}

const SOURCE_LABEL: Record<string, string> = { operator: '操作员', agent: 'Agent', system: '系统' }

function LogTab(): ReactElement {
  const [logs, setLogs] = useState<SessionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [detail, setDetail] = useState<SessionLogDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  // A long session's raw keystrokes dwarf its commands, so the entry filter
  // defaults to the readable ones and the raw input stays one click away.
  const [showInput, setShowInput] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const j = (await api<{ logs: SessionLog[] }>('/logs')) as any
      setLogs(j.logs || [])
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    // A session that is still open gains entries while the tab sits idle.
    const iv = setInterval(refresh, 5000)
    return () => clearInterval(iv)
  }, [refresh])

  // No auto-open any more (m03664). The detail is a dialog, and a dialog that
  // opens by itself the moment the tab mounts — or every time a 5s poll notices
  // the newest session — is an interruption, not a convenience. The list is the
  // page; the operator opens what they want to read.

  useEffect(() => {
    if (!activeId) { setDetail(null); return }
    let cancelled = false
    setDetailLoading(true)
    api<{ log: SessionLogDetail }>(`/logs/${encodeURIComponent(activeId)}`)
      .then((j: any) => { if (!cancelled) setDetail(j.log) })
      .catch((e: Error) => { if (!cancelled) setMsg({ kind: 'err', text: e.message }) })
      .finally(() => { if (!cancelled) setDetailLoading(false) })
    return () => { cancelled = true }
  }, [activeId])

  const entries = (detail?.entries || []).filter((e) => showInput || e.kind !== 'input')
  const commandCount = (detail?.entries || []).filter((e) => e.kind === 'command').length

  return h(Fragment, null,
    h('div', { className: 'ops-head' },
      h('div', null,
        h('h2', { className: 'ops-title' }, '日志'),
        h('div', { className: 'ops-sub' },
          logs.length ? `共 ${logs.length} 次连接记录 · 保留最近 30 天` : '暂无连接记录'),
      ),
      h('div', { className: 'ops-head-right' },
        h('button', { className: 'ops-btn', onClick: () => void refresh(), disabled: loading }, '刷新'),
      ),
    ),
    msg && h('div', { className: 'ops-msg ' + (msg.kind === 'ok' ? 'ok' : 'err') }, h('code', null, msg.text)),
    // The transcript lives in a dialog now (m03664), so the log tab is a list of
    // sessions and nothing else. Two columns in a 400px rail meant the session
    // names were truncated to unreadable slivers; the list gets the full width
    // and the detail gets a readable card.
    detail && h(OpsModal, {
      title: h(Fragment, null,
        h('span', { className: 'ops-log-title' }, detail.deviceName),
        h(StatusBadge, { status: detail.active ? 'ready' : 'closed' }),
      ),
      onClose: () => setActiveId(null),
    },
      detailLoading
        ? h('div', { className: 'ops-loading' }, '加载中…')
        : h(Fragment, null,
            h('div', { className: 'ops-log-detail-meta' },
              h('span', null, `会话 ${detail.connId.slice(0, 8)}`),
              h('span', null, `开始 ${fmtTime(detail.startedAt)}`),
              h('span', null, `结束 ${fmtTime(detail.endedAt)}`),
              h('span', null, `命令 ${commandCount} 条`),
              detail.deviceType ? h('span', null, DEVICE_TYPE_LABELS[detail.deviceType] ?? detail.deviceType) : null,
            ),
            h('div', { className: 'ops-log-detail-acts' },
              h('button', {
                className: 'ops-btn sm' + (showInput ? ' on' : ''),
                onClick: () => setShowInput((v) => !v),
                title: '逐字符的输入记录噪音很大，默认折叠',
              }, showInput ? '隐藏逐键输入' : '显示逐键输入'),
            ),
            entries.length === 0
              ? h('div', { className: 'ops-empty' }, '该记录没有可显示的条目')
              : h('div', { className: 'ops-log-entries' }, entries.map((e) =>
                  h('div', { key: e.seq, className: 'ops-log-entry ' + e.kind },
                    h('span', { className: 'ops-log-entry-time' }, fmtTime(e.at).slice(6)),
                    h('span', { className: 'ops-log-entry-kind' }, e.kind === 'command' ? '$' : e.kind === 'event' ? '•' : '⌨'),
                    h('span', { className: 'ops-log-entry-src' }, SOURCE_LABEL[e.source || 'system'] || e.source),
                    h('code', { className: 'ops-log-entry-text' },
                      e.kind === 'input' ? fmtInput(e.text) : e.text),
                  ),
                )),
          ),
    ),
    loading && logs.length === 0
      ? h('div', { className: 'ops-loading' }, '加载中…')
      : logs.length === 0
        ? h('div', { className: 'ops-empty' },
            h('b', null, '还没有连接记录'),
            '每次连接设备都会在这里留下一条记录，包含操作员输入的命令、Agent 执行的命令和连接事件。',
          )
        : h('div', { className: 'ops-logs' },
            h('div', { className: 'ops-log-list' },
              logs.map((l) =>
                h('button', {
                  key: l.id,
                  className: 'ops-log-row',
                  onClick: () => setActiveId(l.id),
                },
                  h('div', { className: 'ops-log-row-top' },
                    h('b', null, l.deviceName || '未知设备'),
                    l.active
                      ? h('span', { className: 'ops-badge ready' }, '进行中')
                      : h('span', { className: 'ops-badge idle' }, '已结束'),
                  ),
                  h('div', { className: 'ops-log-row-meta' },
                    h('code', null, (l.connId || '').slice(0, 8) || '—'),
                    h('span', null, '·'),
                    h('span', null, l.account || '—'),
                    h('span', null, '·'),
                    h('span', null, fmtTime(l.startedAt)),
                  ),
                  h('div', { className: 'ops-log-row-sub' }, `${l.entryCount} 条记录 · ${l.endReason || (l.active ? '进行中' : '已结束')}`),
                ),
              ),
            ),
          ),
  )
}

function TerminalTab(): ReactElement {
  const [conns, setConns] = useState<ConnectionInfo[]>([])
  const [activeConn, setActiveConn] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshConns = useCallback(async () => {
    try {
      const j = (await api<{ connections: ConnectionInfo[] }>('/conn')) as any
      setConns(j.connections || [])
    } catch {
      /* keep */
    }
  }, [])

  useEffect(() => {
    refreshConns()
    const iv = setInterval(refreshConns, 3000)
    return () => clearInterval(iv)
  }, [refreshConns])

  // Whatever landed us here, focus the session the user came for: the newest
  // one if we have not chosen yet, otherwise a host-side connect that arrived
  // while the agent was working.
  useEffect(() => {
    if (!conns.length) return
    setActiveConn((cur) =>
      cur && conns.some((c) => c.connId === cur) ? cur : (conns[conns.length - 1] as ConnectionInfo).connId,
    )
    for (const c of conns) seenConnIds.add(c.connId)
  }, [conns])

  // Drain a connect request that was issued from the 设备管理 tab while this
  // tab was unmounted — or from anywhere while it is mounted. The subscriber
  // set means a click on either tab wakes us up.
  useEffect(() => onPendingConnect(() => {
    if (!pendingConnect) return
    const { result, error } = takePendingConnect()
    if (result) {
      setConns((prev) => [...prev.filter((c) => c.connId !== result.connId), result])
      setActiveConn(result.connId)
    }
    if (error) setError(error)
    setConnecting(false)
  }), [])

  const active = conns.find((c) => c.connId === activeConn)
  return h(Fragment, null,
    h('div', { className: 'ops-head' },
      h('div', null,
        h('h2', { className: 'ops-title' }, '终端'),
        h('div', { className: 'ops-sub' }, conns.length ? `${conns.length} 条活动连接` : '暂无活动连接'),
      ),
      h('div', { className: 'ops-head-right' },
        h('button', { className: 'ops-btn', onClick: () => void refreshConns() }, '刷新连接'),
      ),
    ),
    error && h('div', { className: 'ops-msg err' }, h('code', null, error)),
    connecting && h('div', { className: 'ops-loading' }, '正在连接…'),
    conns.length > 0
      ? h('div', { className: 'ops-conns' },
          h('span', { className: 'ops-conns-label' }, '会话'),
          conns.map((c) => h('button', { key: c.connId, className: 'ops-btn sm' + (c.connId === activeConn ? ' on' : ''), onClick: () => setActiveConn(c.connId) }, c.deviceName)),
        )
      : !connecting
        ? h('div', { className: 'ops-empty' },
            h('b', null, '暂无连接'),
            '连接成功后会自动切到这个页面。在「设备管理」中点击「CLI 登录」，或让 agent 调用 hillstone_open_terminal，即可在这里打开 SSH 终端。',
          )
        : null,
    h('div', { style: { flex: 1, minHeight: 320 } }, active ? h(TerminalPane, { key: active.connId, conn: active }) : null),
  )
}

// ---- execution policy tab (执行策略, m06703/m06704) ------------------------
//
// A user-authored CRUD model: there is no built-in deny list on the host. The
// operator creates records, each binding a daily time window to the command
// patterns they typed. The host blocks a command at execution time if ANY
// enabled policy matches it (word-boundary substring) for the current time.
// This tab is the only editor; the host's /ops-api/policies CRUD is the store.

/**
 * Window options for the two time dropdowns, in 15-minute steps (m09323).
 *
 * The host parses any "HH:MM" (`HHMM_RE` in index.ts), so these are the values
 * the UI offers, not the values the host accepts — a policy written by hand over
 * HTTP can still carry 09:07 and the host will honour it. We step by 15 because
 * that is the smallest gap that can express a real "工作日夜间" or "午休时段"
 * window without turning the list into 1441 rows.
 *
 * `''` is the empty option and it is NOT the same as '00:00': an empty window
 * means the policy applies every minute of every day, while 00:00 is a bound.
 */
const TIME_STEP_MINUTES = 15
const TIME_OPTIONS: readonly string[] = (() => {
  const out: string[] = ['']
  for (let m = 0; m < 24 * 60; m += TIME_STEP_MINUTES) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0')
    const mm = String(m % 60).padStart(2, '0')
    out.push(`${hh}:${mm}`)
  }
  return out
})()

/**
 * The value a `<select>` must carry for a stored window bound.
 *
 * A policy created over HTTP can hold any minute the host's HHMM_RE accepts,
 * including 09:07, which is not one of TIME_OPTIONS. Snapping it to the nearest
 * 15-minute step would make saving an unrelated edit silently move the window —
 * so instead the stored value is preserved in the state and an extra option is
 * rendered for it. The operator sees the real bound and a save round-trips
 * unchanged.
 */
function windowValue(stored: string): string {
  const s = (stored || '').trim()
  if (!s || TIME_OPTIONS.includes(s)) return s
  return OFF_GRID_OPTION_PREFIX + s
}

/** Sentinel prefix for the injected option; never a valid HH:MM. */
const OFF_GRID_OPTION_PREFIX = 'keep:'

/** The extra <option> needed when a stored bound is off the 15-minute grid. */
function offGridOption(stored: string, label: string): ReactElement | null {
  const s = (stored || '').trim()
  if (!s || TIME_OPTIONS.includes(s)) return null
  return h('option', { key: OFF_GRID_OPTION_PREFIX + s, value: OFF_GRID_OPTION_PREFIX + s }, `${label} ${s}（非整刻度）`)
}

/** Strip the sentinel back off, so state always holds a plain HH:MM (or ''). */
function unwindowValue(v: string): string {
  return v.startsWith(OFF_GRID_OPTION_PREFIX) ? v.slice(OFF_GRID_OPTION_PREFIX.length) : v
}

/**
 * Render a policy's window as a short human phrase (no zone detail).
 *
 * A window can legitimately hold a minute the dropdown never offers (someone
 * PUT it over HTTP), so an unmatched value is shown verbatim rather than
 * snapped to the nearest step — silently rewriting someone's 09:07 to 09:00
 * would be worse than showing the odd value.
 */
function describeWindow(win?: PolicyWindow): string {
  if (!win || (!win.start && !win.end)) return '始终生效'
  const s = win.start || '00:00'
  const e = win.end || '24:00'
  return `每日 ${s}–${e}`
}

interface PolicyForm {
  name: string
  enabled: boolean
  start: string
  end: string
  commands: string
  note: string
}

// The zone is not editable (m09323): policy windows are read by whoever is on
// shift in this office, and Asia/Shanghai is that zone. Keeping a text box for
// it meant two failure modes — a typo like "Asia/ShangHai" that silently falls
// back to host-local, and a value nobody can tell apart from the default. The
// host still reads `window.timezone` and still honours whatever is stored, so an
// existing policy written in another zone keeps working; this only removes the
// ability to create a new one by hand here.
const POLICY_TIMEZONE = 'Asia/Shanghai'

const EMPTY_POLICY: PolicyForm = {
  name: '',
  enabled: true,
  start: '',
  end: '',
  commands: '',
  note: '',
}

function PolicyManager(): ReactElement {
  const [policies, setPolicies] = useState<ExecPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<{ id?: string } | null>(null)
  const [form, setForm] = useState<PolicyForm>(EMPTY_POLICY)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [removing, setRemoving] = useState<ExecPolicy | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const j = (await api<{ policies: ExecPolicy[] }>('/policies')) as any
      setPolicies(j.policies || [])
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const openCreate = () => {
    setEditing({})
    setForm({ ...EMPTY_POLICY })
    setFormError(null)
  }
  const openEdit = (p: ExecPolicy) => {
    setEditing({ id: p.id })
    setForm({
      name: p.name,
      enabled: p.enabled,
      start: p.window?.start || '',
      end: p.window?.end || '',
      commands: (p.commands || []).join('\n'),
      note: p.note || '',
    })
    setFormError(null)
  }
  const closeForm = () => setEditing(null)

  const save = async () => {
    const commands = form.commands.split('\n').map((c) => c.trim()).filter(Boolean)
    if (!form.name.trim() || commands.length === 0) {
      setFormError('策略名称与至少一个命令模式必填')
      return
    }
    const start = form.start.trim()
    const end = form.end.trim()
    const payload = {
      name: form.name.trim(),
      enabled: form.enabled,
      // A window needs at least one bound. `start === end` means "always" to a
      // reader (00:00–00:00 looks like a bug), and the host agrees in effect:
      // [start, end) with equal bounds is an empty range, so it would block
      // nothing while LOOKING armed. Say 始终生效 instead.
      window: start || end ? { start, end, timezone: POLICY_TIMEZONE } : undefined,
      commands,
      note: form.note.trim() || undefined,
    }
    setBusy(true)
    setFormError(null)
    try {
      if (editing?.id) {
        await api(`/policies/${editing.id}`, { method: 'PUT', body: payload })
        setMsg({ kind: 'ok', text: `已保存策略「${payload.name}」` })
      } else {
        await api('/policies', { method: 'POST', body: payload })
        setMsg({ kind: 'ok', text: `已新建策略「${payload.name}」` })
      }
      closeForm()
      refresh()
    } catch (e) {
      setFormError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  const remove = async (id: string) => {
    setBusy(true)
    try {
      await api(`/policies/${id}`, { method: 'DELETE' })
      setRemoving(null)
      setMsg({ kind: 'ok', text: `已删除策略「${removing?.name ?? ''}」` })
      refresh()
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  return h(Fragment, null,
    h('div', { className: 'ops-head' },
      h('div', null,
        h('h2', { className: 'ops-title' }, '执行策略'),
        h('div', { className: 'ops-sub' },
          loading ? '加载中…'
            : policies.length ? `共 ${policies.length} 条策略`
            : '还没有策略'),
      ),
      h('div', { className: 'ops-head-right' },
        h('button', { className: 'ops-btn', onClick: () => void refresh(), disabled: loading }, '刷新'),
        h('button', { className: 'ops-btn primary', onClick: openCreate, disabled: busy }, '+ 新增策略'),
      ),
    ),
    // The purpose line (m09323). It names the constrained party — the agent —
    // and the two entry points, because "限制哪些命令" reads as a panel-wide
    // filter until you know the operator's own terminal is untouched by design.
    h('div', { className: 'ops-intro' },
      h('b', null, '执行策略用于限制 agent 调用运维工具时执行命令。'),
      '每条策略 = 一个时间窗口 + 一组命令模式；命中即拒绝，不下发到设备。',
      h('span', { className: 'ops-intro-scope' },
        '拦截点：hillstone_run_and_analyze、hillstone_send_input。你在终端里手动敲的命令不受影响。'),
    ),
    msg && h('div', { className: 'ops-msg ' + (msg.kind === 'ok' ? 'ok' : 'err') }, h('code', null, msg.text)),
    loading && policies.length === 0
      ? h('div', { className: 'ops-loading' }, '加载中…')
      : policies.length === 0
        ? h('div', { className: 'ops-empty' },
            h('b', null, '还没有执行策略'),
            '点击右上角「+ 新增策略」创建规则：选择时间窗口并填入要限制的命令（每行一个）。命中策略的命令在 agent 调用运维工具时会被拒绝。',
          )
        : h('div', { className: 'ops-list' }, policies.map((p) =>
            h('div', { key: p.id, className: 'ops-dev' },
              h('div', { className: 'ops-dev-top' },
                h('div', { className: 'ops-dev-id' },
                  h('span', { className: 'ops-dev-name', title: p.name }, p.name),
                  h('code', { className: 'ops-dev-ip' }, describeWindow(p.window)),
                ),
                h('div', { className: 'ops-dev-logins' },
                  h('button', {
                    className: 'ops-btn sm' + (p.enabled ? ' on' : ''),
                    title: p.enabled ? '点击停用' : '点击启用',
                    onClick: async () => {
                      try {
                        await api(`/policies/${p.id}`, { method: 'PUT', body: { name: p.name, enabled: !p.enabled, commands: p.commands, note: p.note, window: p.window } })
                        refresh()
                      } catch (e) { setMsg({ kind: 'err', text: (e as Error).message }) }
                    },
                  }, p.enabled ? '已启用' : '已停用'),
                ),
              ),
              h('div', { className: 'ops-dev-tags' },
                (p.commands || []).map((c, i) => h('span', { key: i, className: 'ops-badge type', title: `命中的命令模式：${c}` }, c)),
              ),
              p.note ? h('div', { className: 'ops-dev-note', title: p.note }, p.note) : null,
              h('div', { className: 'ops-dev-acts' },
                h('button', { className: 'ops-btn sm', onClick: () => openEdit(p) }, '编辑'),
                h('button', { className: 'ops-btn sm plain danger', onClick: () => setRemoving(p) }, '删除'),
              ),
            ),
          )),
    editing && h(OpsModal, {
      title: editing.id ? '编辑策略' : '新增策略',
      onClose: closeForm,
      foot: h(Fragment, null,
        h('button', { className: 'ops-btn primary', onClick: () => void save(), disabled: busy }, busy ? '保存中…' : '保存'),
        h('button', { className: 'ops-btn plain', onClick: closeForm, disabled: busy }, '取消'),
      ),
      children: h(Fragment, null,
        formError ? h('div', { className: 'ops-msg err', style: { marginBottom: 12 } }, h('code', null, formError)) : null,
        h('div', { className: 'ops-grid2' },
          h('label', { className: 'ops-field' },
            h('span', { className: 'ops-label' }, '策略名称'),
            h('input', { className: 'ops-input', value: form.name, placeholder: '例如：夜间高危命令冻结', onChange: (e: any) => setForm({ ...form, name: e.target.value }) }),
          ),
          h('label', { className: 'ops-field' },
            h('span', { className: 'ops-label' }, '启用'),
            h('label', { className: 'ops-switch' },
              h('input', { type: 'checkbox', checked: form.enabled, onChange: (e: any) => setForm({ ...form, enabled: e.target.checked }) }),
              h('span', { className: 'ops-switch-track' }),
            ),
          ),
          h('label', { className: 'ops-field' },
            h('span', { className: 'ops-label' }, '开始时间', h('i', null, '不限下界')),
            h('select', {
              className: 'ops-input ops-select',
              value: windowValue(form.start),
              onChange: (e: any) => setForm({ ...form, start: unwindowValue(e.target.value) }),
            }, offGridOption(form.start, '自') ?? null, TIME_OPTIONS.map((t) => h('option', { key: t || 'any', value: t }, t || '不限'))),
          ),
          h('label', { className: 'ops-field' },
            h('span', { className: 'ops-label' }, '结束时间', h('i', null, '不限上界')),
            h('select', {
              className: 'ops-input ops-select',
              value: windowValue(form.end),
              onChange: (e: any) => setForm({ ...form, end: unwindowValue(e.target.value) }),
            }, offGridOption(form.end, '自') ?? null, TIME_OPTIONS.map((t) => h('option', { key: t || 'any', value: t }, t || '不限'))),
          ),
          h('label', { className: 'ops-field', style: { gridColumn: '1 / -1' } },
            h('span', { className: 'ops-label' }, '命令模式', h('i', null, '每行一个，词边界匹配')),
            h('textarea', { className: 'ops-input ops-textarea', rows: 5, value: form.commands, placeholder: 'reload\ndeleten\nerase', onChange: (e: any) => setForm({ ...form, commands: e.target.value }) }),
          ),
          h('label', { className: 'ops-field', style: { gridColumn: '1 / -1' } },
            h('span', { className: 'ops-label' }, '备注', h('i', null, '可选')),
            h('input', { className: 'ops-input', value: form.note, placeholder: '可选', onChange: (e: any) => setForm({ ...form, note: e.target.value }) }),
          ),
        ),
        h('div', { className: 'ops-form-hint' }, '时间窗口为空表示始终生效，步进 15 分钟，时区固定 Asia/Shanghai。命令按词边界包含匹配（如 "reload" 命中 "reload force"，但不命中 "reloading"）。'),
      ),
    }),
    removing && h(ConfirmDialog, {
      title: '删除策略',
      lines: [
        { label: '名称', value: removing.name },
        { label: '窗口', value: describeWindow(removing.window) },
        { label: '命令', value: (removing.commands || []).join(' / ') },
      ],
      warning: '删除后该限制立即失效，且无法恢复。',
      confirmText: '删除',
      onConfirm: () => void remove(removing.id),
      onClose: () => setRemoving(null),
    }),
  )
}

// ---- page shell -----------------------------------------------------------

// The sidebar tab slot hands the body the session it belongs to (standardProps),
// so the page reads its own id from here instead of the module global — the
// global is only the slot's registration-time value, which is the session that
// happened to be on screen then, not necessarily this one.
function OpsPage(props: { sessionId?: string } = {}): ReactElement {
  const [tab, setTab] = useState<'devices' | 'terminal' | 'logs' | 'policies'>('devices')
  const [tokenMsg, setTokenMsg] = useState<string | null>(null)
  const [tokenInput, setTokenInput] = useState('')
  const sessionId = typeof props.sessionId === 'string' && props.sessionId ? props.sessionId : panelSessionId
  useEffect(() => {
    setTokenNotice((reason) => setTokenMsg(reason))
    return () => setTokenNotice(null)
  }, [])
  // A CLI 登录 click on the 设备管理 tab must land the user on 终端. TerminalTab
  // is unmounted while we are here, so the bridge notifies this shell instead.
  useEffect(() => onPendingConnect(() => setTab('terminal')), [])
  // A session opened by the agent (hillstone_open_terminal / run_and_analyze)
  // has to land the user on the terminal page too, otherwise the connect is
  // invisible until they open the panel by hand. The intent can arrive before
  // this body exists (the poll opens the tab first), so the parked flag is
  // consumed on mount — otherwise the panel opens on 设备管理 and the operator
  // sees nothing happening on the device.
  useEffect(() => {
    if (takePendingReveal(sessionId)) setTab('terminal')
    return onRevealTerminal(() => setTab('terminal'))
  }, [sessionId])
  injectStyles()
  const TABS = { devices: '设备管理', terminal: '终端', logs: '日志', policies: '执行策略' } as const
  return h('div', { className: 'ops-root', style: { padding: '16px 16px 0', color: 'var(--dsw-alias-label-primary, #e7e7ea)' } },
    h('div', { className: 'ops-seg' },
      (Object.keys(TABS) as (keyof typeof TABS)[]).map((t) =>
        h('button', { key: t, className: tab === t ? 'on' : '', onClick: () => setTab(t) }, TABS[t]),
      ),
    ),
    // Token banner lives on the page shell so it is reachable from BOTH tabs.
    tokenMsg && h('div', { className: 'ops-msg err', style: { marginTop: 12 } },
      h('code', null, tokenMsg),
      h('div', { className: 'ops-msg-acts' },
        h('input', { className: 'ops-input', style: { flex: 1 }, placeholder: '粘贴令牌', value: tokenInput, onChange: (e: any) => setTokenInput(e.target.value) }),
        h('button', { className: 'ops-btn primary', onClick: () => { setManualToken(tokenInput.trim()); setTokenMsg(null); tokenProbed = false; location.reload() } }, '保存令牌并重试'),
      ),
    ),
    h('div', { style: { flex: 1, minHeight: 0, overflow: 'auto', paddingBottom: 16 } },
      tab === 'devices' ? h(DeviceManager, null)
        : tab === 'terminal' ? h(TerminalTab, null)
        : tab === 'logs' ? h(LogTab, null)
        : h(PolicyManager, null),
    ),
  )
}

// ---- registrations --------------------------------------------------------

const IconComponent = () => h('svg', { viewBox: '0 0 24 24', width: 18, height: 18, 'aria-hidden': true, style: { display: 'block' } },
  h('path', { fill: 'currentColor', d: 'M4 5h16v3H4zM4 10h16v3H4zM4 15h16v4H4z', opacity: 0.9 }),
  h('circle', { cx: 17.5, cy: 6.5, r: 1, fill: 'currentColor' }),
)

export const name = 'dsh-hillstone-cli-ops-client'
export const inject = ['slots', 'sidebarRightTabs', 'sidebarRight', 'uiWorkspace']

const TAB_KIND = PANEL_ID // 'dsh-hillstone-cli-ops'

export function apply(ctx: any): void {
  try {
    // Right sidebar tab — mirrors dsh-ssh-ops.
    const unwatch = ctx.inject(
      ['sidebarRightTabs', 'sidebarRight'],
      (sidebarCtx: any) => {
        try {
          ctx.sidebarRightTabs.register({
            id: TAB_KIND,
            kind: TAB_KIND,
            priority: 'extension',
            title: () => '设备运维',
            guide: [
              {
                order: 20,
                title: () => '设备运维',
                description: () =>
                  '管理 Hillstone / StoneOS 设备，打开 SSH 终端、查看连接审计日志，并用「执行策略」限定 agent 在你设定的时间窗口内不得执行你指定的命令；连接成功后自动切到终端页，可直接看实时输出。',
                icon: IconComponent,
              },
            ],
          })
          ctx.slots.inject('sidebar.right.pane.tab', () =>
            ctx.slots.register(
              {
                name: 'sidebar.right.pane.tab',
                key: TAB_KIND,
                // m04040: the right-sidebar tab slot is scoped to one Session and
                // hands its body the owning sessionId, which is the only place
                // the panel can learn which conversation it belongs to. Remember
                // it so requestConnect can name the origin.
                inject: (sessionId: string) => {
                  panelSessionId = typeof sessionId === 'string' ? sessionId : null
                  return { api: ctx }
                },
              },
              OpsPage,
            ),
          )
        } catch (error) {
          console.error('[dsh-hillstone-cli-ops] right tab registration failed:', error)
        }
        // Publish the opener for the host-side connect bridge below, which can
        // only be built once sidebarRight has actually been injected.
        revealSidebar = (originSessionId?: string) => {
          const openHere = (): void => {
            const sr = ctx.sidebarRight
            sr.openTab(TAB_KIND)
            // Re-opening a tab that already exists only focuses it, so a
            // deliberately collapsed column would stay collapsed.
            if (!sr.isExpanded()) sr.toggleExpanded()
          }
          try {
            const sr = ctx.sidebarRight
            // Preferred path: the controller can open a tab in ANY session, which
            // puts the panel in the caller's conversation without pulling the
            // user away from the one they are reading. It silently does nothing
            // for a session the rightbar has never adopted, so verify afterwards
            // rather than assume (m04040).
            if (originSessionId && typeof sr.openTabIn === 'function') {
              sr.openTabIn(originSessionId, TAB_KIND)
              if ((sr.tabsIn?.(originSessionId) ?? []).some((t: any) => t.kind === TAB_KIND)) return
              // Never adopted — the caller's conversation has no sidebar store
              // yet, so the tab cannot be placed there directly. Fall through
              // and bring that conversation on screen instead.
              console.info('[dsh-hillstone-cli-ops] origin session has no sidebar yet; opening it')
            }
            const mounted = sr.mounted?.getSnapshot?.()
            if (originSessionId && originSessionId !== mounted && typeof ctx.uiWorkspace?.openSession === 'function') {
              ctx.uiWorkspace.openSession(originSessionId)
              // openSession replaces the main reference, but the sidebar follows
              // the seat's own "on screen" signal, which is published by a
              // subscription and therefore lands a microtask later. Opening the
              // tab in the same tick would still aim at the session the user is
              // leaving — the exact bug this is meant to fix.
              const mountedNow = sr.mounted?.getSnapshot?.()
              if (originSessionId !== mountedNow) {
                setTimeout(() => {
                  try {
                    openHere()
                  } catch (error) {
                    console.warn('[dsh-hillstone-cli-ops] openTab after session switch failed:', error)
                  }
                }, 0)
                return
              }
            }
            openHere()
          } catch (error) {
            console.warn('[dsh-hillstone-cli-ops] openTab failed:', error)
          }
        }
        return () => {
          if (revealSidebar) revealSidebar = null
          panelSessionId = null
          // The watch is idempotent, so a re-registration must not leave the
          // old 4s interval running next to the new one.
          connectWatch?.()
          connectWatch = null
        }
      },
    )
    // Keep a stable disposer reference available for future unload handling.
    void unwatch
    startConnectWatch()
  } catch (error) {
    console.error('[dsh-hillstone-cli-ops] client failed to load:', error)
  }
}
