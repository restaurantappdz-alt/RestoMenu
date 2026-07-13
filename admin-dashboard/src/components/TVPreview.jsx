export default function TVPreview({ menu }) {
  if (!menu) return null

  const categories = menu.categories || []
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

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-800/50 bg-[#0D0D0D] shadow-2xl" style={{ aspectRatio: '16 / 9' }}>
      <div
        className="w-full h-full overflow-hidden p-6 sm:p-8 md:p-10 flex flex-col"
        style={{
          background: 'radial-gradient(ellipse at center top, #1a1410 0%, #0D0D0D 70%)',
        }}
      >
        <div className="text-center mb-4 md:mb-6 shrink-0">
          <h1
            className="text-2xl md:text-4xl font-display font-bold tracking-wider"
            style={{ color: '#D4AF37', textShadow: '0 0 40px rgba(212, 175, 55, 0.3), 0 2px 4px rgba(0, 0, 0, 0.5)' }}
          >
            {menu.name}
          </h1>
          <p className="text-xs text-zinc-600 mt-2">
            Layout: <span className="text-gold">{LAYOUT_LABELS[selectedLayout] || selectedLayout}</span>
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-zinc-600 text-lg">No categories yet</p>
          </div>
        ) : (
          <div
            className="flex-1 grid gap-4 md:gap-6 content-start"
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
                  className="rounded-xl p-4 md:p-5"
                  style={{
                    background: 'rgba(24, 24, 27, 0.75)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(212, 175, 55, 0.15)',
                  }}
                >
                  <h2
                    className="text-base md:text-lg font-display font-semibold mb-3 md:mb-4 pb-2 border-b"
                    style={{ color: '#D4AF37', borderColor: 'rgba(212, 175, 55, 0.2)' }}
                  >
                    {cat.name}
                  </h2>

                  <div className="space-y-1.5 md:space-y-2">
                    {items.map((item, j) => (
                      <div key={j} className="flex justify-between items-baseline gap-2">
                        <span
                          className="text-sm md:text-base text-zinc-100 font-medium truncate"
                          style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}
                        >
                          {item.name}
                        </span>
                        <div className="flex-1 min-w-[8px] h-px mx-1 md:mx-2" style={{ borderBottom: '1px dashed rgba(255,255,255,0.1)' }} />
                        <span
                          className="text-sm md:text-base font-semibold shrink-0"
                          style={{ color: '#D4AF37' }}
                        >
                          {item.price} D.A
                        </span>
                      </div>
                    ))}
                  </div>

                  {addons.length > 0 && (
                    <div className="mt-3 md:mt-4 pt-2 md:pt-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {addons.map((addon, j) => (
                        <div key={j} className="flex justify-between items-baseline gap-2">
                          <span
                            className="text-xs md:text-sm italic"
                            style={{ color: 'rgba(212, 175, 55, 0.7)' }}
                          >
                            + {addon.name}
                          </span>
                          <span
                            className="text-xs md:text-sm shrink-0"
                            style={{ color: 'rgba(212, 175, 55, 0.6)' }}
                          >
                            {addon.price} D.A
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
    </div>
  )
}
