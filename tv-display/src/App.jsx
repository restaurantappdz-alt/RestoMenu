import { useState, useEffect } from 'react'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from './firebase'

const CACHE_KEY = 'restomenu-tv-cache'

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {}
}

export default function App() {
  const [menu, setMenu] = useState(loadCache)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState(null)

  useEffect(() => {
    const unsubConfig = onSnapshot(
      doc(db, 'config', 'display'),
      (snap) => {
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
      },
      () => {
        setOffline(true)
        setLoading(false)
      },
    )

    return () => unsubConfig()
  }, [])

  useEffect(() => {
    if (!activeMenuId) return

    setOffline(false)
    setLoading(true)

    const unsubMenu = onSnapshot(
      doc(db, 'menus', activeMenuId),
      (snap) => {
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() }
          setMenu(data)
          saveCache(data)
          setOffline(false)
        } else {
          setMenu(null)
        }
        setLoading(false)
      },
      () => {
        setOffline(true)
        setLoading(false)
      },
    )

    return () => unsubMenu()
  }, [activeMenuId])

  if (waiting) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center top, #1a1410 0%, #0D0D0D 70%)' }}>
        <div className="text-center animate-fade-in-up">
          <div className="text-7xl mb-6 opacity-50">🍽️</div>
          <h2 className="text-3xl font-display font-bold text-zinc-600">Waiting for Menu</h2>
          <p className="text-zinc-700 text-lg mt-2">Select a menu from the admin dashboard</p>
        </div>
      </div>
    )
  }

  if (loading && !menu) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center top, #1a1410 0%, #0D0D0D 70%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-lg">Loading menu...</p>
        </div>
      </div>
    )
  }

  if (!menu) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center top, #1a1410 0%, #0D0D0D 70%)' }}>
        <div className="text-center animate-fade-in-up">
          <h2 className="text-3xl font-display font-bold text-zinc-600">Menu Not Found</h2>
          <p className="text-zinc-700 text-lg mt-2">Please select a different menu</p>
        </div>
      </div>
    )
  }

  const categories = menu.categories || []

  return (
    <div className="h-full w-full flex flex-col overflow-hidden p-6 md:p-8 lg:p-12 xl:p-16" style={{
      background: 'radial-gradient(ellipse at center top, #1a1410 0%, #0D0D0D 70%)',
    }}>
      {offline && (
        <div className="offline-mode">Offline Mode — showing cached menu</div>
      )}

      {/* Restaurant Name */}
      <div className="text-center mb-6 md:mb-8 lg:mb-10 shrink-0 animate-fade-in-up">
        <h1
          className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold tracking-[0.05em] uppercase text-shadow-gold"
          style={{ color: '#D4AF37' }}
        >
          {menu.name}
        </h1>
        <div className="w-24 h-0.5 mx-auto mt-3 md:mt-4 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-600 text-2xl">No items yet</p>
        </div>
      ) : (
        <div
          className="flex-1 grid gap-4 md:gap-6 lg:gap-8 content-start"
          style={{
            gridTemplateColumns: `repeat(${Math.min(categories.length, 3)}, 1fr)`,
          }}
        >
          {categories.map((cat, i) => {
            const items = cat.items || []
            const addons = cat.addons || []
            return (
              <div
                key={i}
                className={`glass-card rounded-2xl p-5 md:p-6 lg:p-8 animate-fade-in-up ${
                  i === 0 ? '' : i === 1 ? 'animate-fade-in-up-delay-1' : i === 2 ? 'animate-fade-in-up-delay-2' : 'animate-fade-in-up-delay-3'
                }`}
              >
                <h2
                  className="text-xl md:text-2xl lg:text-3xl font-display font-bold mb-4 md:mb-5 lg:mb-6 pb-3 border-b text-shadow-gold"
                  style={{ color: '#D4AF37', borderColor: 'rgba(212, 175, 55, 0.2)' }}
                >
                  {cat.name}
                </h2>

                <div className="space-y-1.5 md:space-y-2 lg:space-y-3">
                  {items.map((item, j) => (
                    <div key={j} className="menu-item-row">
                      <span
                        className="text-base md:text-lg lg:text-xl text-zinc-100 font-medium truncate text-shadow-white"
                      >
                        {item.name}
                      </span>
                      <div className="dots" />
                      <span
                        className="text-base md:text-lg lg:text-xl font-bold shrink-0 text-shadow-white"
                        style={{ color: '#D4AF37' }}
                      >
                        {item.price}
                        <span className="text-xs md:text-sm font-normal ml-1" style={{ color: 'rgba(212, 175, 55, 0.7)' }}>D.A</span>
                      </span>
                    </div>
                  ))}
                </div>

                {addons.length > 0 && (
                  <div className="mt-4 md:mt-5 lg:mt-6 pt-3 md:pt-4 space-y-1 md:space-y-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(212, 175, 55, 0.4)' }}>
                      Add-ons
                    </p>
                    {addons.map((addon, j) => (
                      <div key={j} className="flex justify-between items-baseline gap-2">
                        <span className="text-sm md:text-base italic" style={{ color: 'rgba(212, 175, 55, 0.65)' }}>
                          + {addon.name}
                        </span>
                        <span className="text-sm md:text-base shrink-0" style={{ color: 'rgba(212, 175, 55, 0.5)' }}>
                          {addon.price}
                          <span className="text-xs ml-0.5">D.A</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
