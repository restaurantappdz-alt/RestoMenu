import { getLayout } from '../layouts'

export default function TVPreview({ menu }) {
  if (!menu) return null

  const selectedLayout = menu.selectedLayout || 'classic'
  const LayoutComponent = getLayout(selectedLayout)
  const categories = menu.categories || []
  const allAddons = categories.flatMap((c) => c.addons || [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          Layout: <span className="text-gold">{selectedLayout}</span>
        </p>
        <p className="text-xs text-zinc-600">Preview — saves reflect instantly</p>
      </div>
      <div className="rounded-xl overflow-hidden border border-zinc-800/50 shadow-2xl bg-black" style={{ aspectRatio: '16 / 9' }}>
        <div className="w-full h-full [&_*]:!cursor-default">
          <LayoutComponent
            categories={categories}
            allAddons={allAddons}
            offline={false}
            menu={menu}
            title={menu.name}
          />
        </div>
      </div>
    </div>
  )
}
