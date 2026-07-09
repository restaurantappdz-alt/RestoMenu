import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import LoginPage from './components/LoginPage'
import MenuList from './components/MenuList'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) {
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

  return (
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
  )
}
