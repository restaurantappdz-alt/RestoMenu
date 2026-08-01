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
 * @param {object} data - snapshot.data() from config/display doc
 * @param {boolean} fromCache - snapshot.metadata.fromCache
 */
export function updateFromServer(data, fromCache) {
  if (fromCache) return

  try {
    if (data.expiresAt != null) {
      // Accept Firestore Timestamp (toMillis), epoch number, or ISO string
      let ms = data.expiresAt
      if (typeof data.expiresAt === 'object' && typeof data.expiresAt.toMillis === 'function') {
        ms = data.expiresAt.toMillis()
      } else if (typeof data.expiresAt === 'string') {
        ms = Date.parse(data.expiresAt)
      } else {
        ms = Number(data.expiresAt)
      }
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
    // 1. Clock rollback guard — 5-minute tolerance for legitimate NTP adjustments
    const lastSeen = localStorage.getItem(KEYS.LAST_SEEN_TIME)
    if (lastSeen && Date.now() < Number(lastSeen) - ROLLBACK_TOLERANCE_MS) {
      return { allowed: false, reason: 'clock_rolled_back' }
    }

    // 2. Update lastSeenTime
    localStorage.setItem(KEYS.LAST_SEEN_TIME, String(Date.now()))

    // 3. No expiration known → fail closed
    const expiresAt = localStorage.getItem(KEYS.EXPIRES_AT)
    if (!expiresAt) {
      return { allowed: false, reason: 'no_expiration' }
    }

    // 4. Compute corrected time using stored clock offset
    const offset = Number(localStorage.getItem(KEYS.CLOCK_OFFSET) || 0)
    const correctedNow = Date.now() + offset

    // 5. Compare at day granularity
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
