import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export default function ItemRow({ item, onUpdate, onDelete }) {
  const [name, setName] = useState(item.name)
  const [price, setPrice] = useState(String(item.price))

  const save = () => {
    const trimmed = name.trim()
    const parsed = parseFloat(price)
    if (!trimmed) return
    if (isNaN(parsed) || parsed < 0) return
    if (trimmed !== item.name || parsed !== item.price) {
      onUpdate({ name: trimmed, price: parsed })
    }
  }

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-zinc-800/50 transition-colors group animate-fade-in">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
        className="h-7 text-sm bg-transparent border-0 border-b border-transparent hover:border-zinc-700 focus:border-gold px-0 py-0 rounded-none flex-1"
      />
      <div className="flex items-center gap-1 shrink-0">
        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          type="number"
          min="0"
          className="h-7 text-sm w-20 text-right bg-transparent border-0 border-b border-transparent hover:border-zinc-700 focus:border-gold px-0 py-0 rounded-none"
        />
        <span className="text-xs text-zinc-600 w-7">D.A</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 text-zinc-600 hover:text-red-400"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}
