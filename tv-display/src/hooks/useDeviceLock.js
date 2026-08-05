import { useState, useEffect } from 'react'
import {
  getDeviceId,
  claimLease,
  renewLease,
  takeoverLease,
  watchLease,
  loadCachedLease,
  saveCachedLease,
  clearCachedLease,
  isStale,
} from '../deviceLock'

export const RENEW_INTERVAL_MS = 15000
export const STALE_SCAN_MS = 10000

// Lease-write retry policy: exponential backoff (5s → 10s → 20s, capped)
// with at most 5 retries, then the TV fails open rather than staying stuck.
const RETRY_BASE_MS = 5000
const RETRY_MAX_MS = 20000
const MAX_RETRIES = 5

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
 *    false-trigger.
 *
 * Failure handling (no silent stuck states):
 *  - failed claim/renew/takeover writes are retried with exponential
 *    backoff; after MAX_RETRIES the TV fails open ('active') because
 *    showing the menu matters more than the single-screen guarantee.
 *  - a failed watcher invalidates the cached lease (so a stale 'blocked'
 *    cannot persist) and re-runs the claim path with the same backoff.
 */
export default function useDeviceLock(restaurantId, screenId, online) {
  const [lease, setLease] = useState(() => loadCachedLease(restaurantId, screenId))
  const [failOpen, setFailOpen] = useState(false)

  useEffect(() => {
    if (!restaurantId || !online) return
    let mounted = true
    let currentLease = null
    let heartbeatTimer = null
    let scan = null
    let retryTimer = null
    let retryPending = false
    let retryAttempt = 0

    const stopTimers = () => {
      if (heartbeatTimer !== null) { clearInterval(heartbeatTimer); heartbeatTimer = null }
      if (scan !== null) { clearInterval(scan); scan = null }
      if (retryTimer !== null) { clearTimeout(retryTimer); retryTimer = null }
    }

    const failOpenNow = () => {
      if (!mounted) return
      console.error(`[deviceLock] lease write failed after ${MAX_RETRIES} retries (${restaurantId}/${screenId}); failing open`)
      setFailOpen(true)
    }

    const retrySchedule = (action) => {
      if (retryPending) return
      action()
        .then(() => {
          retryPending = false
          retryAttempt = 0
        })
        .catch(() => {
          if (retryAttempt >= MAX_RETRIES) {
            retryPending = false
            retryAttempt = 0
            failOpenNow()
            return
          }
          retryAttempt += 1
          retryPending = true
          const delay = Math.min(RETRY_BASE_MS * 2 ** (retryAttempt - 1), RETRY_MAX_MS)
          retryTimer = setTimeout(() => {
            retryPending = false
            retrySchedule(action)
          }, delay)
        })
    }

    const unsub = watchLease(
      restaurantId,
      screenId,
      (snap) => {
        if (!mounted) return
        stopTimers()
        if (snap === null) {
          currentLease = null
          setLease(null)
          retrySchedule(() => claimLease(restaurantId, screenId))
          return
        }
        currentLease = snap
        saveCachedLease(restaurantId, screenId, snap)
        setLease(snap)

        if (snap.deviceId === getDeviceId()) {
          setFailOpen(false)
          heartbeatTimer = setInterval(() => {
            renewLease(restaurantId, screenId).catch(() => {
              retrySchedule(() => renewLease(restaurantId, screenId))
            })
          }, RENEW_INTERVAL_MS)
        } else {
          const maybeTakeover = () => {
            if (isStale(currentLease, serverNow())) {
              retrySchedule(() => takeoverLease(restaurantId, screenId))
            }
          }
          maybeTakeover()
          scan = setInterval(maybeTakeover, STALE_SCAN_MS)
        }
      },
      (error) => {
        // Watcher failed: invalidate the cached lease so a stale 'blocked'
        // can't persist, then re-run the claim path. If that also fails
        // after retries → fail open ('active').
        if (!mounted) return
        clearCachedLease(restaurantId, screenId)
        setLease(null)
        currentLease = null
        stopTimers()
        retrySchedule(() => claimLease(restaurantId, screenId))
      },
    )

    return () => {
      mounted = false
      stopTimers()
      unsub()
    }
  }, [restaurantId, screenId, online])

  if (!online) return 'active'
  if (failOpen) return 'active'
  if (!lease) return 'checking'
  return lease.deviceId === getDeviceId() ? 'active' : 'blocked'
}