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
 *                     复制 all run in one centred dialog (DeviceDialog): the
 *                     right rail is too narrow to show a form and the list at
 *                     once, and a copy lands in the same dialog so the duplicate
 *                     can be renamed and saved in a single step. A copy
 *                     duplicates the encrypted password server-side, so it never
 *                     reaches the browser.
 *   Tab 2 终端       — one terminal tab per live connection; input is POSTed to
 *                     the host, device output streams back via SSE.
 *   Tab 3 日志       — the per-connection audit trail: who connected to which
 *                     device, and what was typed or run while they were there.
 *
 * The two tabs are mutually exclusive, so 「连接设备」 (on 设备管理) cannot hand
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
import type { DeviceDTO, ConnectionInfo, DeviceType, DeviceLiveness, LogEntry, SessionLog, SessionLogDetail } from './types.ts'
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
// 「连接设备」 is clicked on the 设备管理 tab, but the connection UI lives on the
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
    const j = (await api<{ connection: ConnectionInfo }>('/connect', { method: 'POST', body: { deviceId } })) as any
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
let revealSidebar: (() => void) | null = null
let connectWatch: (() => void) | null = null

function onRevealTerminal(fn: () => void): () => void {
  revealListeners.add(fn)
  return () => { revealListeners.delete(fn) }
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
          for (const fn of [...revealListeners]) fn()
          revealSidebar()
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
.ops-seg { display: inline-flex; align-items: center; gap: 2px; padding: 2px; border-radius: var(--dsw-radius-md, 12px); background: var(--dsw-alias-bg-layer-2, #1e1f23); border: 1px solid var(--dsw-alias-border-l2, #2a2a36); }
.ops-seg button { border: none; background: transparent; color: var(--dsw-alias-label-tertiary, #9a9aa6); padding: 4px 14px; border-radius: var(--dsw-radius-sm, 8px); cursor: pointer; font-family: inherit; font-size: 13px; line-height: 20px; white-space: nowrap; transition: background var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-seg button:hover { color: var(--dsw-alias-label-primary, #e7e7ea); }
.ops-seg button.on { background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 18%, transparent); color: var(--dsw-alias-label-primary, #e7e7ea); font-weight: 500; }

/* Buttons */
.ops-btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; background: transparent; border: 1px solid var(--dsw-alias-border-l2, #3a414b); color: var(--dsw-alias-label-secondary, #cfd3d6); border-radius: var(--dsw-radius-sm, 8px); cursor: pointer; font-family: inherit; font-size: 13px; line-height: 20px; padding: 4px 12px; white-space: nowrap; transition: background var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), border-color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, #ffffff14); color: var(--dsw-alias-label-primary, #f9fafb); border-color: var(--dsw-alias-border-l4, #4a4d55); }
.ops-btn:disabled { opacity: .45; cursor: default; }
.ops-btn.sm { padding: 2px 10px; font-size: 12px; }
.ops-btn.primary { color: var(--dsw-alias-state-business-primary, #4176e6); border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 40%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 10%, transparent); }
.ops-btn.primary:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 20%, transparent); color: var(--dsw-alias-state-business-primary, #4176e6); }
.ops-btn.danger { color: var(--dsw-alias-state-error-primary, #f85149); border-color: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 32%, transparent); }
.ops-btn.danger:hover:not(:disabled) { background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 12%, transparent); color: var(--dsw-alias-state-error-primary, #f85149); }
.ops-btn.plain { border-color: transparent; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-btn.plain:hover:not(:disabled) { border-color: transparent; background: var(--dsw-alias-interactive-bg-hover, #ffffff14); color: var(--dsw-alias-label-primary, #f9fafb); }
.ops-btn.on { color: var(--dsw-alias-state-business-primary, #4176e6); border-color: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 40%, transparent); background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #4176e6) 12%, transparent); }

/* Form */
.ops-field { display: block; margin-bottom: 12px; }
.ops-label { display: block; margin-bottom: 5px; font-size: 12.5px; line-height: 18px; color: var(--dsw-alias-label-secondary, #cfd3d6); }
.ops-label i { font-style: normal; color: var(--dsw-alias-label-caption, #81858c); font-size: 11.5px; margin-left: 4px; }
.ops-input { box-sizing: border-box; width: 100%; padding: 5px 10px; border-radius: var(--dsw-radius-sm, 8px); border: 1px solid var(--dsw-alias-border-l2, #3a414b); background: var(--dsw-alias-bg-layer-2, #232324); color: var(--dsw-alias-label-primary, #f9fafb); font-family: inherit; font-size: 13px; line-height: 20px; outline: none; transition: border-color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease), background var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-input::placeholder { color: var(--dsw-alias-label-caption, #81858c); }
.ops-input:hover { border-color: var(--dsw-alias-border-l4, #4a4d55); }
.ops-input:focus { border-color: var(--dsw-alias-state-business-primary, #4176e6); background: var(--dsw-alias-bg-layer-1, #1e1f23); }
.ops-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 12px; }

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

/* Liveness badge. Distinct from the connection StatusBadge: this one is a TCP
   reachability verdict from a port scan, which says nothing about whether SSH
   will actually accept the account. */
.ops-badge.online { color: var(--dsw-alias-state-success-primary, #22c55e); background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 14%, transparent); }
.ops-badge.offline { color: var(--dsw-alias-state-error-primary, #f85149); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #f85149) 14%, transparent); }
.ops-badge.probing { color: var(--dsw-alias-label-tertiary, #9a9aa6); background: color-mix(in srgb, var(--dsw-alias-label-tertiary, #9a9aa6) 14%, transparent); }

/* Device cards — a table forced a 6-column squeeze into a narrow right rail;
   stacked cards keep the identity readable and the actions thumb-reachable. */
.ops-list { display: flex; flex-direction: column; gap: 10px; }
.ops-dev { border: 1px solid var(--dsw-alias-border-l2, #2a2a36); border-radius: var(--dsw-radius-md, 12px); background: var(--dsw-alias-bg-layer-2, #1e1f23); padding: 12px 14px 10px; transition: border-color var(--ds-transition-duration-fast, .1s) var(--ds-ease-in-out, ease); }
.ops-dev:hover { border-color: var(--dsw-alias-border-l4, #4a4d55); }
.ops-dev-top { display: flex; align-items: center; gap: 8px; }
.ops-dev-name { font-size: 14px; line-height: 22px; font-weight: 500; color: var(--dsw-alias-label-primary, #f9fafb); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-dev-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 6px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #9a9aa6); }
.ops-dev-meta code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; color: var(--dsw-alias-label-secondary, #cfd3d6); background: var(--dsw-alias-bg-layer-3, #2c2c2e); border-radius: var(--dsw-radius-xs, 4px); padding: 0 5px; }
.ops-dev-note { margin-top: 6px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-caption, #81858c); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-dev-acts { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding-top: 10px; margin-top: 10px; border-top: .5px solid var(--dsw-alias-border-l2, #2a2a36); }
.ops-dev-tags { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 7px; }
/* A native <select> keeps the OS popup, so appearance:auto stays — but then the
   UA paints its own background, which is WHITE in dark mode. Text colour comes
   from the theme (near-white), so every CJK label vanished white-on-white.
   Pin the fill to the themed layer colour and keep the theme's border. */
.ops-select { appearance: auto; cursor: pointer; background-color: var(--dsw-alias-bg-layer-2, #2c2c2e); color: var(--dsw-alias-label-primary, #f9fafb); }
.ops-select option { background-color: var(--dsw-alias-bg-layer-2, #2c2c2e); color: var(--dsw-alias-label-primary, #f9fafb); }

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

function LivenessBadge({ liveness, port }: { liveness: DeviceLiveness; port: number }): ReactElement {
  const cls = liveness.state === 'online' ? 'online' : liveness.state === 'offline' ? 'offline' : 'probing'
  const detail = liveness.state === 'online' && liveness.ms !== undefined
    ? `${LIVENESS_TEXT[cls]}（${liveness.ms}ms）`
    : LIVENESS_TEXT[cls]
  return h('span', {
    className: 'ops-badge ' + cls,
    // The error is the actionable part of a failed probe (refused vs timeout vs
    // unreachable), so it goes in the tooltip rather than being flattened away.
    title: [LIVENESS_TITLE[cls], `SSH ${liveness.ip}:${port ?? liveness.port}`, liveness.error].filter(Boolean).join('\n'),
  },
    h('b', null),
    detail,
  )
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
 *  sends it back, and an empty field means "keep the stored one". */
function formFrom(d: DeviceDTO): DeviceForm {
  return {
    name: d.name,
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
 * 新增 / 编辑 device dialog.
 *
 * The form used to be an inline card in the device list, but the right rail is
 * only a few hundred px wide: eight fields in two columns plus a footer left no
 * room to see the list being edited. A centred dialog also gives the 复制 flow
 * somewhere to land — a duplicate opens straight into this dialog with the copy
 * pre-selected, so renaming and saving is one step.
 */
function DeviceDialog({ editing, form, setForm, busy, notice, error, onSave, onClose }: {
  editing: Partial<DeviceDTO>
  form: DeviceForm
  setForm: (f: DeviceForm) => void
  busy: boolean
  /** Info shown inside the dialog (e.g. a fresh copy is ready to rename). */
  notice: string | null
  /** Validation / save failure. Lives in the dialog: a banner behind the scrim
   *  is invisible, which is exactly where a rejected save would be reported. */
  error: string | null
  onSave: () => void
  onClose: () => void
}): ReactElement {
  const isNew = !editing.id || editing.id === '__new__'
  const set = (patch: Partial<DeviceForm>) => setForm({ ...form, ...patch })
  return h(OpsModal, {
    title: isNew ? '新增设备' : `编辑设备 · ${editing.name ?? ''}`,
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
        Field({ label: '密码', hint: isNew ? '必填' : '留空表示不修改', type: 'password', value: form.password, onChange: (e: any) => set({ password: e.target.value }) }),
        Field({ label: 'SSH 端口', value: form.port, placeholder: '22', onChange: (e: any) => set({ port: e.target.value }) }),
        Field({ label: 'Web 端口', hint: '管理页面', value: form.webPort, placeholder: '443', onChange: (e: any) => set({ webPort: e.target.value }) }),
        Field({ label: '备注', value: form.note, placeholder: '可选', onChange: (e: any) => set({ note: e.target.value }) }),
      ),
    ),
  })
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
  // Search + paging state (m03664). Kept in DeviceManager rather than the host
  // because the whole device list already arrives in one response; paging is a
  // view concern, and pushing it server-side would need it to reset whenever the
  // list is refreshed underneath the user.
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  // Liveness verdicts from the manual TCP scan, keyed by device id. Not device
  // state: a device that was renamed or deleted must not keep a stale verdict,
  // so this map is pruned against the current list on every render of the list.
  const [liveness, setLiveness] = useState<Record<string, DeviceLiveness>>({})
  const [probing, setProbing] = useState(false)

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

  useEffect(() => {
    refresh()
  }, [refresh])

  const openCreate = () => {
    setEditing({ id: '__new__' })
    setForm({ ...EMPTY_FORM })
    setFormNotice(null)
    setFormError(null)
  }
  const openEdit = (d: DeviceDTO) => {
    setEditing(d)
    setForm(formFrom(d))
    setFormNotice(null)
    setFormError(null)
  }
  const closeForm = () => setEditing(null)

  const save = async () => {
    const isNew = !editing?.id || editing.id === '__new__'
    if (!form.name || !form.ip || !form.account || (isNew && !form.password)) {
      setFormError('名称 / IP / 账号 / 密码（新建时必填）不能为空')
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
      if (isNew) {
        await api('/devices', { method: 'POST', body: { ...payload, password: form.password } })
      } else {
        await api(`/devices/${editing!.id}`, { method: 'PUT', body: { ...payload, password: form.password || undefined } })
      }
      setMsg({ kind: 'ok', text: '已保存' })
      closeForm()
      refresh()
    } catch (e) {
      setFormError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  /**
   * Duplicate a device, then open the copy in the edit dialog.
   *
   * The host copies the encrypted password, so this is a genuine backup of the
   * credentials and not just a form clone — the copy is connectable right away
   * and the password never reaches the browser. 复制 sits on the card (m02395)
   * because duplicating is a device-list operation; the dialog is where the
   * result lands, since a duplicate almost always needs a different name (a
   * second firewall of the same kind, a lab box) and hunting for a new card to
   * rename it afterwards is the tedious part.
   */
  const duplicate = async (source: DeviceDTO) => {
    setBusy(true)
    setFormNotice(`正在复制 ${source.name}…`)
    setFormError(null)
    try {
      const j = (await api(`/devices/${source.id}/copy`, { method: 'POST', body: {} })) as any
      const copy: DeviceDTO | undefined = j?.device
      if (!copy?.id || copy.id === source.id) {
        // Without a distinct id, opening the dialog would make the next save PUT
        // over the original device. Just report the copy and move on.
        setFormNotice(null)
        setMsg({ kind: 'ok', text: `已复制为「${source.name}-副本」（含密码，可直接连接）` })
        refresh()
        return
      }
      setEditing(copy)
      setForm(formFrom(copy))
      setFormNotice(`已复制为「${copy.name}」（含密码）——可直接改名后保存`)
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
    setLiveness((prev) => {
      const next = { ...prev }
      for (const d of devices) next[d.id] = { deviceId: d.id, ip: d.ip, port: d.port, state: 'probing' }
      return next
    })
    try {
      const j = (await api<{ results: DeviceLiveness[] }>('/devices/ping', { method: 'POST', body: {} })) as any
      const results = (j.results || []) as DeviceLiveness[]
      setLiveness((prev) => {
        const next = { ...prev }
        for (const r of results) next[r.deviceId] = r
        return next
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
                return h('div', { key: d.id, className: 'ops-dev' },
                  h('div', { className: 'ops-dev-top' },
                    h('span', { className: 'ops-dev-name', title: d.name }, d.name),
                    live ? h(LivenessBadge, { liveness: live, port: d.port }) : null,
                    connectingId === d.id ? h(StatusBadge, { status: 'connecting' }) : null,
                  ),
                  h('div', { className: 'ops-dev-tags' },
                    h('span', { className: 'ops-badge type', title: '设备类型' }, DEVICE_TYPE_LABELS[d.deviceType ?? 'other']),
                  ),
                  h('div', { className: 'ops-dev-meta' },
                    h('code', null, d.ip),
                    h('span', null, '·'),
                    h('span', null, d.account),
                    h('span', null, '·'),
                    h('span', null, `SSH ${d.port}`),
                    d.webPort ? h(Fragment, null, h('span', null, '·'), h('span', null, `Web ${d.webPort}`)) : null,
                  ),
                  d.note ? h('div', { className: 'ops-dev-note', title: d.note }, d.note) : null,
                  h('div', { className: 'ops-dev-acts' },
                    h('button', { className: 'ops-btn primary sm', onClick: () => connectDevice(d), disabled: connectingId === d.id }, connectingId === d.id ? '连接中…' : '连接设备'),
                    h('button', { className: 'ops-btn sm', onClick: () => openEdit(d) }, '编辑'),
                    h('button', {
                      className: 'ops-btn sm',
                      onClick: () => void duplicate(d),
                      disabled: busy,
                      title: '复制该设备（含已保存的密码），并打开编辑页改名保存',
                    }, busy ? '复制中…' : '复制'),
                    h('button', { className: 'ops-btn sm plain danger', onClick: () => setRemoving(d) }, '删除'),
                  ),
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
            '在「设备管理」中点击「连接设备」，即可在这里打开该设备的 SSH 终端。',
          )
        : null,
    h('div', { style: { flex: 1, minHeight: 320 } }, active ? h(TerminalPane, { key: active.connId, conn: active }) : null),
  )
}

// ---- page shell -----------------------------------------------------------

function OpsPage(): ReactElement {
  const [tab, setTab] = useState<'devices' | 'terminal' | 'logs'>('devices')
  const [tokenMsg, setTokenMsg] = useState<string | null>(null)
  const [tokenInput, setTokenInput] = useState('')
  useEffect(() => {
    setTokenNotice((reason) => setTokenMsg(reason))
    return () => setTokenNotice(null)
  }, [])
  // A 连接设备 click on the 设备管理 tab must land the user on 终端. TerminalTab
  // is unmounted while we are here, so the bridge notifies this shell instead.
  useEffect(() => onPendingConnect(() => setTab('terminal')), [])
  // A session opened by the agent (hillstone_open_terminal / run_and_analyze)
  // has to land the user on the terminal page too, otherwise the connect is
  // invisible until they open the panel by hand.
  useEffect(() => onRevealTerminal(() => setTab('terminal')), [])
  injectStyles()
  const TABS = { devices: '设备管理', terminal: '终端', logs: '日志' } as const
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
      tab === 'devices' ? h(DeviceManager, null) : tab === 'terminal' ? h(TerminalTab, null) : h(LogTab, null),
    ),
  )
}

// ---- registrations --------------------------------------------------------

const IconComponent = () => h('svg', { viewBox: '0 0 24 24', width: 18, height: 18, 'aria-hidden': true, style: { display: 'block' } },
  h('path', { fill: 'currentColor', d: 'M4 5h16v3H4zM4 10h16v3H4zM4 15h16v4H4z', opacity: 0.9 }),
  h('circle', { cx: 17.5, cy: 6.5, r: 1, fill: 'currentColor' }),
)

export const name = 'dsh-hillstone-cli-ops-client'
export const inject = ['slots', 'sidebarRightTabs', 'sidebarRight']

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
                description: () => 'Hillstone 设备管理与 SSH 终端',
                icon: IconComponent,
              },
            ],
          })
          ctx.slots.inject('sidebar.right.pane.tab', () =>
            ctx.slots.register(
              {
                name: 'sidebar.right.pane.tab',
                key: TAB_KIND,
                inject: () => ({ api: ctx }),
              },
              OpsPage,
            ),
          )
        } catch (error) {
          console.error('[dsh-hillstone-cli-ops] right tab registration failed:', error)
        }
        // Publish the opener for the host-side connect bridge below, which can
        // only be built once sidebarRight has actually been injected.
        revealSidebar = () => {
          try {
            ctx.sidebarRight.openTab(TAB_KIND)
          } catch (error) {
            console.warn('[dsh-hillstone-cli-ops] openTab failed:', error)
          }
        }
        return () => {
          if (revealSidebar) revealSidebar = null
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
