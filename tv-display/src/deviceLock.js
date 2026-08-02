// deviceLock.js
//
// Single-active-device enforcement for the TV display app.
// Pure functions, zero React dependencies. All state lives in RTDB + localStorage.
//
// Each TV browser generates a persistent deviceId (localStorage). The active
// device holds a lease at tvLease/{restaurantId} in the Realtime Database.
// onDisconnect() removes the lease the moment that device loses connection,
// so another device can take over automatically. RTDB rules enforce
// "first device wins" server-side: a lease can only be written when it does
// not exist yet, or by the same deviceId that already owns it.

import { ref, set, onValue, serverTimestamp, onDisconnect, remove } from 'firebase/database'
import { rtdb } from './firebase'

const DEVICE_ID_KEY = 'restomenu-tv-deviceId'
const LEASE_CACHE_PREFIX = 'restomenu-tv-lease'

export const LEASE_TTL_MS = 60000

function leaseRef(restaurantId) {
  return ref(rtdb, `tvLease/${restaurantId}`)
}

/**
 * Return this device's persistent ID, generating and storing one on first use.
 * Survives reloads so the same browser keeps its identity across sessions.
 */
export function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY)
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) ||
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(DEVICE_ID_KEY, id)
    }
    return id
  } catch {
    return 'unknown-device'
  }
}

/**
 * Attempt to claim the lease for this device. The server clears it via
 * onDisconnect() when this device disconnects. Rejects if another device
 * already holds the lease (enforced by RTDB rules).
 *
 * The disconnect cleanup is registered BEFORE the write (so a connection
 * drop during the claim never leaves a stale lease) and cancelled on
 * failure (so a blocked device never removes the active device's lease
 * when it disconnects).
 */
export async function claimLease(restaurantId) {
  const r = leaseRef(restaurantId)
  const pending = onDisconnect(r)
  await pending.remove()
  try {
    await set(r, { deviceId: getDeviceId(), claimedAt: serverTimestamp(), renewedAt: serverTimestamp() })
  } catch (err) {
    pending.cancel()
    throw err
  }
}

/**
 * Refresh this device's own lease so the TTL-based takeover logic never
 * mistakes a live device for a dead one. Same-device writes are allowed by
 * the RTDB rules, so a heartbeat cannot be rejected.
 */
export async function renewLease(restaurantId) {
  await set(leaseRef(restaurantId), {
    deviceId: getDeviceId(),
    claimedAt: serverTimestamp(),
    renewedAt: serverTimestamp(),
  })
}

/**
 * Take the lease away from a stale foreign device: delete the dead lease
 * first (the rules let anyone delete), then claim the now-empty path.
 */
export async function takeoverLease(restaurantId) {
  await remove(leaseRef(restaurantId))
  await claimLease(restaurantId)
}

/**
 * True when a lease stopped being refreshed long enough ago that it must be
 * considered dead. Legacy leases without renewedAt fall back to claimedAt.
 */
export function isStale(lease, now = Date.now(), ttl = LEASE_TTL_MS) {
  if (!lease) return false
  const last = typeof lease.renewedAt === 'number' ? lease.renewedAt : lease.claimedAt
  return typeof last === 'number' && now - last > ttl
}

/**
 * Watch the current lease for a restaurant. callback(lease) fires with
 * { deviceId, claimedAt } or null when no device holds the lease.
 * Returns an unsubscribe function.
 */
export function watchLease(restaurantId, callback) {
  return onValue(leaseRef(restaurantId), (snap) => {
    callback(snap.val() || null)
  })
}

function leaseCacheKey(restaurantId) {
  return `${LEASE_CACHE_PREFIX}_${restaurantId}`
}

export function loadCachedLease(restaurantId) {
  try {
    const raw = localStorage.getItem(leaseCacheKey(restaurantId))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveCachedLease(restaurantId, lease) {
  try { localStorage.setItem(leaseCacheKey(restaurantId), JSON.stringify(lease)) } catch {}
}
