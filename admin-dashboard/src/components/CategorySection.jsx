import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus, Pizza } from 'lucide-react'
import ItemRow from './ItemRow'
import AddonRow from './AddonRow'

export default function CategorySection({ category, index, onUpdate, onDelete, layoutMaxItems, categoryItemsCounts }) {
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(category.name)
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newAddonName, setNewAddonName] = useState('')
  const [newAddonPrice, setNewAddonPrice] = useState('')

  const items = category.items || []
  const addons = category.addons || []

  const saveName = () => {
    if (nameInput.trim()) {
      onUpdate({ ...category, name: nameInput.trim() })
    } else {
      setNameInput(category.name)
    }
    setEditingName(false)
  }

  const totalItems = (categoryItemsCounts || []).reduce((s, c) => s + c, 0)
  const atMax = layoutMaxItems != null && totalItems >= layoutMaxItems

  const addItem = () => {
    if (!newItemName.trim()) return
    if (atMax) {
      toast.error(`Maximum items reached for this layout (${layoutMaxItems})`)
      return
    }
    const price = parseFloat(newItemPrice)
    if (isNaN(price) || price < 0) return
    const updated = {
      ...category,
      items: [...items, { name: newItemName.trim(), price }],
    }
    onUpdate(updated)
    setNewItemName('')
    setNewItemPrice('')
  }

  const updateItem = (itemIndex, updatedItem) => {
    const updated = {
      ...category,
      items: items.map((it, i) => (i === itemIndex ? updatedItem : it)),
    }
    onUpdate(updated)
  }

  const deleteItem = (itemIndex) => {
    const updated = {
      ...category,
      items: items.filter((_, i) => i !== itemIndex),
    }
    onUpdate(updated)
  }

  const addAddon = () => {
    if (!newAddonName.trim()) return
    const price = parseFloat(newAddonPrice)
    if (isNaN(price) || price < 0) return
    const updated = {
      ...category,
      addons: [...addons, { name: newAddonName.trim(), price }],
    }
    onUpdate(updated)
    setNewAddonName('')
    setNewAddonPrice('')
  }

  const updateAddon = (addonIndex, updatedAddon) => {
    const updated = {
      ...category,
      addons: addons.map((a, i) => (i === addonIndex ? updatedAddon : a)),
    }
    onUpdate(updated)
  }

  const deleteAddon = (addonIndex) => {
    const updated = {
      ...category,
      addons: addons.filter((_, i) => i !== addonIndex),
    }
    onUpdate(updated)
  }

  return (
    <Card className="border-zinc-800/50 animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
        <div className="flex items-center gap-3 flex-1">
          <Pizza className="w-5 h-5 text-gold shrink-0" />
          {editingName ? (
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              className="text-lg font-semibold bg-transparent border-0 border-b border-gold/50 px-0 py-0 h-auto rounded-none"
              autoFocus
            />
          ) : (
            <CardTitle
              className="text-lg text-zinc-200 cursor-pointer hover:text-gold transition-colors"
              onClick={() => setEditingName(true)}
              title="Click to rename"
            >
              {category.name}
            </CardTitle>
          )}
          <span className="text-xs text-zinc-600">
            {items.length} item{items.length !== 1 ? 's' : ''}
            {addons.length > 0 && ` · ${addons.length} add-on${addons.length !== 1 ? 's' : ''}`}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-zinc-600 hover:text-red-400 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-5">
        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Items</h4>
              {layoutMaxItems != null && (
                <span className="text-xs text-zinc-600">
                  ({layoutMaxItems} max)
                </span>
              )}
            </div>
            <span className="text-xs text-zinc-600">Name · Price (D.A)</span>
          </div>
          <div className="space-y-1">
            {items.map((item, i) => (
              <ItemRow
                key={i}
                item={item}
                onUpdate={(updated) => updateItem(i, updated)}
                onDelete={() => deleteItem(i)}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Input
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="h-8 text-sm flex-1"
            />
            <Input
              placeholder="Price"
              type="number"
              min="0"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              className="h-8 text-sm w-24"
            />
            <Button size="sm" variant="ghost" onClick={addItem} disabled={atMax} className="shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Add-ons */}
        <div>
          <div className="flex items-center justify-between mb-3 pt-3 border-t border-zinc-800/50">
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Add-ons</h4>
            <span className="text-xs text-zinc-600">Optional extras</span>
          </div>
          <div className="space-y-1">
            {addons.map((addon, i) => (
              <AddonRow
                key={i}
                addon={addon}
                onUpdate={(updated) => updateAddon(i, updated)}
                onDelete={() => deleteAddon(i)}
              />
            ))}
            {addons.length === 0 && (
              <p className="text-xs text-zinc-600 italic">No add-ons yet</p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Input
              placeholder="Add-on name"
              value={newAddonName}
              onChange={(e) => setNewAddonName(e.target.value)}
              className="h-8 text-sm flex-1"
            />
            <Input
              placeholder="Price"
              type="number"
              min="0"
              value={newAddonPrice}
              onChange={(e) => setNewAddonPrice(e.target.value)}
              className="h-8 text-sm w-24"
            />
            <Button size="sm" variant="ghost" onClick={addAddon} className="shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
