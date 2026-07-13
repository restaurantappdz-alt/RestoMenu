import { useState } from 'react'
import { Copy, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { addScreen, removeScreen } from '@/api'
import { useRestaurant } from '@/RestaurantContext'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

function lookupMenuName(menuId, menus) {
  if (!menuId) return null
  const menu = menus.find((m) => m.id === menuId)
  if (!menu) return 'DELETED'
  return menu.name
}

export default function ScreenManager({ screens, menus }) {
  const { restaurantId } = useRestaurant()
  const [addOpen, setAddOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [label, setLabel] = useState('')
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState(false)

  const sorted = Object.entries(screens || {}).sort(([, a], [, b]) =>
    a.label.localeCompare(b.label)
  )

  const handleAdd = async () => {
    if (!label.trim()) return
    setAdding(true)
    try {
      await addScreen(restaurantId, label.trim())
      toast.success(`Screen "${label}" added`)
      setLabel('')
      setAddOpen(false)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    setRemoving(true)
    try {
      await removeScreen(restaurantId, removeTarget.id)
      toast.success(`Screen "${removeTarget.label}" removed`)
      setRemoveTarget(null)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setRemoving(false)
    }
  }

  const handleCopy = (screenId) => {
    const url = `https://restaurantappdz-alt.github.io/RestoMenu/?r=${restaurantId}&s=${screenId}`
    navigator.clipboard.writeText(url)
    toast.success('TV link copied!')
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">TV Screens</h3>
        <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> Add Screen
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-zinc-600">No screens yet. Add one to start assigning menus.</p>
      ) : (
        <div className="space-y-1.5">
          {sorted.map(([id, screen]) => {
            const menuName = lookupMenuName(screen.menuId, menus)
            return (
              <div key={id} className="flex items-center gap-3 text-sm py-1.5 px-2 rounded-lg hover:bg-zinc-800/40 transition-colors">
                <span className="text-zinc-200 font-medium min-w-[120px]">{screen.label}</span>
                <span className={`text-xs ${menuName === 'DELETED' ? 'text-red-400' : menuName ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {menuName === 'DELETED' ? 'Menu deleted' : menuName || 'No menu assigned'}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(id)}
                    className="text-zinc-500 hover:text-gold transition-colors p-1"
                    title="Copy TV link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setRemoveTarget({ id, label: screen.label })}
                    className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                    title="Remove screen"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Screen Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Screen</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="e.g., Bar TV"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-gold transition-colors text-sm"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setAddOpen(false); setLabel('') }}>Cancel</Button>
            <Button onClick={handleAdd} disabled={adding || !label.trim()}>
              {adding ? 'Adding...' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Screen</DialogTitle>
            <DialogDescription>
              Remove "{removeTarget?.label}"? Any menu assigned to this screen will be unlinked.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button onClick={handleRemove} disabled={removing} className="bg-red-600 hover:bg-red-700 text-white">
              {removing ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
