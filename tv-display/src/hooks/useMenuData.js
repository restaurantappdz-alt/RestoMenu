import { useState, useEffect } from 'react'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '../firebase'

const RESTAURANT_ID_KEY = 'restomenu-tv-restaurant'
const CACHE_KEY_PREFIX = 'restomenu-tv-cache'

function getRestaurantId() {
  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('r')
  if (fromUrl) {
    try { localStorage.setItem(RESTAURANT_ID_KEY, fromUrl) } catch {}
    return fromUrl
  }
  try { return localStorage.getItem(RESTAURANT_ID_KEY) } catch { return null }
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

export default function useMenuData() {
  const [restaurantId, setRestaurantId] = useState(getRestaurantId)
  const [menu, setMenu] = useState(() => restaurantId ? loadCache(restaurantId) : null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState(null)

  useEffect(() => {
    const id = getRestaurantId()
    setRestaurantId(id)
    if (!id) {
      setNeedsSetup(true)
      setLoading(false)
      return
    }
    setNeedsSetup(false)
    setMenu(loadCache(id))

    const unsubConfig = onSnapshot(doc(db, 'restaurants', id, 'config', 'display'), (snap) => {
      const data = snap.data()
      const newId = data?.activeMenuId || null
      if (!newId) {
        setWaiting(true)
        setLoading(false)
        setMenu(null)
        setActiveMenuId(null)
        return
      }
      setWaiting(false)
      setActiveMenuId(newId)
    }, () => {
      setOffline(true)
      setLoading(false)
    })
    return () => unsubConfig()
  }, [])

  useEffect(() => {
    if (!activeMenuId || !restaurantId) return
    setOffline(false)
    setLoading(true)
    const unsubMenu = onSnapshot(doc(db, 'restaurants', restaurantId, 'menus', activeMenuId), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() }
        setMenu(data)
        saveCache(restaurantId, data)
        setOffline(false)
      } else {
        setMenu(null)
      }
      setLoading(false)
    }, () => {
      setOffline(true)
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
