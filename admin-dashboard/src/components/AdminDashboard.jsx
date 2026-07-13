import { useState, useEffect } from 'react'
import { auth } from '@/firebase'
import { onAllRestaurantsSnapshot, onRestaurantDoc, updateRestaurant } from '@/api'
import { RestaurantProvider } from '@/RestaurantContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { LogOut, ArrowLeft, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import MenuList from './MenuList'

const ALL_LAYOUTS = [
  { value: 'classic', label: 'Classic Gold' },
  { value: 'bistro', label: 'Bistro Chalkboard' },
  { value: 'brasserie', label: 'Brasserie' },
  { value: 'coffeeShop', label: 'Coffee Shop' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'modern', label: 'Modern' },
  { value: 'moroccan', label: 'Moroccan' },
  { value: 'natureBistro', label: 'Nature Bistro' },
  { value: 'pro', label: 'Pro Premium' },
]

function LayoutAccessPanel({ restaurantId }) {
  const [availableLayouts, setAvailableLayouts] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = onRestaurantDoc(restaurantId, (data) => {
      setAvailableLayouts(data.availableLayouts || null)
    })
    return unsub
  }, [restaurantId])

  const toggle = async (value) => {
    setSaving(true)
    const current = availableLayouts || []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    try {
      await updateRestaurant(restaurantId, { availableLayouts: next.length === 0 ? [] : next })
      toast.success('Layout access updated')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const currentList = availableLayouts || ALL_LAYOUTS.map((l) => l.value)

  return (
    <Card className="border-zinc-800/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-zinc-300 uppercase tracking-wider">
          Layout Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-zinc-500 mb-4">
          Check which layouts this restaurant can use. Unchecked layouts won't appear in their editor.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ALL_LAYOUTS.map((layout) => {
            const enabled = currentList.includes(layout.value)
            return (
              <button
                key={layout.value}
                onClick={() => toggle(layout.value)}
                disabled={saving}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                  enabled
                    ? 'bg-gold/10 text-gold border border-gold/30'
                    : 'bg-zinc-800/50 text-zinc-500 border border-transparent hover:border-zinc-700'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  enabled ? 'bg-gold border-gold' : 'border-zinc-600'
                }`}>
                  {enabled && <Check className="w-3 h-3 text-[#0D0D0D]" />}
                </div>
                {layout.label}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function RestaurantList({ restaurants, onSelect }) {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-gold">All Restaurants</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Click a restaurant to manage its menus and layout access
        </p>
      </div>
      {restaurants.length === 0 ? (
        <Card className="border-dashed border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-zinc-400 text-lg font-medium">No restaurants yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-zinc-800/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">TV Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurants.map((r) => {
                const tvLink = `https://restaurantappdz-alt.github.io/RestoMenu/?r=${r.id}`
                return (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer group"
                    onClick={() => onSelect(r)}
                  >
                    <TableCell className="font-medium text-zinc-200 group-hover:text-gold transition-colors">
                      {r.name}
                    </TableCell>
                    <TableCell className="text-zinc-400 font-mono text-xs">
                      {r.ownerUid?.slice(0, 16)}...
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(tvLink)
                          toast.success('TV link copied!')
                        }}
                        title="Copy TV link"
                      >
                        <Copy className="w-4 h-4 text-zinc-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}

export default function AdminDashboard({ user }) {
  const [restaurants, setRestaurants] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)

  useEffect(() => {
    const unsub = onAllRestaurantsSnapshot(setRestaurants)
    return unsub
  }, [])

  if (selectedRestaurant) {
    const tvLink = `https://restaurantappdz-alt.github.io/RestoMenu/?r=${selectedRestaurant.id}`
    return (
      <RestaurantProvider
        restaurantId={selectedRestaurant.id}
        restaurantName={selectedRestaurant.name}
        tvLink={tvLink}
      >
        <div className="min-h-screen bg-[#0D0D0D]">
          <header className="border-b border-zinc-800 bg-[#0D0D0D]/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setSelectedRestaurant(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-2xl">🍽️</span>
                <h1 className="text-xl font-display font-bold text-gold tracking-wide">
                  {selectedRestaurant.name}
                </h1>
                <span className="text-xs text-zinc-500 ml-2 bg-gold/10 text-gold px-2 py-0.5 rounded">Admin</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <span className="text-zinc-600">TV Link:</span>
                  <span className="text-zinc-400 font-mono max-w-[200px] truncate">{tvLink}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(tvLink); toast.success('TV link copied!') }}
                    className="text-gold hover:text-gold/80"
                    title="Copy TV link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-sm text-zinc-400 hidden sm:block">{user.email}</span>
                <button
                  onClick={() => auth.signOut()}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-600 flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <MenuList />
            <LayoutAccessPanel restaurantId={selectedRestaurant.id} />
          </main>
        </div>
      </RestaurantProvider>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <header className="border-b border-zinc-800 bg-[#0D0D0D]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <h1 className="text-xl font-display font-bold text-gold tracking-wide">RestoMenu</h1>
            <span className="text-xs text-zinc-500 ml-2 bg-gold/10 text-gold px-2 py-0.5 rounded">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400 hidden sm:block">{user.email}</span>
            <button
              onClick={() => auth.signOut()}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-600 flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" /> Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <RestaurantList
          restaurants={restaurants}
          onSelect={(r) => setSelectedRestaurant(r)}
        />
      </main>
    </div>
  )
}
