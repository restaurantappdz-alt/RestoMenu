import { useState, useEffect } from 'react'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '../firebase'

const CACHE_KEY = 'restomenu-tv-cache'

function loadCache() {
  try { const raw = localStorage.getItem(CACHE_KEY); return raw ? JSON.parse(raw) : null }
  catch { return null }
}
function saveCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)) } catch {}
}

export default function useMenuData() {
  const [menu, setMenu] = useState(loadCache)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState(null)

  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, 'config', 'display'), (snap) => {
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
    if (!activeMenuId) return
    setOffline(false)
    setLoading(true)
    const unsubMenu = onSnapshot(doc(db, 'menus', activeMenuId), (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() }
        setMenu(data)
        saveCache(data)
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
  }, [activeMenuId])

  const categories = menu?.categories || []
  const allAddons = categories.flatMap((c) => c.addons || [])
  const selectedLayout = menu?.selectedLayout || 'classic'

  return {
    menu,
    loading,
    offline,
    waiting,
    categories,
    allAddons,
    selectedLayout,
  }
}
