import { useState, useEffect } from 'react'
import {
  getDeviceId,
  claimLease,
  renewLease,
  takeoverLease,
  watchLease,
  loadCachedLease,
  saveCachedLease,
  isStale,
} from '../deviceLock'

export const RENEW_INTERVAL_MS = 15000
export const STALE_SCAN_MS = 10000

const CLOCK_OFFSET_KEY = 'restomenu-tv-clockOffset'

function serverNow() {
  const offset = Number(localStorage.getItem(CLOCK_OFFSET_KEY) || 0)
  return Date.now() + offset
}

/**
 * Per-screen single-device lock for the TV display.
 *
 * Each screen (TV1, TV2, ...) has its own lease scope so multiple screens of
 * the same restaurant run simultaneously. Each lease is held by exactly one
 * device at a time: a link can't be duplicated across devices.
 *
 * Returns one of:
 *  - 'checking': lease state not yet known (online, first render)
 *  - 'active':   this device holds the lease (or we are offline → no lock)
 *  - 'blocked':  another device holds the lease → show "displayed elsewhere"
 *
 * Heartbeat + TTL takeover:
 *  - while active, the lease is refreshed every RENEW_INTERVAL_MS so a live
 *    device is never mistaken for a dead one.
 *  - while a foreign lease is observed, a scan every STALE_SCAN_MS checks
 *    whether that lease went stale (no refresh for LEASE_TTL_MS). A stale
 *    foreign lease is deleted and reclaimed, so a brand-new device always
 *    takes over from an old/inactive one. Staleness is judged against the
 *    server clock estimate (syncServerOffset), so device clock drift can't
 *    false y-trigger.
 */
export default function useDeviceLock(restaurantId, screenId, online) {
  const [lease, setLease] = useState(() => loadCachedLease(restaurantId, screenId))

  useEffect(() => {
    if (!restaurantId || !online) return
    let mounted = true
    let currentLease = null
    let heartbeatTimer = null
    let scan = null

    const stopTimers = () => {
      if (heartbeatTimer !== null) { clearInterval(heartbeatTimer); heartbeatTimer = null }
      if (scan !== null) { clearInterval(scan); scan = null }
    }

    const unsub = watchLease(restaurantId, screenId, (snap) => {
      if (!mounted) return
      stopTimers()
      if (snap === null) {
        currentLease = null
        claimLease(restaurantId, screenId).catch(() => {})
        return
      }
      currentLease = snap
      saveCachedLease(restaurantId, screenId, snap)
      setLease(snap)

      if (snap.deviceId === getDeviceId()) {
        heartbeatTimer = setInterval(() => {
          renewLease(restaurantId, screenId).catch(() => {})
        }, RENEW_INTERVAL_MS)
      } else {
        const maybeTakeover = () => {
          if (isStale(currentLease, serverNow())) {
            // The old lease was never refreshed: take it over.
            takeoverLease(restaurantId, screenId).catch(() => {})
          }
        }
        maybeTakeover()
        scan = setInterval(maybeTakeover, STALE_SCAN_MS)
      }
    })

    return () => {
      mounted = false
      stopTimers()
      unsub()
    }
  }, [restaurantId, screenId, online])

  if (!online) return 'active'

  if (!lease) return 'checking'
  return lease.deviceId === getDeviceId() ? 'active' : 'blocked'
}