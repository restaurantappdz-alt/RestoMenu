import { cn } from '@/lib/utils'

const LAYOUT_VISUALS = {
  classic: {
    gradient: 'from-amber-900/40 to-amber-700/20',
    border: 'border-amber-500/50',
    selectedBorder: 'ring-2 ring-amber-400',
    bg: 'bg-amber-950/30',
    icon: '✦',
    label: 'Classic Gold',
  },
  bistro: {
    gradient: 'from-stone-800/60 to-stone-900/40',
    border: 'border-stone-600/40',
    selectedBorder: 'ring-2 ring-stone-400',
    bg: 'bg-stone-900/30',
    icon: '✎',
    label: 'Bistro Chalkboard',
  },
  brasserie: {
    gradient: 'from-red-950/50 to-red-900/30',
    border: 'border-red-800/40',
    selectedBorder: 'ring-2 ring-red-500',
    bg: 'bg-red-950/30',
    icon: '⚜',
    label: 'Brasserie',
  },
  coffeeShop: {
    gradient: 'from-amber-950/60 to-amber-900/40',
    border: 'border-amber-800/40',
    selectedBorder: 'ring-2 ring-amber-600',
    bg: 'bg-amber-950/30',
    icon: '☕',
    label: 'Coffee Shop',
  },
  minimal: {
    gradient: 'from-gray-100/10 to-white/5',
    border: 'border-gray-600/30',
    selectedBorder: 'ring-2 ring-gray-300',
    bg: 'bg-gray-900/20',
    icon: '◻',
    label: 'Minimal',
  },
  modern: {
    gradient: 'from-sky-950/50 to-blue-900/30',
    border: 'border-sky-800/40',
    selectedBorder: 'ring-2 ring-sky-500',
    bg: 'bg-sky-950/30',
    icon: '◆',
    label: 'Modern',
  },
  moroccan: {
    gradient: 'from-orange-950/50 to-red-900/30',
    border: 'border-orange-800/40',
    selectedBorder: 'ring-2 ring-orange-500',
    bg: 'bg-orange-950/30',
    icon: 'ⵣ',
    label: 'Moroccan',
  },
  natureBistro: {
    gradient: 'from-emerald-950/50 to-green-900/30',
    border: 'border-emerald-800/40',
    selectedBorder: 'ring-2 ring-emerald-500',
    bg: 'bg-emerald-950/30',
    icon: '🌿',
    label: 'Nature Bistro',
  },
  pro: {
    gradient: 'from-zinc-800/60 via-zinc-900/40 to-zinc-950/50',
    border: 'border-zinc-600/40',
    selectedBorder: 'ring-2 ring-amber-400',
    bg: 'bg-zinc-900/30',
    icon: '★',
    label: 'Pro Premium',
  },
}

export default function LayoutPicker({ value, onValueChange, options }) {
  const pickerOptions = options || Object.entries(LAYOUT_VISUALS).map(([k, v]) => ({ value: k, label: v.label }))

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {pickerOptions.map((opt) => {
        const visual = LAYOUT_VISUALS[opt.value]
        if (!visual) {
          return (
            <button
              key={opt.value}
              onClick={() => onValueChange(opt.value)}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-3 transition-all text-xs',
                value === opt.value
                  ? 'border-gold bg-gold/10 ring-1 ring-gold text-gold'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300',
              )}
            >
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          )
        }

        const isSelected = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onValueChange(opt.value)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-all',
              visual.bg,
              visual.border,
              isSelected ? visual.selectedBorder : 'hover:brightness-125',
            )}
          >
            <div
              className={cn(
                'w-full rounded-md bg-gradient-to-br aspect-video flex items-center justify-center',
                visual.gradient,
              )}
            >
              <span className="text-lg opacity-60">{visual.icon}</span>
            </div>
            <span
              className={cn(
                'text-xs font-medium text-center leading-tight',
                isSelected ? 'text-gold' : 'text-zinc-400',
              )}
            >
              {visual.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
