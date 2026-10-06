/* Mount the panel the way the host's sidebar slot does.
 *
 * The client bundle exports apply(ctx) and little else: OpsPage is deliberately
 * NOT exported, it reaches the screen only through
 *   ctx.slots.inject('sidebar.right.pane.tab', () =>
 *     ctx.slots.register({ name, key, inject(sessionId) }, OpsPage))
 * so the two-slot stand-in below is not a shortcut around the product, it is the
 * product's own door. Anything the panel needs beyond these slots is left
 * undefined on purpose: if the plugin ever grows a new dependency, this harness
 * fails loudly instead of quietly photographing a degraded panel. */
(function () {
  const raw = window.__clientExports
  const fail = (msg) => {
    const box = document.getElementById('bootError')
    box.hidden = false
    box.textContent = 'BOOT FAILED: ' + msg
    window.__bootErrors.push('mount fail: ' + msg)
  }
  window.__stage = 'mount:start'
  if (!raw || typeof raw.apply !== 'function') {
    fail('client exports: ' + Object.keys(raw || {}).join(', '))
    return
  }
  const registeredTabs = []
  const slots = {
    inject(slot, register) {
      const entry = register()
      registeredTabs.push({ slot, entry })
    },
    register(meta, Component) {
      return { ...meta, component: Component }
    },
  }
  const noop = () => {}
  const ctx = {
    slots,
    sidebarRightTabs: {
      register: (t) => {
        window.__tabMeta = t
        return noop
      },
    },
    sidebarRight: {
      openTab: noop,
      isExpanded: () => true,
      toggleExpanded: noop,
      openTabIn: noop,
      tabsIn: () => [],
    },
    uiWorkspace: { openSession: noop },
    inject(deps, cb) {
      if (Array.isArray(deps) && deps.includes('sidebarRightTabs')) {
        cb({ sidebarRightTabs: ctx.sidebarRightTabs, sidebarRight: ctx.sidebarRight })
      }
    },
  }
  try {
    raw.apply(ctx)
  } catch (e) {
    fail(String((e && e.stack) || e))
    return
  }
  const hit = registeredTabs.find(
    (t) => t.slot === 'sidebar.right.pane.tab' && t.entry && t.entry.key === 'dsh-hillstone-cli-ops',
  )
  if (!hit || typeof hit.entry.component !== 'function') {
    fail('registered tabs: ' + JSON.stringify(registeredTabs.map((t) => ({ slot: t.slot, key: t.entry && t.entry.key }))))
    return
  }
  // The slot's inject(sessionId) is how the body learns which conversation it
  // belongs to (m04040); OpsPage falls back to the module-level panelSessionId.
  hit.entry.inject('sess-shots-0001')
  window.__root = ReactDOM.createRoot(document.getElementById('mount'))
  window.__root.render(React.createElement(hit.entry.component, { sessionId: 'sess-shots-0001' }))
  window.__mounted = true
  window.__stage = 'mount:done'
})()
