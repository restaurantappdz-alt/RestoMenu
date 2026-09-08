import React from 'react'

export const capabilities = {
  id: 'digitalBoard',
  name: 'Digital Board Grid',
  maxItems: 8,
  supportsItemImages: true,
  supportsDescriptions: true,
  supportsTags: true,
  supportsHeroPhoto: false,
  supportsCategoryHeaders: false,
  displayMode: 'full-menu',
  hasHeader: false,
  hasFooter: false,
}

function FallbackDishIcon() {
  return (
    <svg
      className="w-10 h-10 text-[#064e3b]/30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  )
}

function CardPhoto({ src, alt, heightPercent }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-t bg-slate-100 flex items-center justify-center border-b border-[#064e3b]/20"
      style={{ height: heightPercent }}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-slate-50 pointer-events-none">
        <FallbackDishIcon />
      </div>
      {src && (
        <img
          src={src}
          alt={alt || ''}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
    </div>
  )
}

function TopRowCard({ slot, currency }) {
  const hasContent = Boolean(slot.title || slot.price || slot.imageUrl)
  const formattedPrice = slot.price != null && slot.price !== '' ? `${slot.price} ${currency}` : ''

  return (
    <div
      className={`layout-digital-board-card flex flex-col h-full rounded-lg overflow-hidden border border-[#064e3b]/20 bg-white shadow-sm ${
        !hasContent ? 'is-empty' : ''
      }`}
    >
      {/* Photo slot: 70% height */}
      <CardPhoto src={slot.imageUrl} alt={slot.title} heightPercent="70%" />

      {/* Banner: 30% height */}
      <div
        className="bg-[#fef3c7] px-3 py-2 flex items-center justify-between gap-2 overflow-hidden"
        style={{ height: '30%' }}
      >
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <span className="text-[#064e3b] font-bold text-base line-clamp-1 leading-tight" dir="auto">
            {slot.title}
          </span>
          {slot.subtitle && (
            <span className="text-[#064e3b]/75 text-xs line-clamp-1 leading-snug mt-0.5">
              {slot.subtitle}
            </span>
          )}
        </div>
        {formattedPrice && (
          <div className="flex-shrink-0 text-right pl-2">
            <span className="text-[#064e3b] font-extrabold text-lg xl:text-xl tabular-nums whitespace-nowrap">
              {formattedPrice}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function BottomRowCard({ slot, currency }) {
  const hasContent = Boolean(
    slot.title || slot.price || slot.imageUrl || (slot.priceRows && slot.priceRows.length > 0)
  )
  const isMultiple =
    slot.priceType === 'multiple' && Array.isArray(slot.priceRows) && slot.priceRows.length > 0
  const formattedPrice = slot.price != null && slot.price !== '' ? `${slot.price} ${currency}` : ''

  return (
    <div
      className={`layout-digital-board-card flex flex-col h-full rounded-lg overflow-hidden border border-[#064e3b]/20 bg-white shadow-sm ${
        !hasContent ? 'is-empty' : ''
      }`}
    >
      {/* Photo slot: 55% height */}
      <CardPhoto src={slot.imageUrl} alt={slot.title} heightPercent="55%" />

      {/* Price panel: 45% height */}
      <div className="flex flex-col justify-between overflow-hidden" style={{ height: '45%' }}>
        {isMultiple ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {slot.title && (
              <div className="bg-[#fef3c7] px-2.5 py-1 border-b border-[#064e3b]/20 flex items-center justify-between flex-shrink-0">
                <span className="text-[#064e3b] font-bold text-xs line-clamp-1" dir="auto">
                  {slot.title}
                </span>
                {slot.subtitle && (
                  <span className="text-[#064e3b]/75 text-[10px] line-clamp-1 ml-1">
                    {slot.subtitle}
                  </span>
                )}
              </div>
            )}
            <div className="flex-1 flex flex-col justify-evenly">
              {slot.priceRows.map((row, idx) => {
                const isEven = idx % 2 === 0
                const rowPrice =
                  row.price != null && row.price !== '' ? `${row.price} ${currency}` : ''
                return (
                  <div
                    key={idx}
                    className={`flex-1 flex items-center justify-between px-3 py-1 ${
                      isEven ? 'bg-[#064e3b] text-white' : 'bg-[#ecfdf5] text-[#064e3b]'
                    }`}
                  >
                    <span className="font-medium text-xs line-clamp-1">
                      {row.label || row.name || ''}
                    </span>
                    <span className="font-bold tabular-nums text-xs whitespace-nowrap ml-2">
                      {rowPrice}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Single price: title banner and single price row */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Title banner */}
            <div className="h-1/2 bg-[#fef3c7] px-2.5 py-1 flex flex-col justify-center border-b border-[#064e3b]/20 overflow-hidden">
              <span className="text-[#064e3b] font-bold text-sm xl:text-base line-clamp-1" dir="auto">
                {slot.title}
              </span>
              {slot.subtitle && (
                <span className="text-[#064e3b]/75 text-xs line-clamp-1 mt-0.5">
                  {slot.subtitle}
                </span>
              )}
            </div>
            {/* Single price row */}
            <div className="h-1/2 bg-[#064e3b] text-white px-3 flex items-center justify-between overflow-hidden">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-100">
                Prix
              </span>
              <span className="font-extrabold tabular-nums text-base xl:text-lg whitespace-nowrap ml-2">
                {formattedPrice}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LayoutDigitalBoard({
  categories = [],
  allAddons = [],
  offline,
  menu = {},
  title,
}) {
  const currency = menu?.currency || 'DA'
  const configuredSlots = menu?.boardConfig?.slots || []
  const categoryItems = (categories || []).flatMap((c) => c.items || [])

  // Dynamic fallback: ensure exactly 8 slots
  const slots = []
  for (let i = 0; i < 8; i++) {
    if (i < configuredSlots.length && configuredSlots[i]) {
      const cfg = configuredSlots[i]
      slots.push({
        title: cfg.title || cfg.arabicTitle || cfg.titleAr || cfg.name || '',
        subtitle: cfg.subtitle || cfg.latinTitle || cfg.subtitleFr || cfg.description || '',
        price: cfg.price != null ? String(cfg.price) : '',
        imageUrl: cfg.imageUrl || cfg.image || cfg.photo || '',
        priceType:
          cfg.priceType ||
          (Array.isArray(cfg.priceRows) && cfg.priceRows.length > 0 ? 'multiple' : 'single'),
        priceRows: Array.isArray(cfg.priceRows) ? cfg.priceRows : [],
      })
    } else {
      const catItem = categoryItems[i - configuredSlots.length]
      if (catItem) {
        slots.push({
          title: catItem.name || '',
          subtitle: catItem.description || '',
          price: catItem.price != null ? String(catItem.price) : '',
          imageUrl: catItem.imageUrl || '',
          priceType: 'single',
          priceRows: [],
        })
      } else {
        slots.push({
          title: '',
          subtitle: '',
          price: '',
          imageUrl: '',
          priceType: 'single',
          priceRows: [],
        })
      }
    }
  }

  return (
    <div
      className="layout-digital-board-root h-full w-full overflow-hidden relative bg-[#f8fafc] border-[6px] border-[#064e3b]"
      style={{
        animation: 'pixelShift 300s linear infinite',
        fontFamily: '"Cairo", "Inter", system-ui, -apple-system, sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&family=Inter:wght@400;600;700&display=swap');
        @keyframes pixelShift { 0%, 99.9% { transform: translate(0,0); } 100% { transform: translate(2px,1px); } }

        /* Full responsive CSS block: stacks into 1-column scrollable cards for phone view (?phone=1) */
        @media (orientation: portrait) {
          .layout-digital-board-root {
            height: auto !important;
            min-height: 100vh !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            border-width: 3px !important;
            padding: 0.5rem !important;
          }
          .layout-digital-board-root .layout-digital-board-grid {
            display: flex !important;
            flex-direction: column !important;
            height: auto !important;
            gap: 0.75rem !important;
            padding: 0 !important;
          }
          .layout-digital-board-root .layout-digital-board-card {
            height: 320px !important;
            min-height: 280px !important;
            flex: none !important;
          }
          .layout-digital-board-root .layout-digital-board-card.is-empty {
            display: none !important;
          }
        }
      `}</style>

      {offline && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-amber-500/95 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
          Offline — showing cached menu
        </div>
      )}

      <div className="layout-digital-board-grid grid grid-cols-4 grid-rows-2 gap-3 p-3 h-full w-full">
        {slots.map((slot, index) => {
          if (index < 4) {
            return <TopRowCard key={index} slot={slot} currency={currency} />
          }
          return <BottomRowCard key={index} slot={slot} currency={currency} />
        })}
      </div>
    </div>
  )
}
