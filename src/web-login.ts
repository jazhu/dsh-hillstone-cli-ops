// dsh-hillstone-cli-ops — WebUI login bridge (m05288).
//
// One Playwright browser per device, driven *headfully*, and then left alone:
// automation gets the operator past the login form and the human takes the
// window from there. The window is the deliverable, not a side effect.
//
// Two rules shape everything below.
//
//   1. The device password never leaves the host. It arrives as a plain
//      argument, is typed straight into the page, and is never returned to the
//      browser half, logged, or kept in a module field. The only thing that
//      survives a login is the device's own session cookie, inside a
//      per-device browser profile on disk.
//
//   2. Never retry a failed login. Hillstone StoneOS answers a wrong password
//      with `{"success":false,"exception":{"code":"loginError_1004",…}}` and
//      then *demands a graphical captcha* (`GET /rest/captcha`) before any
//      further attempt can succeed — a second automated attempt would fail even
//      with the right password. So one attempt ends the automation and the
//      window is handed to the operator with the error on screen.
//
// The persistent profile is what makes the second press cheap: the session
// cookie survives in that directory, so the login form is not even rendered and
// pressing the button twice does not accumulate captchas.

import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { BrowserContext, Page } from 'playwright'
import type { Device, WebLoginState } from './types.ts'

/** Devices whose management UI is left unconfigured listen on 443. */
const DEFAULT_WEB_PORT = 443

/** Page load budget for the device's management UI. */
const NAVIGATE_MS = 45_000
/** How long to let the SPA finish its own XHRs before we look at the DOM. */
const NETWORK_IDLE_MS = 20_000
/**
 * How long to wait for the login form to appear. A session that is already
 * signed in never renders one, so exhausting this budget is the normal case
 * on a repeat press, not a failure.
 */
const FORM_WAIT_MS = 15_000
/** How long to wait for the device to answer the login POST. */
const LOGIN_RESPONSE_MS = 25_000

/** Subdirectory of the plugin data dir holding the per-device browser profiles. */
const PROFILE_DIR = 'webui'

interface LiveWindow {
  context: BrowserContext
  page: Page
  url: string
  openedAt: string
}

/** deviceId → the window this host half opened. Authoritative for "is it open". */
const windows = new Map<string, LiveWindow>()
/** deviceId → the last outcome, for the UI. Kept across window closes so a
 *  failed login still explains itself after the operator shuts the window. */
const states = new Map<string, WebLoginState>()

/**
 * Management UI URL for a device.
 *
 * The port comes from the device row and falls back to 443, which is what both
 * Hillstone firewalls actually serve on — the row's `webPort` is optional and
 * both managed devices leave it empty.
 */
export function webLoginUrl(device: Pick<Device, 'ip' | 'webPort'>): string {
  // Bracket a literal IPv6 address; `https://::1:443/` is not a URL.
  const host = device.ip.includes(':') ? `[${device.ip}]` : device.ip
  const port =
    typeof device.webPort === 'number' && Number.isInteger(device.webPort)
      ? device.webPort
      : DEFAULT_WEB_PORT
  return `https://${host}:${port}/`
}

function record(
  deviceId: string,
  url: string,
  status: WebLoginState['status'],
  message?: string,
): WebLoginState {
  const state: WebLoginState = { deviceId, url, status, at: new Date().toISOString() }
  if (message) state.message = message
  states.set(deviceId, state)
  return state
}

function fail(deviceId: string, url: string, message: string): WebLoginState {
  return record(deviceId, url, 'error', message)
}

/**
 * Let the SPA settle before the DOM is read.
 *
 * The management UI is a React app: `domcontentloaded` says nothing about
 * whether the login form exists yet. Both waits are bounded and both ignore
 * their timeout, because either outcome is legitimate — a form appears, or it
 * does not because the session is already valid.
 */
async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_MS }).catch(() => {})
  await page
    .locator('#username')
    .waitFor({ state: 'attached', timeout: FORM_WAIT_MS })
    .catch(() => {})
}

/** The login form is present exactly when `#username` is. */
async function hasLoginForm(page: Page): Promise<boolean> {
  return (await page.locator('#username').count()) > 0
}

/**
 * Press the login button.
 *
 * Its label is 登 录 — two characters with a space between them — and it is a
 * real `<button>`. A regex on the trimmed text is what survives a build tool
 * that rewrites string literals, and it refuses to match a button that merely
 * *contains* the characters (like a 退出登录 menu item on a logged-in page).
 */
async function clickLogin(page: Page): Promise<void> {
  const button = page.locator('button').filter({ hasText: /^\s*登\s*录\s*$/ }).first()
  if ((await button.count()) === 0) {
    throw new Error('页面上找不到「登 录」按钮：登录表单的结构可能变了，窗口已留给你手动登录。')
  }
  await button.click({ timeout: 10_000 })
}

async function openWindow(device: Device, storeDir: string): Promise<LiveWindow> {
  // A dynamic import, not a static one: esbuild keeps this external, and a
  // missing or broken playwright becomes a catchable error on one button press
  // instead of a load-time failure of the whole host plugin. Nothing else in
  // this plugin needs a browser.
  const { chromium } = await import('playwright')
  const userDataDir = join(storeDir, PROFILE_DIR, device.id)
  mkdirSync(userDataDir, { recursive: true })
  const url = webLoginUrl(device)
  let context: BrowserContext
  try {
    context = await chromium.launchPersistentContext(userDataDir, {
      // Headful on purpose: the whole point is a window the operator keeps.
      headless: false,
      // The management UI serves HTTPS with a self-signed certificate.
      // Without this Chromium refuses the page outright, and the feature looks
      // like a broken network instead of the working login it is.
      ignoreHTTPSErrors: true,
      viewport: { width: 1440, height: 900 },
    })
  } catch (e) {
    const raw = (e as Error).message || String(e)
    // The likeliest cause on a fresh machine is a browser that was never
    // downloaded, whose default error is a wall of absolute paths. Name the fix.
    const hint = /Executable doesn't exist|playwright install/i.test(raw)
      ? '（缺少浏览器内核：请在插件目录执行 npx playwright install chromium）'
      : ''
    throw new Error(`无法启动浏览器：${raw.split('\n')[0]}${hint}`)
  }
  const page = context.pages()[0] ?? (await context.newPage())
  return { context, page, url, openedAt: new Date().toISOString() }
}

/**
 * Open (or refocus) a device's management UI and log in with the stored
 * credentials. The returned state is what the button reports; the window, if
 * any, is left running for the operator.
 */
export async function webLogin(
  device: Device,
  password: string,
  storeDir: string,
): Promise<WebLoginState> {
  const url = webLoginUrl(device)
  let win = windows.get(device.id)
  if (!win) {
    win = await openWindow(device, storeDir)
    windows.set(device.id, win)
    // The operator closes windows. When one goes, stop advertising it, or the
    // button would offer to close a window that no longer exists.
    win.context.on('close', () => {
      if (windows.get(device.id) === win) {
        windows.delete(device.id)
        states.delete(device.id)
      }
    })
  }
  const { page } = win
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAVIGATE_MS })
  } catch (e) {
    return fail(device.id, url, `打不开设备管理页：${(e as Error).message}`)
  }
  await settle(page)
  if (!(await hasLoginForm(page))) {
    // No form: the persistent profile carried a live session over, so there is
    // nothing to type. This is the repeat-press path, not an error.
    return record(device.id, url, 'ready', '已登录：复用了上次的登录会话')
  }
  return submitLogin(device, url, page, password)
}

/**
 * One attempt, then the window is the operator's.
 *
 * The verdict comes from the device's own answer to `POST /rest/login` rather
 * than from scraping the page: on success it carries the session token and
 * `success: true`; on failure it carries `success: false` and the reason, and
 * the captcha that follows is the device's answer to being failed at.
 */
async function submitLogin(
  device: Device,
  url: string,
  page: Page,
  password: string,
): Promise<WebLoginState> {
  try {
    await page.fill('#username', device.account)
    await page.fill('#password', password)
  } catch (e) {
    return fail(device.id, url, `填写登录表单失败：${(e as Error).message}`)
  }
  // Armed immediately before the click: nothing earlier can trigger the POST,
  // and a short-lived waiter cannot outlive the press by much.
  const answered = page
    .waitForResponse((r) => /\/rest\/login/.test(r.url()), { timeout: LOGIN_RESPONSE_MS })
    .catch(() => null)
  try {
    await clickLogin(page)
  } catch (e) {
    return fail(device.id, url, (e as Error).message)
  }
  const response = await answered
  if (response) {
    let body: any = null
    try {
      body = JSON.parse(await response.text())
    } catch {
      body = null
    }
    if (body && body.success === true) {
      return record(device.id, url, 'ready', '登录成功，浏览器窗口已打开')
    }
    const reason =
      typeof body?.exception?.message === 'string' ? body.exception.message : '设备拒绝了登录'
    return record(
      device.id,
      url,
      'captcha',
      `${reason} 设备已要求输入图形验证码，请在打开的窗口里手动完成。`,
    )
  }
  // No answer in time. Ask the page instead: the form disappearing is the
  // device's own way of saying it accepted the credentials.
  await page
    .locator('#username')
    .waitFor({ state: 'detached', timeout: 5_000 })
    .catch(() => {})
  if (!(await hasLoginForm(page))) {
    return record(device.id, url, 'ready', '登录成功，浏览器窗口已打开')
  }
  return fail(device.id, url, '登录没有回应：设备既没有确认登录也没有返回错误，窗口停在登录页。')
}

/** Close a device's window. False when there was nothing open. */
export async function webLoginClose(deviceId: string): Promise<boolean> {
  const win = windows.get(deviceId)
  if (!win) return false
  // Dropped before closing so the context's own close event cannot race us.
  windows.delete(deviceId)
  states.delete(deviceId)
  try {
    await win.context.close()
  } catch {
    /* already gone */
  }
  return true
}

/** Every known state, for GET /web-login. */
export function webLoginStates(): WebLoginState[] {
  return [...states.values()]
}

/** Close everything. Called when the plugin is torn down. */
export async function webLoginForgetAll(): Promise<void> {
  const all = [...windows.values()]
  windows.clear()
  states.clear()
  for (const win of all) {
    try {
      await win.context.close()
    } catch {
      /* ignore */
    }
  }
}
