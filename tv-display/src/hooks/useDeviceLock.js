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
 * Single-active-device lock for the TV display.
 *
 * Returns one of:
 *  - 'checking': lease state not yet known (online, first render)
 *  - 'active':   this device holds the lease (or we are offline → no lock)
 *  - 'blocked':  another device holds the lease → show "displayed elsewhere"
 *
* Heartbeat + TTL takeover:
 *  - while active, the lease is refreshed every RENEW_INTERVAL_MS so a live
 *    device is never mistaken for a dead one.
 *  - while an unknown lease is observed, a scan every STALE_SCAN_MS checks
 *    whether that lease went stale (no refresh for LEASE_TTL_MS). A stale
 *    foreign lease is deleted and reclaimed, so a brand-new connection always
 *    wins over an old/inactive one. Staleness is judged against the server
 *    clock estimate (syncServerOffset), so device clock drift cannot
 *    false-trigger a takeover.
 */
export default function useDeviceLock(restaurantId, online) {
  const [lease, setLease] = useState(() => loadCachedLease(restaurantId))

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

    const unsub = watchLease(restaurantId, (snap) => {
      if (!mounted) return
      stopTimers()
      if (snap === null) {
        currentLease = null
        claimLease(restaurantId).catch(() => {})
        return
      }
      currentLease = snap
      saveCachedLease(restaurantId, snap)
      setLease(snap)

      if (snap.deviceId === getDeviceId()) {
        heartbeatTimer = setInterval(() => {
          renewLease(restaurantId).catch(() => {})
        }, RENEW_INTERVAL_MS)
      } else {
        const maybeTakeover = () => {
          if (isStale(currentLease, serverNow())) {
            // The old lease was never refreshed: take it over.
            takeoverLease(restaurantId).catch(() => {})
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
  }, [restaurantId, online])

  if (!online) return 'active'

  if (!lease) return 'checking'
  return lease.deviceId === getDeviceId() ? 'active' : 'blocked'
}