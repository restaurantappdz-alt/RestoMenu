import { useState, useEffect } from 'react'
import { getDeviceId, claimLease, watchLease, loadCachedLease, saveCachedLease } from '../deviceLock'

/**
 * Single-active-device lock for the TV display.
 *
 * Returns one of:
 *  - 'checking': lease state not yet known (online, first render)
 *  - 'active':   this device holds the lease (or we are offline → no lock)
 *  - 'blocked':  another device holds the lease → show "displayed elsewhere"
 *
 * The lock is ONLY enforced while online. When offline the TV cannot reach
 * RTDB to verify the lease, so it returns 'active' and the cached menu keeps
 * displaying — offline mode is preserved. The lock re-engages automatically
 * the moment the connection returns.
 */
export default function useDeviceLock(restaurantId, online) {
  const [lease, setLease] = useState(() => loadCachedLease(restaurantId))

  useEffect(() => {
    if (!restaurantId || !online) return
    let mounted = true

    const unsub = watchLease(restaurantId, (snap) => {
      if (!mounted) return
      if (snap === null) {
        // No lease anywhere: try to become the active device. If another
        // device wins the race, RTDB rules reject and onValue fires with
        // their lease, so we flip to 'blocked' without retrying in a loop.
        claimLease(restaurantId).catch(() => {})
        return
      }
      saveCachedLease(restaurantId, snap)
      setLease(snap)
    })

    return () => {
      mounted = false
      unsub()
    }
  }, [restaurantId, online])

  if (!online) return 'active'

  if (!lease) return 'checking'
  return lease.deviceId === getDeviceId() ? 'active' : 'blocked'
}
