// menuCombiner.js
// Pure helpers for the phone menu page. No React or Firebase imports —
// everything here is unit-testable in isolation.

/**
 * Parse the phone-page URL params.
 * @param {string} search - window.location.search
 * @returns {{ restaurantId: string|null, layout: string }}
 */
export function parsePhoneParams(search) {
  const params = new URLSearchParams(search)
  const layout = params.get('layout')
  const rawMenuIds = params.get('m') || ''
  const menuIds = rawMenuIds
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return {
    restaurantId: params.get('r') || null,
    layout: layout && layout.trim() ? layout : 'classic',
    menuIds,
  }
}

/**
 * Keep only menus that actually have items. No truncation — the phone page
 * shows everything, preserving menu order.
 * @param {Array<object>|null|undefined} menus - raw menu docs
 * @returns {Array<object>}
 */
export function combineMenus(menus) {
  return (menus || []).filter((menu) =>
    (menu.categories || []).some((c) => (c.items || []).length > 0)
  )
}

/**
 * Truncate a millisecond timestamp to the start of its UTC day.
 * Mirrors `toDayStart` in subscriptionGuard.js — the phone page must
 * evaluate the SAME expiry day as the TV app, so a subscription that is
 * blocked on TV is also blocked on the phone (and vice versa).
 * @param {number} ms - epoch milliseconds
 * @returns {number}
 */
export function toDayStart(ms) {
  const d = new Date(ms)
  d.setUTCHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Soft subscription gate: true when the display config says expired.
 * Fails closed when config is null or expiresAt is missing (matches the
 * TV app's fail-closed behavior). Compares at UTC day granularity via
 * toDayStart — same semantics as the TV's checkAccess(), so both surfaces
 * agree on the same expiresAt value for the whole day.
 * @param {object|null} config - snapshot of config/display
 * @returns {boolean}
 */
export function isSubscriptionExpired(config) {
  if (!config || config.expiresAt == null) return true
  let ms = config.expiresAt
  if (typeof ms === 'object' && typeof ms.toMillis === 'function') ms = ms.toMillis()
  else ms = Number(ms)
  if (!Number.isFinite(ms)) return true
  return toDayStart(Date.now()) >= toDayStart(ms)
}
