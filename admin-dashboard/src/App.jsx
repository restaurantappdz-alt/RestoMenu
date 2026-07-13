import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { onRestaurantsSnapshot, createRestaurant } from './api'
import { RestaurantProvider } from './RestaurantContext'
import { toast } from 'sonner'
import LoginPage from './components/LoginPage'
import MenuList from './components/MenuList'

function SetupRestaurant({ user, onDone }) {
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      const id = await createRestaurant(name.trim(), user.uid)
      onDone(id, name.trim())
    } catch (e) {
      console.error(e)
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-gold">Welcome to RestoMenu</h1>
          <p className="text-zinc-400 mt-2">Name your restaurant to get started</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="e.g., Le Petit Bistro"
            className="w-full bg-transparent border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-gold transition-colors"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="w-full bg-gold text-[#0D0D0D] font-semibold py-2.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            {creating ? 'Setting up...' : 'Create Restaurant'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [restaurantId, setRestaurantId] = useState(null)
  const [restaurantName, setRestaurantName] = useState('')
  const [resolvingRestaurant, setResolvingRestaurant] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!user) {
      setRestaurantId(null)
      return
    }
    setResolvingRestaurant(true)
    const unsub = onRestaurantsSnapshot(user.uid, (list) => {
      if (list.length > 0) {
        setRestaurantId(list[0].id)
        setRestaurantName(list[0].name)
      } else {
        setRestaurantId(null)
        setRestaurantName('')
      }
      setResolvingRestaurant(false)
    })
    return unsub
  }, [user])

  const handleSetupDone = (id, name) => {
    setRestaurantId(id)
    setRestaurantName(name)
  }

  if (loading || resolvingRestaurant) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0D0D0D]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  if (!restaurantId) return <SetupRestaurant user={user} onDone={handleSetupDone} />

  const tvLink = `https://restaurantappdz-alt.github.io/RestoMenu/?r=${restaurantId}`

  return (
    <RestaurantProvider restaurantId={restaurantId} restaurantName={restaurantName} tvLink={tvLink}>
      <div className="min-h-screen bg-[#0D0D0D]">
        <header className="border-b border-zinc-800 bg-[#0D0D0D]/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍽️</span>
              <h1 className="text-xl font-display font-bold text-gold tracking-wide">
                RestoMenu
              </h1>
              <span className="hidden sm:inline text-xs text-zinc-500 ml-2">Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="text-zinc-600">TV Link:</span>
                <span className="text-zinc-400 font-mono max-w-[200px] truncate">{tvLink}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(tvLink); toast.success('TV link copied!') }}
                  className="text-gold hover:text-gold/80 transition-colors"
                  title="Copy TV link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
              </div>
              <span className="text-sm text-zinc-400 hidden sm:block">
                {user.email}
              </span>
              <button
                onClick={() => auth.signOut()}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <MenuList />
        </main>
      </div>
    </RestaurantProvider>
  )
}
