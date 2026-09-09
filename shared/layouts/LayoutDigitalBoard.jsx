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

function FallbackDishIcon({ className = 'w-10 h-10 text-[#084c3c]/30' }) {
  return (
    <svg
      className={className}
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

function CardPhoto({ src, alt, className = '' }) {
  return (
    <div
      className={`relative w-full flex-1 min-h-0 overflow-hidden bg-[#fbfbf9] flex items-center justify-center border-b-[2px] border-[#084c3c]/25 ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-[#f7f7f5] pointer-events-none">
        <FallbackDishIcon />
      </div>
      {src && (
        <img
          src={src}
          alt={alt || ''}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
    </div>
  )
}

function DigitalBoardCard({ slot, currency, isWide }) {
  const isMultiple =
    slot.priceType === 'multiple' && Array.isArray(slot.priceRows) && slot.priceRows.length > 0
  const formattedPrice =
    slot.price != null && String(slot.price).trim() !== '' ? `${slot.price} ${currency}` : ''

  if (isMultiple) {
    return (
      <div className="layout-digital-board-card flex flex-col h-full rounded-xl overflow-hidden border-[2px] border-[#084c3c] bg-white shadow-sm transition-shadow">
        {/* Photo: flex-1 to fill all remaining height */}
        <CardPhoto src={slot.imageUrl} alt={slot.title} />

        {/* Price panel: flex-shrink-0 with compact proportional height */}
        <div className="flex-shrink-0 flex flex-col justify-between overflow-hidden bg-white">
          {/* Header title banner under photo */}
          <div className="bg-[#fcf6ed] px-3.5 py-2 border-b-[1.5px] border-[#084c3c]/20 flex items-center justify-between gap-2 flex-shrink-0">
            <div className="min-w-0 flex-1 flex items-baseline gap-2">
              <span
                className={`text-[#084c3c] font-bold line-clamp-1 leading-tight ${
                  isWide ? 'text-base lg:text-lg' : 'text-sm lg:text-base'
                }`}
                dir="auto"
              >
                {slot.title}
              </span>
              {slot.subtitle && (
                <span
                  className={`text-[#084c3c]/70 line-clamp-1 leading-tight ${
                    isWide ? 'text-xs lg:text-sm' : 'text-xs'
                  }`}
                >
                  {slot.subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Alternating deep emerald and crisp white strips */}
          <div className="flex flex-col flex-shrink-0">
            {slot.priceRows.map((row, idx) => {
              const isEven = idx % 2 === 0
              const rowPrice =
                row.price != null && String(row.price).trim() !== ''
                  ? `${row.price} ${currency}`
                  : ''
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-3.5 py-1.5 lg:py-2 ${
                    isEven
                      ? 'bg-[#084c3c] text-white'
                      : 'bg-white text-[#084c3c] border-t border-[#084c3c]/20'
                  }`}
                >
                  <span
                    className={`font-semibold text-xs lg:text-sm line-clamp-1 ${
                      isEven ? 'text-white' : 'text-[#084c3c]'
                    }`}
                  >
                    {row.label || row.name || ''}
                  </span>
                  <span
                    className={`font-extrabold tabular-nums text-xs lg:text-sm whitespace-nowrap ml-2 ${
                      isEven ? 'text-emerald-100' : 'text-[#084c3c]'
                    }`}
                  >
                    {rowPrice}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Single price card
  return (
    <div className="layout-digital-board-card flex flex-col h-full rounded-xl overflow-hidden border-[2px] border-[#084c3c] bg-white shadow-sm transition-shadow">
      {/* Photo: flex-1 to fill all remaining height */}
      <CardPhoto src={slot.imageUrl} alt={slot.title} />

      {/* Banner: compact, sleek flex-shrink-0 banner */}
      <div
        className={`bg-[#fcf6ed] flex items-center justify-between gap-3 overflow-hidden flex-shrink-0 ${
          isWide ? 'px-5 py-3' : 'px-3.5 py-2.5'
        }`}
      >
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <span
            className={`text-[#084c3c] font-bold line-clamp-1 leading-tight ${
              isWide ? 'text-lg lg:text-xl' : 'text-base lg:text-lg'
            }`}
            dir="auto"
          >
            {slot.title}
          </span>
          {slot.subtitle && (
            <span
              className={`text-[#084c3c]/75 line-clamp-1 leading-snug mt-0.5 ${
                isWide ? 'text-xs lg:text-sm' : 'text-xs'
              }`}
            >
              {slot.subtitle}
            </span>
          )}
        </div>
        {formattedPrice && (
          <div className="flex-shrink-0 text-right pl-2">
            <span
              className={`text-[#084c3c] font-black tabular-nums whitespace-nowrap ${
                isWide ? 'text-xl lg:text-2xl' : 'text-lg lg:text-xl'
              }`}
            >
              {formattedPrice}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function hasSlotData(slot) {
  if (!slot) return false
  const title = (slot.title || slot.arabicTitle || slot.titleAr || slot.name || '').trim()
  const subtitle = (slot.subtitle || slot.latinTitle || slot.subtitleFr || slot.description || '').trim()
  const price = (slot.price != null ? String(slot.price) : '').trim()
  const imageUrl = (slot.imageUrl || slot.image || slot.photo || '').trim()
  const hasRows =
    Array.isArray(slot.priceRows) &&
    slot.priceRows.some(
      (r) => (r.label && String(r.label).trim()) || (r.price != null && String(r.price).trim())
    )
  return Boolean(title || price || imageUrl || hasRows)
}

function normalizeSlot(cfg) {
  return {
    title: cfg.title || cfg.arabicTitle || cfg.titleAr || cfg.name || '',
    subtitle: cfg.subtitle || cfg.latinTitle || cfg.subtitleFr || cfg.description || '',
    price: cfg.price != null ? String(cfg.price) : '',
    imageUrl: cfg.imageUrl || cfg.image || cfg.photo || '',
    priceType:
      cfg.priceType ||
      (Array.isArray(cfg.priceRows) && cfg.priceRows.length > 0 ? 'multiple' : 'single'),
    priceRows: Array.isArray(cfg.priceRows) ? cfg.priceRows : [],
  }
}

function normalizeCategoryItem(item) {
  return {
    title: item.name || '',
    subtitle: item.description || '',
    price: item.price != null ? String(item.price) : '',
    imageUrl: item.imageUrl || '',
    priceType: 'single',
    priceRows: [],
  }
}

export default function LayoutDigitalBoard({
  categories = [],
  allAddons = [],
  offline,
  menu = {},
  title,
}) {
  const currency = menu?.currency || 'DA'
  const rawConfigured = menu?.boardConfig?.slots || []

  // Extract only slots that have real data
  const filledConfigured = rawConfigured.filter(hasSlotData).map(normalizeSlot)

  let slots = []
  if (filledConfigured.length > 0) {
    // Show ONLY what has data! Do not append fake/blank boxes
    slots = filledConfigured.slice(0, 8)
  } else {
    // If no boardConfig slots exist, fallback to available category items (up to 8)
    const categoryItems = (categories || [])
      .flatMap((c) => c.items || [])
      .filter((item) => item && (item.name || item.price != null || item.imageUrl))
      .slice(0, 8)
    slots = categoryItems.map(normalizeCategoryItem)
  }

  const count = slots.length

  // Responsive layout classes and column spanning based on item count
  const renderGridContent = () => {
    if (count === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full text-center p-8">
          <FallbackDishIcon className="w-20 h-20 text-[#084c3c]/40 mb-4" />
          <h2 className="text-[#084c3c] text-3xl font-extrabold mb-2">القائمة قيد التحديث</h2>
          <p className="text-[#084c3c]/70 text-base font-medium">Menu updating soon...</p>
        </div>
      )
    }

    if (count === 1) {
      return (
        <div className="h-full w-full max-w-5xl mx-auto p-4 flex items-center justify-center">
          <div className="w-full h-full max-h-[850px]">
            <DigitalBoardCard slot={slots[0]} currency={currency} isWide={true} />
          </div>
        </div>
      )
    }

    if (count === 2) {
      return (
        <div className="layout-digital-board-grid grid grid-cols-2 grid-rows-1 gap-4 p-4 h-full w-full">
          {slots.map((slot, index) => (
            <DigitalBoardCard key={index} slot={slot} currency={currency} isWide={true} />
          ))}
        </div>
      )
    }

    if (count === 3) {
      return (
        <div className="layout-digital-board-grid grid grid-cols-3 grid-rows-1 gap-4 p-4 h-full w-full">
          {slots.map((slot, index) => (
            <DigitalBoardCard key={index} slot={slot} currency={currency} isWide={false} />
          ))}
        </div>
      )
    }

    if (count === 4) {
      return (
        <div className="layout-digital-board-grid grid grid-cols-2 grid-rows-2 gap-3.5 p-3.5 h-full w-full">
          {slots.map((slot, index) => (
            <DigitalBoardCard key={index} slot={slot} currency={currency} isWide={true} />
          ))}
        </div>
      )
    }

    if (count === 5) {
      // 3 items top row (each col-span-2 in 6 cols), 2 items bottom row (each col-span-3 in 6 cols)
      return (
        <div className="layout-digital-board-grid grid grid-cols-6 grid-rows-2 gap-3.5 p-3.5 h-full w-full">
          {slots.slice(0, 3).map((slot, index) => (
            <div key={index} className="col-span-2 h-full">
              <DigitalBoardCard slot={slot} currency={currency} isWide={false} />
            </div>
          ))}
          {slots.slice(3, 5).map((slot, index) => (
            <div key={index + 3} className="col-span-3 h-full">
              <DigitalBoardCard slot={slot} currency={currency} isWide={true} />
            </div>
          ))}
        </div>
      )
    }

    if (count === 6) {
      return (
        <div className="layout-digital-board-grid grid grid-cols-3 grid-rows-2 gap-3.5 p-3.5 h-full w-full">
          {slots.map((slot, index) => (
            <DigitalBoardCard key={index} slot={slot} currency={currency} isWide={false} />
          ))}
        </div>
      )
    }

    if (count === 7) {
      // 4 items top row (each col-span-3 in 12 cols), 3 items bottom row (each col-span-4 in 12 cols)
      return (
        <div className="layout-digital-board-grid grid grid-cols-12 grid-rows-2 gap-3 p-3 h-full w-full">
          {slots.slice(0, 4).map((slot, index) => (
            <div key={index} className="col-span-3 h-full">
              <DigitalBoardCard slot={slot} currency={currency} isWide={false} />
            </div>
          ))}
          {slots.slice(4, 7).map((slot, index) => (
            <div key={index + 4} className="col-span-4 h-full">
              <DigitalBoardCard slot={slot} currency={currency} isWide={false} />
            </div>
          ))}
        </div>
      )
    }

    // 8 items (or fallback standard 4x2 grid)
    return (
      <div className="layout-digital-board-grid grid grid-cols-4 grid-rows-2 gap-3 p-3 h-full w-full">
        {slots.map((slot, index) => (
          <DigitalBoardCard key={index} slot={slot} currency={currency} isWide={false} />
        ))}
      </div>
    )
  }

  return (
    <div
      className="layout-digital-board-root h-full w-full overflow-hidden relative bg-white border-[8px] border-[#084c3c]"
      style={{
        animation: 'pixelShift 300s linear infinite',
        fontFamily: '"Cairo", "Inter", system-ui, -apple-system, sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&family=Inter:wght@400;600;700;800&display=swap');
        @keyframes pixelShift { 0%, 99.9% { transform: translate(0,0); } 100% { transform: translate(2px,1px); } }

        /* Mobile portrait orientation (?phone=1): stacks active cards into single scrollable column */
        @media (orientation: portrait) {
          .layout-digital-board-root {
            height: auto !important;
            min-height: 100vh !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            border-width: 4px !important;
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
            height: 340px !important;
            min-height: 300px !important;
            flex: none !important;
          }
        }
      `}</style>

      {offline && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-amber-500/95 text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
          Offline — showing cached menu
        </div>
      )}

      {renderGridContent()}
    </div>
  )
}

