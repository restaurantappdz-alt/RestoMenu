export default function TVPreview({ menu, restaurantId }) {
  if (!menu) return null

  const selectedLayout = menu.selectedLayout || 'classic'

  const LAYOUT_LABELS = {
    classic: 'Classic Gold',
    bistro: 'Bistro Chalkboard',
    brasserie: 'Brasserie',
    coffeeShop: 'Coffee Shop',
    minimal: 'Minimal',
    modern: 'Modern',
    moroccan: 'Moroccan',
    natureBistro: 'Nature Bistro',
    pro: 'Pro Premium',
  }

  const tvUrl = restaurantId
    ? `https://restaurantappdz-alt.github.io/RestoMenu/?r=${restaurantId}`
    : null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          Layout: <span className="text-gold">{LAYOUT_LABELS[selectedLayout] || selectedLayout}</span>
        </p>
        <p className="text-xs text-zinc-600">Live preview — saves reflect instantly</p>
      </div>
      <div className="rounded-xl overflow-hidden border border-zinc-800/50 bg-black shadow-2xl" style={{ aspectRatio: '16 / 9' }}>
        {tvUrl ? (
          <iframe
            src={tvUrl}
            className="w-full h-full border-0"
            title="TV Preview"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-zinc-600">No restaurant ID</p>
          </div>
        )}
      </div>
    </div>
  )
}
