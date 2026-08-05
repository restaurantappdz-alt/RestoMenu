// subscriptionGuard.js
//
// Subscription-expiration enforcement for the TV display app.
// Pure functions, zero React dependencies. All state lives in localStorage.
//
// Server clock offset is obtained via Firebase Realtime Database's built-in
// ServerValue.TIMESTAMP — no Cloud Functions needed. The TV simply writes
// the timestamp placeholder to serverTimeCheck/{restaurantId} and reads back
// the server-resolved value.

import { getDatabase, ref, set, onValue } from 'firebase/database'

// Storage keys
const KEYS = {
  EXPIRES_AT: 'restomenu-tv-expiresAt',
  CLOCK_OFFSET: 'restomenu-tv-clockOffset',
  LAST_SEEN_TIME: 'restomenu-tv-lastSeenTime',
  SERVER_EXPIRED: 'restomenu-tv-server-expired',
}

const ROLLBACK_TOLERANCE_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Truncate a millisecond timestamp to the start of its UTC day.
 * This makes expiration deterministic: drift up to minutes
 * cannot shift which calendar day it is.
 */
export function toDayStart(ms) {
  const d = new Date(ms)
  d.setUTCHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Sync the TV's clock offset against Firebase Realtime Database's built-in
 * server timestamp. Writes ServerValue.TIMESTAMP to a per-restaurant RTDB
 * path and reads back the resolved server value.
 *
 * The computed offset (= serverTime - clientTime) is stored in localStorage
 * so checkAccess() can correct for device clock drift.
 *
 * Called alongside updateFromServer() whenever the TV has a live connection.
 *
 * @param {string} restaurantId - The restaurant ID for the RTDB path
 */
export async function syncServerOffset(restaurantId) {
  const db = getDatabase()
  const timeRef = ref(db, `serverTimeCheck/${restaurantId}`)

  // Write the timestamp placeholder — the server resolves {".sv":"timestamp"}
  // to an actual millisecond epoch value
  await set(timeRef, { time: { '.sv': 'timestamp' } })

  // Read back the resolved server timestamp
  return new Promise((resolve) => {
    onValue(timeRef, (snap) => {
      const serverTime = snap.val()?.time
      if (typeof serverTime === 'number') {
        const offset = serverTime - Date.now()
        try {
          localStorage.setItem(KEYS.CLOCK_OFFSET, String(offset))
          // A live server round-trip proves the device is online — stamp
          // lastSeenTime to clear any prior clock-rollback block
          localStorage.setItem(KEYS.LAST_SEEN_TIME, String(Date.now()))
        } catch (e) {
          // localStorage full or unavailable — skip silently
        }
      }
      resolve()
    }, { onlyOnce: true })
  })
}

/**
 * Called from the onSnapshot callback with data from config/display.
 * Only updates stored values when the snapshot is a genuine server read
 * (fromCache === false).
 *
 * Stores expiresAt and stamps lastSeenTime. Clock offset is handled
 * independently by syncServerOffset().
 *
 * NOTE: this only ever STORES an expiry — it never removes one. Removal
 * is the job of updateFromRestaurant(), because the restaurant document
 * (activeUntil) is the source of truth for the subscription state.
 *
 * @param {object} data - snapshot.data() from config/display doc
 * @param {boolean} fromCache - snapshot.metadata.fromCache
 */
export function updateFromServer(data, fromCache) {
  // A cache read is a transient offline blip — never wipe stored values
  // from it, so a flaky connection cannot destroy the expiry.
  if (fromCache) return

  try {
    if (data.expiresAt != null) {
      const ms = toMillis(data.expiresAt)
      if (Number.isFinite(ms)) {
        localStorage.setItem(KEYS.EXPIRES_AT, String(ms))
      }
    }

    // A live server read proves the device is online right now —
    // stamp lastSeenTime to clear any prior clock-rollback block
    localStorage.setItem(KEYS.LAST_SEEN_TIME, String(Date.now()))
  } catch (e) {
    // localStorage full or unavailable — skip silently
  }
}

/**
 * Coerce a Firestore Timestamp, epoch number, or ISO string into epoch ms.
 * @param {*} value
 * @returns {number}
 */
function toMillis(value) {
  if (typeof value === 'object' && typeof value.toMillis === 'function') {
    return value.toMillis()
  }
  if (typeof value === 'string') {
    return Date.parse(value)
  }
  return Number(value)
}

/**
 * Called from the onSnapshot callback with data from the restaurant
 * document (restaurants/{id}).
 *
 * The restaurant doc's activeUntil is the source of truth for the
 * subscription state because the RestoMenu admin app writes it there
 * (config/display.expiresAt is admin-only). Only updates stored values on
 * a genuine server read (fromCache === false).
 *
 * activeUntil present  → store it as the expiry.
 * activeUntil absent   → subscription deactivated → remove the stored
 *                        expiry so checkAccess fails closed immediately.
 *
 * @param {object} data - snapshot.data() from the restaurant doc
 * @param {boolean} fromCache - snapshot.metadata.fromCache
 */
export function updateFromRestaurant(data, fromCache) {
  // A cache read is a transient offline blip — never wipe stored values
  // from it, so a flaky connection cannot destroy the expiry.
  if (fromCache) return

  try {
    if (data.activeUntil != null) {
      const ms = toMillis(data.activeUntil)
      if (Number.isFinite(ms)) {
        localStorage.setItem(KEYS.EXPIRES_AT, String(ms))
      }
    } else {
      // GENUINE server read with no activeUntil = the subscription was
      // deactivated. Remove the stored expiry so checkAccess fails closed
      // (no_expiration) and the TV stops showing immediately.
      localStorage.removeItem(KEYS.EXPIRES_AT)
    }

    // A live server read proves the device is online right now —
    // stamp lastSeenTime to clear any prior clock-rollback block
    localStorage.setItem(KEYS.LAST_SEEN_TIME, String(Date.now()))
  } catch (e) {
    // localStorage full or unavailable — skip silently
  }
}

/**
 * Watch the server-authoritative subscription expiry for a restaurant.
 *
 * The RTDB node subscription/{restaurantId}/expiresAt is written ONLY by the
 * super-admin app (rule: auth.token.admin === true). Its read rule denies
 * access once the server clock passes the expiry (now < expiresAt), so a
 * permission_denied error here means "the server has decided this TV is
 * expired" — regardless of any tampering with the device clock, the clock
 * offset, or the Firestore value.
 *
 * When the node is absent (admin never set expiry via this path), onValue
 * delivers null and the TV falls back to the legacy Firestore-based check.
 *
 * Returns an unsubscribe function.
 *
 * @param {string} restaurantId - The restaurant ID for the RTDB path
 * @param {object} handlers - { onAllowed(ms), onMissing(), onExpired() }
 */
export function watchServerExpiry(restaurantId, handlers = {}) {
  const db = getDatabase()
  const expiryRef = ref(db, `subscription/${restaurantId}/expiresAt`)

  return onValue(
    expiryRef,
    (snap) => {
      const ms = snap.val()
      if (typeof ms === 'number' && Number.isFinite(ms)) {
        try {
          localStorage.removeItem(KEYS.SERVER_EXPIRED)
        } catch (e) {
          // storage unavailable — skip silently
        }
        updateFromServer({ expiresAt: ms }, false)
        handlers.onAllowed?.(ms)
      } else {
        // Node absent: the admin never set expiry via RTDB, or the
        // subscription was just deactivated (node removed). Clear any
        // server-expired flag so a deactivated subscription's block can be
        // lifted; checkAccess then decides from the (possibly missing)
        // Firestore expiry, and trials (Firestore-only expiry) stay unblocked.
        try {
          localStorage.removeItem(KEYS.SERVER_EXPIRED)
        } catch (e) {
          // storage unavailable — skip silently
        }
        handlers.onMissing?.()
      }
    },
    (error) => {
      // Only a REAL permission_denied means "the server clock has passed
      // expiresAt" (the RTDB read rule denies exactly then). Network blips
      // must NOT black-screen the TV — report them and keep the current
      // access state untouched.
      if (error?.code !== 'PERMISSION_DENIED') {
        handlers.onError?.(error)
        return
      }
      // permission_denied: node exists and now >= expiresAt.
      // The Firestore value must not override this decision.
      try {
        localStorage.setItem(KEYS.SERVER_EXPIRED, '1')
      } catch (e) {
        // storage unavailable — skip silently
      }
      revokeAccess()
      handlers.onExpired?.()
    },
  )
}

/**
 * Check whether the TV is allowed to display the menu.
 *
 * Must be called:
 *  - on mount
 *  - immediately after every updateFromServer() call
 *  - every hour (safety net for offline countdown)
 *
 * @returns {{ allowed: boolean, reason: string | null }}
 */
export function checkAccess() {
  try {
    // 1. Server-revoked: the RTDB rule denied the subscription read, which
    //    only happens when the server clock has passed expiresAt. This flag
    //    outranks every local value and is only cleared by a fresh live
    //    server value (watchServerExpiry onValue with a future expiry).
    if (localStorage.getItem(KEYS.SERVER_EXPIRED) === '1') {
      return { allowed: false, reason: 'expired' }
    }

    // 2. Clock rollback guard — 5-minute tolerance for legitimate NTP adjustments
    const lastSeen = localStorage.getItem(KEYS.LAST_SEEN_TIME)
    if (lastSeen && Date.now() < Number(lastSeen) - ROLLBACK_TOLERANCE_MS) {
      return { allowed: false, reason: 'clock_rolled_back' }
    }

    // 3. Update lastSeenTime
    localStorage.setItem(KEYS.LAST_SEEN_TIME, String(Date.now()))

    // 4. No expiration known → fail closed
    const expiresAt = localStorage.getItem(KEYS.EXPIRES_AT)
    if (!expiresAt) {
      return { allowed: false, reason: 'no_expiration' }
    }

    // 5. Compute corrected time using stored clock offset
    const offset = Number(localStorage.getItem(KEYS.CLOCK_OFFSET) || 0)
    const correctedNow = Date.now() + offset

    // 6. Compare at day granularity
    //    Normal drift (seconds to minutes) cannot shift which UTC day it is,
    //    making the transition deterministic and predictable.
    const expiresAtDay = toDayStart(Number(expiresAt))
    const correctedNowDay = toDayStart(correctedNow)

    if (correctedNowDay >= expiresAtDay) {
      revokeAccess()
      return { allowed: false, reason: 'expired' }
    }

    return { allowed: true, reason: null }
  } catch (e) {
    // If localStorage is somehow broken/unavailable, fail closed
    return { allowed: false, reason: 'storage_error' }
  }
}

/**
 * Clear locally cached menu data when access is revoked.
 * Does NOT clear expiresAt, clockOffset, or lastSeenTime —
 * those are needed to stay blocked until a fresh snapshot confirms renewal.
 */
export function revokeAccess() {
  try {
    const restaurantId = localStorage.getItem('restomenu-tv-restaurant')
    if (restaurantId) {
      localStorage.removeItem(`restomenu-tv-cache_${restaurantId}`)
      localStorage.removeItem(`restomenu-tv-config_${restaurantId}`)
    }
  } catch (e) {
    // Silently ignore storage errors during cleanup
  }
}
