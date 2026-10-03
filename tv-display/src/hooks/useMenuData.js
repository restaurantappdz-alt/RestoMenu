import { useState, useEffect } from 'react'
import { onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { updateFromServer, updateFromRestaurant, checkAccess, syncServerOffset, watchServerExpiry } from '../subscriptionGuard'

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

function cacheKey(restaurantId, menuId = null) {
  return menuId ? `${CACHE_KEY_PREFIX}_${restaurantId}_${menuId}` : `${CACHE_KEY_PREFIX}_${restaurantId}`
}

function loadCache(restaurantId, targetMenuId = null) {
  try {
    if (targetMenuId) {
      const specific = localStorage.getItem(cacheKey(restaurantId, targetMenuId))
      if (specific) return JSON.parse(specific)
    }
    const defaultRaw = localStorage.getItem(cacheKey(restaurantId))
    if (defaultRaw) {
      const parsed = JSON.parse(defaultRaw)
      if (!targetMenuId || parsed.id === targetMenuId) return parsed
    }
    // Fallback if targetMenuId was requested but not cached under that specific ID:
    // return any cached menu for this restaurant so the TV is never blank offline!
    if (defaultRaw) return JSON.parse(defaultRaw)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`${CACHE_KEY_PREFIX}_${restaurantId}`)) {
        const val = localStorage.getItem(key)
        if (val) return JSON.parse(val)
      }
    }
    return null
  } catch { return null }
}

function saveCache(restaurantId, data) {
  try {
    localStorage.setItem(cacheKey(restaurantId), JSON.stringify(data))
    if (data && data.id) {
      localStorage.setItem(cacheKey(restaurantId, data.id), JSON.stringify(data))
    }
  } catch {}
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

// ─── Menu resolution from screen config ──────────────────────────
// Handles legacy string IDs ("abc"), legacy object { menuId: "abc" },
// and current { menuIds: ["a","b"], schedules: { a: {...}, b: null } }
// format. Implements the same getActiveMenuId() logic from the Dart
// menu_schedule.dart so the TV picks the right menu based on day/time.

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function timeToMinutes(t) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function isScheduleActiveAt(sched, now) {
  if (!sched) return false
  const day = DAY_LABELS[now.getDay()]
  if (sched.daysOfWeek?.length > 0 && !sched.daysOfWeek.includes(day)) return false
  if (!sched.startTime || !sched.endTime) {
    // If daysOfWeek matched and no specific start/end time set,
    // the menu is active for the whole day.
    return true
  }
  const mins = now.getHours() * 60 + now.getMinutes()
  const start = timeToMinutes(sched.startTime)
  const end = timeToMinutes(sched.endTime)
  if (start <= end) {
    return mins >= start && mins < end
  }
  // Overnight window (e.g. 22:00–06:00)
  return mins >= start || mins < end
}

function resolveMenuId(screenEntry, now = new Date()) {
  if (!screenEntry) return null

  // Plain string ID format (legacy)
  if (typeof screenEntry === 'string') {
    return screenEntry
  }

  // Legacy format: { menuId: "abc" } — single string
  if (screenEntry.menuId && typeof screenEntry.menuId === 'string') {
    return screenEntry.menuId
  }

  // Current format: { menuIds: ["a","b"], schedules: { a: {...} } }
  const ids = screenEntry.menuIds
  if (!Array.isArray(ids) || ids.length === 0) return null

  const schedules = screenEntry.schedules || {}

  // Pass 1: first menu with an ACTIVE schedule wins
  for (const id of ids) {
    const sched = schedules[id]
    const isScheduled = sched && (sched.daysOfWeek?.length > 0 || (sched.startTime && sched.endTime))
    if (isScheduled && isScheduleActiveAt(sched, now)) {
      return id
    }
  }

  // Pass 2: first unscheduled (always-on) menu
  for (const id of ids) {
    const sched = schedules[id]
    const isScheduled = sched && (sched.daysOfWeek?.length > 0 || (sched.startTime && sched.endTime))
    if (!isScheduled) return id
  }

  // Pass 3: fallback — first menu in list
  return ids[0] || null
}

export default function useMenuData() {
  const [restaurantId, setRestaurantId] = useState(getRestaurantId)
  const [activeMenuId, setActiveMenuId] = useState(() => {
    const rid = getRestaurantId()
    if (!rid) return null
    const cached = loadConfigCache(rid)
    if (!cached) return null
    const sid = getScreenId()
    const raw = sid ? cached.screens?.[sid] : null
    return sid ? resolveMenuId(raw) : (cached.activeMenuId || null)
  })
  const [menu, setMenu] = useState(() => {
    const rid = getRestaurantId()
    if (!rid) return null
    const cachedCfg = loadConfigCache(rid)
    const sid = getScreenId()
    const raw = sid && cachedCfg ? cachedCfg.screens?.[sid] : null
    const expectedId = sid ? resolveMenuId(raw) : (cachedCfg?.activeMenuId || null)
    return loadCache(rid, expectedId)
  })
  const [loading, setLoading] = useState(() => {
    const rid = getRestaurantId()
    if (!rid) return true
    const cachedCfg = loadConfigCache(rid)
    const sid = getScreenId()
    const raw = sid && cachedCfg ? cachedCfg.screens?.[sid] : null
    const expectedId = sid ? resolveMenuId(raw) : (cachedCfg?.activeMenuId || null)
    const cachedMenu = loadCache(rid, expectedId)
    if (!cachedMenu) return true
    return false
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
      const raw = screenId && cachedCfg ? cachedCfg.screens?.[screenId] : null
      const cachedMenuId = screenId ? resolveMenuId(raw) : (cachedCfg?.activeMenuId || null)
      const cachedMenu = loadCache(id, cachedMenuId)
      if (cachedMenu) {
        setActiveMenuId(cachedMenu.id)
        setWaiting(false)
        setMenu(cachedMenu)
        setLoading(false)
        return
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

    const unsubRestaurant = onSnapshot(doc(db, 'restaurants', id), (snap) => {
      // The restaurant doc (activeUntil) is the subscription source of
      // truth for the RestoMenu admin app. Handle it before the config
      // snapshot so the activeUntil-based expiry is never masked by an
      // absent config.expiresAt.
      const data = snap.data() || {}
      updateFromRestaurant(data, snap.metadata.fromCache)
      setConnectionError(false)
      setSnapshotTick((t) => t + 1)

      const access = checkAccess()
      setSubscriptionBlocked(!access.allowed)
      if (!access.allowed) {
        setLoading(false)
      }
    }, (error) => {
      // Restaurant doc read may be denied for unauthenticated legacy paths —
      // fall back to the config/display source without blocking the TV.
      setConnectionError(true)
    })

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
      const raw = screenId ? data.screens?.[screenId] : null
      const newId = screenId ? resolveMenuId(raw) : (data.activeMenuId || null)
      if (!newId) {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
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
        setWaiting(true)
        setLoading(false)
        setMenu(null)
        setActiveMenuId(null)
        return
      }
      setWaiting(false)
      setActiveMenuId(newId)

      // When online, pre-fetch and cache all other menus assigned to this screen
      if (raw && Array.isArray(raw.menuIds)) {
        for (const otherId of raw.menuIds) {
          if (otherId && otherId !== newId) {
            getDoc(doc(db, 'restaurants', id, 'menus', otherId)).then((snap) => {
              if (snap && snap.exists()) {
                saveCache(id, { id: snap.id, ...snap.data() })
              }
            }).catch(() => {})
          }
        }
      }
    }, (error) => {
      setConnectionError(true)
      setLoading(false)
    })
    return () => {
      unsubConfig()
      unsubRestaurant()
      if (expiryUnsub) expiryUnsub()
      if (expiryRetryTimer) clearTimeout(expiryRetryTimer)
    }
  }, [])

  // Periodic schedule re-evaluation: every 60 seconds, re-resolve the
  // active menu from the cached config so scheduled menus switch
  // automatically when their time window starts/ends.
  useEffect(() => {
    const sid = getScreenId()
    if (!sid) return // Only needed for screen-based URLs
    const interval = setInterval(() => {
      const rid = getRestaurantId()
      if (!rid) return
      const cached = loadConfigCache(rid)
      if (!cached) return
      const raw = cached.screens?.[sid]
      const newId = resolveMenuId(raw)
      if (newId && newId !== activeMenuId) {
        setActiveMenuId(newId)
        // If offline or menu is already cached, switch immediately
        const cachedMenu = loadCache(rid, newId)
        if (cachedMenu) {
          setMenu(cachedMenu)
          setLoading(false)
        }
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [activeMenuId])

  useEffect(() => {
    if (!activeMenuId || !restaurantId) return
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine
    if (isOffline) {
      const cachedMenu = loadCache(restaurantId, activeMenuId)
      if (cachedMenu) {
        setMenu(cachedMenu)
        setLoading(false)
        return
      }
    }
    setLoading(true)
    const unsubMenu = onSnapshot(doc(db, 'restaurants', restaurantId, 'menus', activeMenuId), (snap) => {
      setConnectionError(false)
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() }
        setMenu(data)
        saveCache(restaurantId, data)
      } else {
        const cachedMenu = loadCache(restaurantId, activeMenuId)
        if (cachedMenu) {
          // Keep showing the cached copy, but the load is over either way —
          // never leave the UI hanging in "Loading menu...".
          setLoading(false)
          setMenu(cachedMenu)
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
