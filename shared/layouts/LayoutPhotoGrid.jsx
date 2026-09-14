import React from 'react'

export const capabilities = {
  id: 'photoGrid',
  name: 'Photo Grid',
  maxItems: 8,
  supportsDescriptions: true,
  supportsTags: true,
  supportsItemImages: true,
  supportsAddons: 'footer',
  columns: 4,
  displayMode: 'full-menu',
  hasHeader: false,
  hasFooter: false,
}

function formatPrice(price, currency = 'DA') {
  if (price == null || price === '') return ''
  const str = String(price).trim()
  if (str.includes('$') || str.includes('€') || str.includes('£') || str.toUpperCase().includes('DA') || str.toUpperCase().includes('MAD')) {
    return str
  }
  const curr = (currency || 'DA').trim()
  if (['$', '€', '£', '¥', '₹'].includes(curr)) {
    const num = Number(price)
    return Number.isFinite(num) ? `${curr}${num.toFixed(2)}` : `${curr}${price}`
  }
  return `${price} ${curr}`
}

function getGridConfig(count) {
  if (count <= 1) {
    return {
      containerStyle: {
        gridTemplateColumns: 'repeat(1, 1fr)',
        gridTemplateRows: 'repeat(1, 1fr)',
      },
      getItemSpan: () => 'span 1',
      bottomRowStartIndex: 0,
    }
  }
  if (count === 2) {
    return {
      containerStyle: {
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(1, 1fr)',
      },
      getItemSpan: () => 'span 1',
      bottomRowStartIndex: 0,
    }
  }
  if (count === 3) {
    return {
      containerStyle: {
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(1, 1fr)',
      },
      getItemSpan: () => 'span 1',
      bottomRowStartIndex: 0,
    }
  }
  if (count === 4) {
    return {
      containerStyle: {
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
      },
      getItemSpan: () => 'span 1',
      bottomRowStartIndex: 2,
    }
  }
  if (count === 5) {
    return {
      containerStyle: {
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
      },
      // Top 3 items span 2 (3 * 2 = 6), bottom 2 items span 3 (2 * 3 = 6)
      getItemSpan: (index) => (index < 3 ? 'span 2' : 'span 3'),
      bottomRowStartIndex: 3,
    }
  }
  if (count === 6) {
    return {
      containerStyle: {
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
      },
      getItemSpan: () => 'span 1',
      bottomRowStartIndex: 3,
    }
  }
  if (count === 7) {
    return {
      containerStyle: {
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
      },
      // Top 4 items span 3 (4 * 3 = 12), bottom 3 items span 4 (3 * 4 = 12)
      getItemSpan: (index) => (index < 4 ? 'span 3' : 'span 4'),
      bottomRowStartIndex: 4,
    }
  }
  return {
    containerStyle: {
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'repeat(2, 1fr)',
    },
    getItemSpan: () => 'span 1',
    bottomRowStartIndex: 4,
  }
}

function PhotoGridCard({ item, idx, gridConfig, currency }) {
  let variations = []
  if (Array.isArray(item.variations) && item.variations.length > 0) {
    variations = item.variations
  } else if (Array.isArray(item.addons) && item.addons.length > 0) {
    variations = item.addons
  } else if (idx != null && gridConfig && idx >= gridConfig.bottomRowStartIndex && Array.isArray(item.categoryAddons) && item.categoryAddons.length > 0) {
    variations = item.categoryAddons.slice(0, 2)
  } else if (idx != null && !gridConfig && Array.isArray(item.categoryAddons) && item.categoryAddons.length > 0) {
    variations = item.categoryAddons.slice(0, 2)
  }

  return (
    <div
      key={item.id || `${item.name}-${idx}`}
      className="photogrid-card flex flex-col h-full w-full overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] relative"
      style={gridConfig ? { gridColumn: gridConfig.getItemSpan(idx) } : undefined}
    >
      {/* Food Photo Area (if image exists) */}
      {item.imageUrl && (
        <div className="flex-1 min-h-0 w-full relative overflow-hidden bg-zinc-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
            className="w-full h-full object-cover transition-transform duration-700 ease-out"
          />
        </div>
      )}

      {/* Primary Info Banner (Soft Warm Beige / Tan) */}
      <div
        className="w-full flex items-center justify-between px-[clamp(8px,0.85vw,16px)] py-[clamp(4px,0.65vh,9px)]"
        style={{ background: '#f5ede2' }}
      >
        {/* Left: Stacked Title + Subtitle/Description */}
        <div className="flex-1 min-w-0 pr-[clamp(6px,0.6vw,12px)]">
          <div
            className="font-bold text-zinc-900 truncate leading-tight tracking-tight layout-photogrid-arabic"
            style={{ fontSize: 'clamp(0.78rem, 1.05vw, 1.35rem)' }}
          >
            {item.name}
          </div>
          {(item.description || item.tag) && (
            <div
              className="text-[#6b4724]/90 truncate font-medium leading-snug mt-[0.1vh]"
              style={{ fontSize: 'clamp(0.6rem, 0.78vw, 0.95rem)' }}
            >
              {item.description || item.tag}
            </div>
          )}
        </div>

        {/* Right: Item Price */}
        <div
          className="flex-shrink-0 font-extrabold text-[#713f12] text-right tabular-nums whitespace-nowrap leading-none"
          style={{ fontSize: 'clamp(0.85rem, 1.25vw, 1.7rem)' }}
        >
          {formatPrice(item.price, currency)}
        </div>
      </div>

      {/* Stacked Variations / Add-ons (Dark Teal / Forest Green Secondary Banners) */}
      {variations.length > 0 && (
        <div className="w-full flex flex-col border-t border-white gap-[1px] bg-white">
          {variations.slice(0, 3).map((v, vIdx) => (
            <div
              key={v.id || `${v.name}-${vIdx}`}
              className="w-full flex items-center justify-between px-[clamp(8px,0.85vw,16px)] py-[clamp(3px,0.45vh,6px)]"
              style={{ background: '#0e4a43' }}
            >
              <div className="flex-1 min-w-0 pr-[clamp(6px,0.6vw,12px)]">
                <span
                  className="font-semibold text-white truncate block leading-tight"
                  style={{ fontSize: 'clamp(0.65rem, 0.8vw, 1.05rem)' }}
                >
                  {v.name}
                </span>
                {v.description && (
                  <span
                    className="text-white/80 text-xs truncate block leading-none mt-0.5"
                    style={{ fontSize: 'clamp(0.55rem, 0.68vw, 0.85rem)' }}
                  >
                    {v.description}
                  </span>
                )}
              </div>
              <span
                className="flex-shrink-0 font-bold text-white text-right tabular-nums whitespace-nowrap leading-none"
                style={{ fontSize: 'clamp(0.75rem, 1vw, 1.3rem)' }}
              >
                {formatPrice(v.price, currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LayoutPhotoGrid({ categories = [], allAddons = [], offline, menu, title, isPhone = false }) {
  const currency = menu?.currency || 'DA'

  // Flatten items from all categories up to 8 items max on TV; collect all items on phone
  const allItems = []
  for (const cat of categories) {
    for (const item of cat.items || []) {
      allItems.push({
        ...item,
        categoryName: cat.name,
        categoryAddons: cat.addons || [],
      })
      if (!isPhone && allItems.length >= capabilities.maxItems) break
    }
    if (!isPhone && allItems.length >= capabilities.maxItems) break
  }

  const gridConfig = getGridConfig(allItems.length)

  return (
    <div
      className="layout-photogrid-root h-full w-full relative overflow-hidden bg-white text-zinc-900"
      style={{
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Styles & responsive portrait overrides */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;600;700;800&display=swap');

        .layout-photogrid-root {
          box-sizing: border-box;
          user-select: none;
        }

        .layout-photogrid-arabic {
          font-family: 'Noto Sans Arabic', 'Plus Jakarta Sans', sans-serif;
        }

        @keyframes photogridPixelShift {
          0% { transform: translate(0px, 0px); }
          25% { transform: translate(1px, 0px); }
          50% { transform: translate(1px, 1px); }
          75% { transform: translate(0px, 1px); }
          100% { transform: translate(0px, 0px); }
        }

        .photogrid-inner-frame {
          animation: photogridPixelShift 300s linear infinite;
        }

        /* Phone Portrait Adaptation */
        @media (orientation: portrait) {
          .layout-photogrid-root {
            height: auto !important;
            min-height: 100vh;
            overflow-y: auto !important;
            padding: 12px !important;
          }
          .photogrid-outer-container {
            height: auto !important;
          }
          .photogrid-frame {
            height: auto !important;
            min-height: calc(100vh - 24px);
            padding: 10px !important;
          }
          .photogrid-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 16px !important;
          }
          .photogrid-card {
            height: 380px !important;
            min-height: 380px !important;
            width: 100% !important;
            grid-column: auto !important;
          }
        }
      `}</style>

      {/* Offline indicator */}
      {offline && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg pointer-events-none"
          style={{ background: '#0e423d' }}
        >
          Offline — Mode Hors Ligne
        </div>
      )}

      {/* Outer Padding Container */}
      <div className="photogrid-outer-container w-full h-full p-[clamp(8px,1.2vw,22px)] box-border flex flex-col">
        {/* Dark Green Outer Border Frame */}
        <div
          className="photogrid-frame photogrid-inner-frame w-full h-full box-border border-[#0e423d] p-[clamp(6px,0.8vw,16px)] flex flex-col"
          style={{
            borderWidth: 'clamp(2px, 0.22vw, 4px)',
            borderStyle: 'solid',
          }}
        >
          {/* Empty state */}
          {allItems.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#0e423d]">
              <h2 className="text-2xl font-bold">{title || 'Menu'}</h2>
              <p className="text-zinc-500 mt-2">Aucun article à afficher pour le moment.</p>
            </div>
          ) : isPhone ? (
            /* Group items under category headers when on phone */
            <div className="w-full flex flex-col gap-6">
              {categories
                .filter((cat) => (cat.items || []).length > 0)
                .map((cat, catIdx) => (
                  <div key={cat.id || `${cat.name}-${catIdx}`} className="w-full flex flex-col gap-3">
                    <div className="pb-1 border-b-2 border-[#0e423d]/30">
                      <h3 className="text-xl font-bold text-[#0e423d] layout-photogrid-arabic uppercase tracking-wide">
                        {cat.name}
                      </h3>
                    </div>
                    <div className="flex flex-col gap-4">
                      {(cat.items || []).map((item, idx) => (
                        <PhotoGridCard
                          key={item.id || `${item.name}-${idx}`}
                          item={{ ...item, categoryAddons: cat.addons || [] }}
                          idx={idx}
                          currency={currency}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            /* Dynamically balanced Grid of Menu Items (TV mode) */
            <div
              className="photogrid-grid w-full h-full grid gap-[clamp(6px,0.9vw,16px)] box-border"
              style={{
                ...gridConfig.containerStyle,
              }}
            >
              {allItems.map((item, idx) => (
                <PhotoGridCard
                  key={item.id || `${item.name}-${idx}`}
                  item={item}
                  idx={idx}
                  gridConfig={gridConfig}
                  currency={currency}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
