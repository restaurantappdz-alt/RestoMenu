# Subscription Guard — TV Display Design

**Date:** 2026-07-29
**Project:** RestoMenuWeb
**Status:** Approved for implementation (updated 2026-07-29 — RTDB timestamp replaces Cloud Function heartbeat)

---

## Overview

Add subscription-expiration enforcement to the TV display app. The TV must stop displaying the menu and show a plain black screen once the current time passes a stored expiration timestamp — even when fully offline. The system must resist clock-tampering (rollback) and fail closed on uncertainty.

A server-anchored clock offset is obtained via **Firebase Realtime Database's built-in `ServerValue.TIMESTAMP`** — no Cloud Functions, no scheduled tasks, zero backend code. The TV writes the timestamp placeholder to the RTDB and immediately reads back the server-resolved value.

---

## Data Model

### Firestore (existing)

**Document:** `restaurants/{restaurantId}/config/display`

| Field | Type | Set by | Purpose |
|---|---|---|---|
| `expiresAt` | Timestamp | Admin dashboard / manual Firestore write | Absolute expiration bound |

No `heartbeatAt` field — replaced by RTDB server timestamp read.

### Realtime Database (new)

**Path:** `serverTimeCheck/{restaurantId}`

| Field | Type | Set by | Purpose |
|---|---|---|---|
| `time` | number (ms epoch) | TV client writes `.sv: "timestamp"`, server resolves | Server-anchored "now" for clock offset |

Created ephemerally: the TV writes, reads back, and leaves the value in place for the next read. No TTL needed — data is tiny (< 100 bytes per restaurant).

---

## Module: `tv-display/src/subscriptionGuard.js`

Pure functions, zero React dependencies. All state lives in localStorage.

### Storage Keys

| Key | Type | Set when | Purpose |
|---|---|---|---|
| `restomenu-tv-expiresAt` | `number` (ms epoch) | Live Firestore snapshot received | Absolute expiration bound |
| `restomenu-tv-clockOffset` | `number` (ms) | Live Firestore snapshot received | `= heartbeatAt - Date.now()` |
| `restomenu-tv-lastSeenTime` | `number` (ms epoch) | Every checkAccess() + every updateFromServer() | Clock rollback detection |

### Public API

```js
/**
 * Called from the onSnapshot callback with the data from config/display.
 * Only uses the values when the snapshot is a genuine server read.
 * @param {object} data - snapshot.data() from config/display doc
 * @param {boolean} fromCache - snapshot.metadata.fromCache
 */
export function updateFromServer(data, fromCache) { ... }

/**
 * Returns the current access decision.
 * Must be called: on mount, after every updateFromServer(), and every hour.
 * @returns {{ allowed: boolean, reason: string | null }}
 */
export function checkAccess() { ... }

/**
 * Clears stored menu cache data when access is revoked.
 * Called internally by checkAccess() when expired.
 */
export function revokeAccess() { ... }
```

### `updateFromServer(data, fromCache)` Logic

Now only handles `expiresAt` and liveness stamp. Clock offset is managed by `syncServerOffset()`.

```
if (fromCache === true) → return (do nothing, stale data)

// Store expiration timestamp
if (data.expiresAt) {
  localStorage.setItem('expiresAt', data.expiresAt.toMillis())
}

// A live server read proves the device is online right now —
// stamp lastSeenTime to clear any prior clock-rollback block
localStorage.setItem('lastSeenTime', Date.now())
```

### `syncServerOffset(restaurantId)` — New

Called alongside `updateFromServer()` to obtain a server-anchored clock offset via Realtime Database.

```
async function syncServerOffset(restaurantId) {
  // 1. Write the timestamp placeholder to RTDB
  db.ref = serverTimeCheck/{restaurantId}
  await set({ time: { ".sv": "timestamp" } })

  // 2. Read back the server-resolved value
  const snap = await onValue(onlyOnce: true)
  const serverTime = snap.val().time

  // 3. Compute and store offset
  const offset = serverTime - Date.now()
  localStorage.setItem('clockOffset', offset)
  localStorage.setItem('lastSeenTime', Date.now())
}
```

**Why this works without Cloud Functions:** RTDB's `{ ".sv": "timestamp" }` is a server-side placeholder — the server replaces it with the actual epoch millisecond at write time. No backend code runs, no scheduled function needed. The security rule `".validate": "newData.child('time').val() === now"` ensures only a valid server timestamp can be written.

**Called:**
- On initial mount (when the TV has network)
- Inside every `onSnapshot` callback on the non-cached (`!fromCache`) branch — so the offset refreshes on the same cadence as live Firestore data

### Helpers

```
function toDayStart(ms) {
  const d = new Date(ms)
  d.setUTCHours(0, 0, 0, 0)
  return d.getTime()
}
```

### Constants

```
const ROLLBACK_TOLERANCE_MS = 5 * 60 * 1000  // 5 minutes
```

### `checkAccess()` Logic

```
// 1. Clock rollback guard — 5-minute tolerance for legitimate NTP adjustments
const lastSeen = localStorage.getItem('lastSeenTime')
if (lastSeen && Date.now() < Number(lastSeen) - ROLLBACK_TOLERANCE_MS) {
  return { allowed: false, reason: 'clock_rolled_back' }
}

// 2. Update lastSeenTime
localStorage.setItem('lastSeenTime', Date.now())

// 3. No expiration known → fail closed
const expiresAt = localStorage.getItem('expiresAt')
if (!expiresAt) {
  return { allowed: false, reason: 'no_expiration' }
}

// 4. Compute corrected time
const offset = Number(localStorage.getItem('clockOffset') || 0)
const correctedNow = Date.now() + offset

// 5. Compare at day granularity — drift up to minutes cannot shift which day it is
const expiresAtDay = toDayStart(Number(expiresAt))
const correctedNowDay = toDayStart(correctedNow)

if (correctedNowDay >= expiresAtDay) {
  revokeAccess()
  return { allowed: false, reason: 'expired' }
}

return { allowed: true, reason: null }
```

### `revokeAccess()` Logic

```
// Clear cached menu so nothing lingers
const restaurantId = localStorage.getItem('restomenu-tv-restaurant')
if (restaurantId) {
  localStorage.removeItem(`restomenu-tv-cache_${restaurantId}`)
  localStorage.removeItem(`restomenu-tv-config_${restaurantId}`)
}
// Do NOT clear expiresAt, clockOffset, or lastSeenTime —
// those are needed to stay blocked until a fresh snapshot confirms renewal
```

---

## Integration into `useMenuData.js`

### In the `config/display` onSnapshot callback

```js
const data = snap.data() || {}

// Update subscription state from server data (live snapshots only)
updateFromServer(data, snap.metadata.fromCache)

// Re-check access immediately — don't wait for the hourly timer
const access = checkAccess()
setSubscriptionBlocked(!access.allowed)

// If blocked, skip the rest of the normal flow
if (!access.allowed) {
  if (access.reason === 'expired') revokeAccess()
  setLoading(false)
  return
}
```

### On mount (before any snapshot arrives)

```js
// Initial check with whatever is in localStorage
const access = checkAccess()
setSubscriptionBlocked(!access.allowed)
```

### Hourly interval

```js
// Safety net for offline countdown hitting zero
const interval = setInterval(() => {
  const access = checkAccess()
  setSubscriptionBlocked(!access.allowed)
}, 60 * 60 * 1000)
```

### Return value

Add `subscriptionBlocked` to the hook's return object.

---

## Integration into `App.jsx`

```jsx
const { menu, loading, waiting, offline, needsSetup, categories,
        allAddons, selectedLayout, subscriptionBlocked } = useMenuData()

if (needsSetup) {
  return <NeedsSetupScreen />
}

if (subscriptionBlocked) {
  return <div className="h-full w-full bg-black" />
}

// ... existing render logic continues unchanged ...
```

No other component needs to know about subscription state. The black screen is rendered at the top level before any menu rendering.

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| **First boot, no network** | No `expiresAt` → `checkAccess()` returns BLOCKED → black screen. Safe closed default. |
| **First boot, online** | Mount check sees no `expiresAt` → BLOCKED. Snapshot arrives within seconds → `updateFromServer()` stores `expiresAt` → `checkAccess()` re-runs → ALLOWED. User sees ~1-2s black screen while Firestore resolves. |
| **Offline, still valid** | Stored `expiresAt` + `clockOffset` available. `correctedNow < expiresAt` → ALLOWED. Menu renders normally. |
| **Offline, just expired** | Hourly interval fires `checkAccess()` → `correctedNow >= expiresAt` → black screen + cache cleared. |
| **Online, renewal arrives** | `onSnapshot` fires → `updateFromServer()` stores new `expiresAt` → `checkAccess()` re-runs immediately → ALLOWED. No 1-hour wait. |
| **Clock rolled back** | `Date.now() < lastSeenTime` → BLOCKED. Next live snapshot calls `updateFromServer()` which stamps `lastSeenTime = Date.now()` → next `checkAccess()` clears the block. |
| **localStorage cleared** | Same as first boot — black screen until a live snapshot repopulates. |
| **Device offline from birth** | Never gets a heartbeat → never stores `expiresAt` → black screen. Correct — device was never authorized. |
| **TV reboot during valid subscription** | `expiresAt` + `clockOffset` + `lastSeenTime` all persisted. On reload, `checkAccess()` reads all three → ALLOWED. |
| **`expiresAt` field removed from Firestore** | Stored value persists in localStorage. TV continues showing menu until the stored `expiresAt` passes — this is intentional (offline resilience). Next live snapshot stores `undefined` → `checkAccess()` returns BLOCKED. |

---

## Limitations

1. **Requires at least one online session.** A device that has never been online has no `expiresAt`, no `clockOffset` — it stays blocked. This is by design and is not solvable without a network round-trip.
2. **`clockOffset` drifts.** The offset is computed when a live RTDB round-trip completes. Device clocks drift over time (especially cheap Android TVs). After days offline, the corrected time could meaningfully diverge from actual server time. Acceptable — the worst case is the screen stays black a few minutes early or late. Next online sync resets the offset.
3. **RTDB write is per-TV, not shared.** Each TV writes and reads its own `serverTimeCheck/{restaurantId}` entry. With N TVs in the same restaurant, there are N independent RTDB paths. This is by design — each TV computes its own offset independently.