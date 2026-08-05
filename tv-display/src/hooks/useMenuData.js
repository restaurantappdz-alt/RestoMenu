import { useState, useEffect } from 'react'
import { onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { updateFromServer, checkAccess, syncServerOffset, watchServerExpiry } from '../subscriptionGuard'

async function checkConnectivity() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3000)
  try {
    await fetch('https://firestore.googleapis.com/v1/projects/menu-85c70/databases/(default)/documents', {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal
    })
    return true
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

const RESTAURANT_ID_KEY = 'restomenu-tv-restaurant'
const CACHE_KEY_PREFIX = 'restomenu-tv-cache'
const CONFIG_CACHE_KEY_PREFIX = 'restomenu-tv-config'

// A stuck loading/waiting state (no live snapshot for this long) flips to
// connectionError so the UI shows a visible retry screen instead of spinning.
const WATCHDOG_MS = 20000
// After a permission_denied (server says expired), RTDB never re-fires the
// listener — poll this often so a renewal recovers WITHOUT a manual reload.
const EXPIRY_RECHECK_MS = 60000

function getRestaurantId() {
  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('r')
  if (fromUrl) {
    try { localStorage.setItem(RESTAURANT_ID_KEY, fromUrl) } catch {}
    return fromUrl
  }
  try { return localStorage.getItem(RESTAURANT_ID_KEY) } catch { return null }
}

function getScreenId() {
  const params = new URLSearchParams(window.location.search)
  return params.get('s') || null
}

function cacheKey(restaurantId) {
  return `${CACHE_KEY_PREFIX}_${restaurantId}`
}

function loadCache(restaurantId) {
  try {
    const raw = localStorage.getItem(cacheKey(restaurantId))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveCache(restaurantId, data) {
  try { localStorage.setItem(cacheKey(restaurantId), JSON.stringify(data)) } catch {}
}

function loadConfigCache(restaurantId) {
  try {
    const raw = localStorage.getItem(`${CONFIG_CACHE_KEY_PREFIX}_${restaurantId}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveConfigCache(restaurantId, data) {
  try { localStorage.setItem(`${CONFIG_CACHE_KEY_PREFIX}_${restaurantId}`, JSON.stringify(data)) } catch {}
}

export default function useMenuData() {
  const [restaurantId, setRestaurantId] = useState(getRestaurantId)
  const [activeMenuId, setActiveMenuId] = useState(() => {
    const rid = getRestaurantId()
    if (!rid) return null
    const cached = loadConfigCache(rid)
    if (!cached) return null
    const sid = getScreenId()
    const raw = sid ? cached.screens?.[sid] : cached.activeMenuId
    return (raw && typeof raw === 'object' ? raw.menuId : raw) || null
  })
  const [menu, setMenu] = useState(() => {
    const rid = getRestaurantId()
    if (!rid) return null
    const cachedMenu = loadCache(rid)
    if (!cachedMenu) return null
    const cachedCfg = loadConfigCache(rid)
    if (!cachedCfg) return cachedMenu
    const sid = getScreenId()
    const raw = sid ? cachedCfg.screens?.[sid] : cachedCfg.activeMenuId
    const expectedId = (raw && typeof raw === 'object' ? raw.menuId : raw) || null
    return expectedId ? (cachedMenu.id === expectedId ? cachedMenu : null) : cachedMenu
  })
  const [loading, setLoading] = useState(() => {
    const rid = getRestaurantId()
    if (!rid) return true
    const cachedMenu = loadCache(rid)
    if (!cachedMenu) return true
    const cachedCfg = loadConfigCache(rid)
    if (!cachedCfg) return false
    const sid = getScreenId()
    const raw = sid ? cachedCfg.screens?.[sid] : cachedCfg.activeMenuId
    const expectedId = (raw && typeof raw === 'object' ? raw.menuId : raw) || null
    if (!expectedId) return false
    return cachedMenu.id !== expectedId
  })
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine)
  const [waiting, setWaiting] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)
  // True while a listener is failing (or a watchdog fired) so App.jsx can
  // show a visible connection-lost state instead of lying "Menu Not Found".
  const [connectionError, setConnectionError] = useState(false)
  // Bumped on every successful config snapshot: live snapshots restart the
  // loading/waiting watchdog, so a healthy "waiting for owner to select a
  // menu" TV never false-trips into "Connection lost".
  const [snapshotTick, setSnapshotTick] = useState(0)
  const [subscriptionBlocked, setSubscriptionBlocked] = useState(() => {
    const result = checkAccess()
    return !result.allowed
  })

  useEffect(() => {
    const handleOnline = () => {
      setTimeout(() => window.location.reload(), 1000)
    }
    const handleOffline = () => { setOffline(true) }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    checkConnectivity().then(reachable => {
      if (!reachable && navigator.onLine) {
        setOffline(true)
      }
    })

    // Hourly subscription re-check (safety net for offline countdown hitting zero)
    const subInterval = setInterval(() => {
      const result = checkAccess()
      setSubscriptionBlocked(!result.allowed)
    }, 60 * 60 * 1000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(subInterval)
    }
  }, [])

  useEffect(() => {
    const id = getRestaurantId()
    setRestaurantId(id)
    if (!id) {
      setNeedsSetup(true)
      setLoading(false)
      return
    }
    setNeedsSetup(false)

    const screenId = getScreenId()
    const mountedOffline = typeof navigator !== 'undefined' && !navigator.onLine

    // Mounted offline with cache -> skip Firestore, load from cache
    if (mountedOffline) {
      const cachedCfg = loadConfigCache(id)
      if (cachedCfg) {
        const raw = screenId ? cachedCfg.screens?.[screenId] : cachedCfg.activeMenuId
        const cachedMenuId = (raw && typeof raw === 'object' ? raw.menuId : raw) || null
        if (cachedMenuId) {
          setActiveMenuId(cachedMenuId)
          setWaiting(false)
          const cachedMenu = loadCache(id)
          if (cachedMenu && cachedMenu.id === cachedMenuId) {
            setMenu(cachedMenu)
          }
          setLoading(false)
          return
        }
      }
    }

    // Active fetch: if the cached value says blocked but we're online,
    // the stored expiresAt might be stale from a prior session (e.g.
    // subscription was renewed while the TV was off). Do a one-time
    // getDoc to overwrite localStorage with fresh server data.
    if (!checkAccess().allowed && navigator.onLine) {
      getDoc(doc(db, 'restaurants', id, 'config', 'display')).then((fetchSnap) => {
        if (fetchSnap.exists() && !fetchSnap.metadata.fromCache) {
          updateFromServer(fetchSnap.data(), false)
          const result = checkAccess()
          if (result.allowed) {
            setSubscriptionBlocked(false)
          }
        }
      }).catch(() => {})
    }

    // Kick off an initial clock offset sync — the snapshot callback below
    // also triggers one on the first live response, so this is a head start
    syncServerOffset(id).catch(() => {})

    // Server-authoritative subscription watch: subscription/{id}/expiresAt
    // in RTDB. Written only by the super-admin app; the read rule denies
    // access once the server clock passes the expiry, so a denied read
    // blocks the TV regardless of local clock/offset tampering.
    //
    // RTDB does NOT re-fire a permission-denied listener, so after the
    // owner renews, this TV would stay black forever. attachExpiryWatcher
    // therefore re-attaches itself 60s after an onExpired; the next read
    // that succeeds (onAllowed) clears the block — no manual reload needed.
    let expiryUnsub = null
    let expiryRetryTimer = null
    let expiryRetryPending = false
    const attachExpiryWatcher = () => {
      if (expiryUnsub) expiryUnsub()
      expiryUnsub = watchServerExpiry(id, {
        onAllowed: () => {
          setSubscriptionBlocked(!checkAccess().allowed)
        },
        onExpired: () => {
          setSubscriptionBlocked(true)
          setLoading(false)
          if (!expiryRetryPending) {
            expiryRetryPending = true
            expiryRetryTimer = setTimeout(() => {
              expiryRetryPending = false
              attachExpiryWatcher()
            }, EXPIRY_RECHECK_MS)
          }
        },
        onMissing: () => {
          // Node absent: owner-trial (Firestore-only expiry) or a
          // deactivated subscription — let checkAccess decide from
          // the Firestore data rather than blocking unconditionally.
          setSubscriptionBlocked(!checkAccess().allowed)
        },
      })
    }
    attachExpiryWatcher()

    const unsubConfig = onSnapshot(doc(db, 'restaurants', id, 'config', 'display'), (snap) => {
      const data = snap.data() || {}

      updateFromServer(data, snap.metadata.fromCache)
      setConnectionError(false)
      setSnapshotTick((t) => t + 1)

      // Sync the RTDB clock offset whenever we get genuine live data
      if (!snap.metadata.fromCache) {
        syncServerOffset(id).catch(() => {})
      }

      const access = checkAccess()
      setSubscriptionBlocked(!access.allowed)
      if (!access.allowed) {
        setLoading(false)
        return
      }

      saveConfigCache(id, data)
      const raw = screenId ? data.screens?.[screenId] : data.activeMenuId
      const newId = (raw && typeof raw === 'object' ? raw.menuId : raw) || null
      if (!newId) {
        const cachedCfg = loadConfigCache(id)
        const cachedRaw = screenId ? cachedCfg?.screens?.[screenId] : cachedCfg?.activeMenuId
        const cachedId = cachedCfg && (cachedRaw && typeof cachedRaw === 'object' ? cachedRaw.menuId : cachedRaw) || null
        if (cachedId) {
          return
        }
        const cachedMenu = loadCache(id)
        if (cachedMenu) {
          setActiveMenuId(cachedMenu.id)
          setMenu(cachedMenu)
          setWaiting(false)
          setLoading(false)
          return
        }
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          return
        }
        setWaiting(true)
        setLoading(false)
        setMenu(null)
        setActiveMenuId(null)
        return
      }
      setWaiting(false)
      setActiveMenuId(newId)
    }, (error) => {
      setConnectionError(true)
      setLoading(false)
    })
    return () => {
      unsubConfig()
      if (expiryUnsub) expiryUnsub()
      if (expiryRetryTimer) clearTimeout(expiryRetryTimer)
    }
  }, [])

  useEffect(() => {
    if (!activeMenuId || !restaurantId) return
    setLoading(true)
    const unsubMenu = onSnapshot(doc(db, 'restaurants', restaurantId, 'menus', activeMenuId), (snap) => {
      setConnectionError(false)
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() }
        setMenu(data)
        saveCache(restaurantId, data)
      } else {
        const cachedMenu = loadCache(restaurantId)
        if (cachedMenu && cachedMenu.id === activeMenuId) {
          // Keep showing the cached copy, but the load is over either way —
          // never leave the UI hanging in "Loading menu...".
          setLoading(false)
          return
        }
        setMenu(null)
      }
      setLoading(false)
    }, (error) => {
      setConnectionError(true)
      setLoading(false)
    })
    return () => unsubMenu()
  }, [activeMenuId, restaurantId])

  // Watchdog: if loading or waiting stays stuck (no live snapshot) past
  // WATCHDOG_MS, surface a visible connection-lost/retry state instead of
  // an infinite "Loading menu..." / "Waiting for Menu".
  useEffect(() => {
    if (!loading && !waiting) return
    const timer = setTimeout(() => {
      setConnectionError(true)
      setLoading(false)
      setWaiting(false)
    }, WATCHDOG_MS)
    return () => clearTimeout(timer)
  }, [loading, waiting, snapshotTick])

  const categories = menu?.categories || []
  const allAddons = categories.map((c) => c.addons || []).flat()
  const selectedLayout = menu?.selectedLayout || 'classic'

  return {
    menu,
    loading,
    offline,
    waiting,
    needsSetup,
    subscriptionBlocked,
    connectionError,
    restaurantId,
    categories,
    allAddons,
    selectedLayout,
  }
}
