import { useState, useEffect } from 'react'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '../firebase'

const RESTAURANT_ID_KEY = 'restomenu-tv-restaurant'
const CACHE_KEY_PREFIX = 'restomenu-tv-cache'
const CONFIG_CACHE_KEY_PREFIX = 'restomenu-tv-config'

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
    const cachedCfg = loadConfigCache(rid)
    if (!cachedMenu || !cachedCfg) return null
    const sid = getScreenId()
    const raw = sid ? cachedCfg.screens?.[sid] : cachedCfg.activeMenuId
    const expectedId = (raw && typeof raw === 'object' ? raw.menuId : raw) || null
    return cachedMenu.id === expectedId ? cachedMenu : null
  })
  const [loading, setLoading] = useState(() => {
    const rid = getRestaurantId()
    if (!rid) return true
    const cachedMenu = loadCache(rid)
    const cachedCfg = loadConfigCache(rid)
    if (!cachedMenu || !cachedCfg) return true
    const sid = getScreenId()
    const raw = sid ? cachedCfg.screens?.[sid] : cachedCfg.activeMenuId
    const expectedId = (raw && typeof raw === 'object' ? raw.menuId : raw) || null
    return cachedMenu.id !== expectedId
  })
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine)
  const [waiting, setWaiting] = useState(() => {
    const rid = getRestaurantId()
    if (!rid) return false
    const cached = loadConfigCache(rid)
    if (!cached) return false
    const sid = getScreenId()
    const raw = sid ? cached.screens?.[sid] : cached.activeMenuId
    return !((raw && typeof raw === 'object' ? raw.menuId : raw) || null)
  })
  const [needsSetup, setNeedsSetup] = useState(false)

  console.log('📊 useMenuData init:', { restaurantId, activeMenuId, menu: menu?.id, loading, offline, waiting, needsSetup })

  useEffect(() => {
    const handleOnline = () => {
      console.log('📶 back online — reloading for live data')
      setTimeout(() => window.location.reload(), 1000)
    }
    const handleOffline = () => { console.log('📶 offline event'); setOffline(true) }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
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

    const unsubConfig = onSnapshot(doc(db, 'restaurants', id, 'config', 'display'), (snap) => {
      console.log('🔥 Config snapshot received:', snap.id, snap.metadata.hasPendingWrites)
      const data = snap.data() || {}
      saveConfigCache(id, data)
      const raw = screenId ? data.screens?.[screenId] : data.activeMenuId
      const newId = (raw && typeof raw === 'object' ? raw.menuId : raw) || null
      if (!newId) {
        if (mountedOffline || (typeof navigator !== 'undefined' && !navigator.onLine)) {
          const cachedCfg = loadConfigCache(id)
          const cachedRaw = screenId ? cachedCfg?.screens?.[screenId] : cachedCfg?.activeMenuId
          const cachedId = cachedCfg && (cachedRaw && typeof cachedRaw === 'object' ? cachedRaw.menuId : cachedRaw) || null
          if (cachedId) {
            console.log('⏳ Config has no menu but cache has', cachedId, '— trusting cache')
            return
          }
        }
        console.log('⏳ No menu assigned → waiting screen')
        setWaiting(true)
        setLoading(false)
        setMenu(null)
        setActiveMenuId(null)
        return
      }
      setWaiting(false)
      setActiveMenuId(newId)
      console.log('✅ Config OK → activeMenuId:', newId)
    }, (error) => {
      console.log('❌ Config listener error:', error.code, error.message)
      setLoading(false)
    })
    return () => unsubConfig()
  }, [])

  useEffect(() => {
    console.log('🍽️ Menu listener effect fired:', { activeMenuId, restaurantId })
    if (!activeMenuId || !restaurantId) return
    setLoading(true)
    const unsubMenu = onSnapshot(doc(db, 'restaurants', restaurantId, 'menus', activeMenuId), (snap) => {
      console.log('🍽️ Menu snapshot received:', snap.id, 'exists:', snap.exists(), 'pending:', snap.metadata.hasPendingWrites)
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() }
        setMenu(data)
        saveCache(restaurantId, data)
      } else {
        const cachedMenu = loadCache(restaurantId)
        if (cachedMenu && cachedMenu.id === activeMenuId) {
          console.log('🍽️ Menu doc deleted on server, but cache has it — keeping')
          return
        }
        setMenu(null)
      }
      setLoading(false)
    }, (error) => {
      console.log('❌ Menu listener error:', error.code, error.message)
      setLoading(false)
    })
    return () => unsubMenu()
  }, [activeMenuId, restaurantId])

  const categories = menu?.categories || []
  const allAddons = categories.flatMap((c) => c.addons || [])
  const selectedLayout = menu?.selectedLayout || 'classic'

  return {
    menu,
    loading,
    offline,
    waiting,
    needsSetup,
    categories,
    allAddons,
    selectedLayout,
  }
}
