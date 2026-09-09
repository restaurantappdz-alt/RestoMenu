import React from 'react'

export const capabilities = {
  id: 'parchment',
  name: 'Parchment Tradition',
  maxItems: 10,
  supportsDescriptions: true,
  supportsTags: true,
  supportsItemImages: true,
  supportsHeroPhoto: false,
  supportsAddons: 'footer',
  columns: 1,
  displayMode: 'full-menu',
  hasHeader: true,
  hasFooter: false,
}

// Curated authentic dish photos matching the traditional rustic style of the reference
const FALLBACK_LEFT_PHOTOS = [
  'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=1000&q=80', // Couscous Royale with vegetables & meat
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&q=80', // Traditional stew / tagine plate
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1000&q=80', // Clay dish grilled skewers & sauce
]

const FALLBACK_RIGHT_PHOTOS = [
  'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1000&q=80', // Berber Couscous platter with lemons & sides
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&q=80', // Terracotta bowl with seasoned rice/couscous & garnish
]

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

// Classical Victorian corner ornament SVG
function CornerBracket({ style }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="#7c6044"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        position: 'absolute',
        width: 'clamp(24px, 2.2vw, 36px)',
        height: 'clamp(24px, 2.2vw, 36px)',
        opacity: 0.85,
        ...style,
      }}
    >
      {/* Outer corner lines */}
      <path d="M 4 36 L 4 4 L 36 4" strokeWidth="1.8" />
      {/* Inner corner step */}
      <path d="M 9 24 L 9 9 L 24 9" strokeWidth="1.2" />
      {/* Decorative floral loop / accent */}
      <circle cx="14" cy="14" r="3.5" strokeWidth="1.2" fill="#7c6044" fillOpacity="0.15" />
      <path d="M 4 4 L 11 11" strokeWidth="1.4" />
    </svg>
  )
}

// Classical calligraphic filigree divider SVG
function FiligreeDivider() {
  return (
    <svg
      viewBox="0 0 200 24"
      fill="none"
      stroke="#7c6044"
      className="mx-auto my-[0.4vh] opacity-80"
      style={{ width: 'clamp(110px, 11vw, 190px)', height: 'clamp(14px, 1.6vh, 22px)' }}
    >
      <path d="M 10 12 L 75 12" strokeWidth="1.2" />
      <path d="M 125 12 L 190 12" strokeWidth="1.2" />
      {/* Center diamond & flourishes */}
      <circle cx="100" cy="12" r="3" fill="#7c6044" />
      <polygon points="100,5 107,12 100,19 93,12" strokeWidth="1.2" fill="#faf6ed" />
      <circle cx="85" cy="12" r="2" fill="#7c6044" />
      <circle cx="115" cy="12" r="2" fill="#7c6044" />
      <path d="M 68 8 C 72 12, 72 12, 76 16" strokeWidth="1" />
      <path d="M 132 8 C 128 12, 128 12, 124 16" strokeWidth="1" />
    </svg>
  )
}

export default function LayoutParchment({ categories = [], allAddons = [], offline, menu = {}, title }) {
  const currency = menu?.currency || 'DA'

  // Flatten items from all categories up to 10 max
  const allItems = []
  const itemsWithPhotos = []

  for (const cat of categories) {
    for (const item of cat.items || []) {
      allItems.push({
        ...item,
        categoryName: cat.name,
      })
      if (item.imageUrl && item.imageUrl.trim() !== '') {
        itemsWithPhotos.push(item.imageUrl)
      }
      if (allItems.length >= capabilities.maxItems) break
    }
    if (allItems.length >= capabilities.maxItems) break
  }

  // Populate side photos: use uploaded photos first, then curated fallbacks
  const leftPhotos = [
    itemsWithPhotos[0] || FALLBACK_LEFT_PHOTOS[0],
    itemsWithPhotos[1] || FALLBACK_LEFT_PHOTOS[1],
    itemsWithPhotos[2] || FALLBACK_LEFT_PHOTOS[2],
  ]

  const rightPhotos = [
    itemsWithPhotos[3] || FALLBACK_RIGHT_PHOTOS[0],
    itemsWithPhotos[4] || FALLBACK_RIGHT_PHOTOS[1],
  ]

  return (
    <div
      className="layout-parchment-root h-full w-full relative overflow-hidden bg-[#241710] text-[#2c1a12] select-none"
      style={{
        fontFamily: "'Playfair Display', 'Cinzel', 'Noto Serif Arabic', 'Georgia', serif",
      }}
    >
      {/* Styles & Typography */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=Cinzel:wght@500;700;800&family=Noto+Serif+Arabic:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .parchment-arabic {
          font-family: 'Noto Serif Arabic', 'Playfair Display', serif;
        }

        .parchment-script {
          font-family: 'Alex Brush', cursive;
        }

        @keyframes parchmentShift {
          0% { transform: translate(0px, 0px); }
          25% { transform: translate(1px, 0px); }
          50% { transform: translate(1px, 1px); }
          75% { transform: translate(0px, 1px); }
          100% { transform: translate(0px, 0px); }
        }

        .parchment-shift-target {
          animation: parchmentShift 360s linear infinite;
        }

        /* Leader Dots Repeater */
        .parchment-leader-dots {
          flex: 1;
          margin: 0 clamp(4px, 0.5vw, 10px) clamp(2px, 0.3vh, 4px) clamp(4px, 0.5vw, 10px);
          min-width: 14px;
          border-bottom: 2px dotted rgba(100, 75, 52, 0.45);
        }

        /* Portrait / Phone view overrides */
        @media (orientation: portrait) {
          .layout-parchment-root {
            height: auto !important;
            min-height: 100vh;
            overflow-y: auto !important;
            padding: 10px !important;
          }
          .parchment-screen-container {
            flex-direction: column !important;
            height: auto !important;
            gap: 16px !important;
          }
          .parchment-side-gallery {
            width: 100% !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            height: 160px !important;
            flex-shrink: 0 !important;
          }
          .parchment-photo-tile {
            width: 180px !important;
            height: 100% !important;
            flex-shrink: 0 !important;
          }
          .parchment-card-container {
            width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            padding: 16px 12px !important;
          }
        }
      `}</style>

      {/* Offline Pill */}
      {offline && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-xl pointer-events-none"
          style={{ background: '#7c3a21' }}
        >
          Offline — Mode Hors Ligne
        </div>
      )}

      {/* Warm Ambient Background with Texture & Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 50% 50%, rgba(65, 42, 28, 0.75) 0%, rgba(24, 14, 9, 0.96) 100%),
            url('https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=1600&q=40')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px)',
          opacity: 0.85,
        }}
      />

      {/* Dark Subtle Edge Border on the TV Screen */}
      <div className="absolute inset-0 pointer-events-none z-10 border-[clamp(2px,0.25vw,5px)] border-[#160c07] shadow-inner" />

      {/* 3-Column Main Stage Container */}
      <div className="parchment-screen-container parchment-shift-target relative z-20 w-full h-full p-[clamp(8px,1vw,18px)] box-border flex items-stretch gap-[clamp(8px,1.1vw,20px)]">
        
        {/* ─── LEFT COLUMN: 3 Stacked Food Photos (28-30% width) ─── */}
        <div className="parchment-side-gallery w-[28.5%] h-full flex flex-col gap-[clamp(6px,0.7vh,14px)]">
          {leftPhotos.map((src, i) => (
            <div
              key={`left-img-${i}`}
              className="parchment-photo-tile flex-1 min-h-0 w-full relative overflow-hidden rounded-[2px] shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-[#4a3424]"
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/25 to-transparent" />
            </div>
          ))}
        </div>

        {/* ─── CENTER COLUMN: Elegant Ivory Parchment Menu Card (43% width) ─── */}
        <div className="parchment-card-container flex-1 h-full relative rounded-[3px] shadow-[0_12px_40px_rgba(0,0,0,0.65),0_2px_8px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden box-border p-[clamp(6px,0.7vw,14px)] bg-[#faf6ed]">
          
          {/* Subtle Paper Texture & Edge Aging */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 45%, #fffdf8 30%, #f6edd9 85%, #ebdcc1 100%)',
              boxShadow: 'inset 0 0 24px rgba(100, 75, 45, 0.18)',
            }}
          />

          {/* Ornate Double-Line Framing with Filigree Corners */}
          <div
            className="relative z-10 w-full h-full flex flex-col box-border p-[clamp(10px,1.1vw,22px)]"
            style={{
              border: '1.5px solid #7c6044',
              outline: '1px solid #c2ad94',
              outlineOffset: '-5px',
            }}
          >
            {/* 4 Corner Ornaments */}
            <CornerBracket style={{ top: -2, left: -2 }} />
            <CornerBracket style={{ top: -2, right: -2, transform: 'scaleX(-1)' }} />
            <CornerBracket style={{ bottom: -2, left: -2, transform: 'scaleY(-1)' }} />
            <CornerBracket style={{ bottom: -2, right: -2, transform: 'scale(-1, -1)' }} />

            {/* Header: Calligraphic "Menu" Title + Filigree Divider */}
            <header className="w-full text-center flex flex-col items-center pt-[clamp(2px,0.4vh,8px)] pb-[clamp(4px,0.8vh,12px)] flex-shrink-0">
              <h1
                className="parchment-script text-[#382013] leading-none tracking-normal font-normal"
                style={{ fontSize: 'clamp(2.4rem, 3.8vw, 4.4rem)' }}
              >
                {title || 'Menu'}
              </h1>
              <FiligreeDivider />
            </header>

            {/* Content Body: Classical Dotted-Line Menu Items List */}
            {allItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#7c6044]">
                <p className="italic text-base">Aucun article dans cette catégorie pour le moment.</p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col justify-evenly py-[clamp(2px,0.5vh,8px)]">
                {allItems.map((item, idx) => {
                  return (
                    <div
                      key={item.id || `${item.name}-${idx}`}
                      className="w-full flex flex-col justify-center py-[clamp(1px,0.25vh,4px)]"
                    >
                      {/* Top Row: Name + Dotted Line + Price */}
                      <div className="w-full flex items-baseline justify-between overflow-hidden leading-snug">
                        {/* Dish Name */}
                        <div
                          className="parchment-arabic font-bold text-[#2e190e] truncate flex-shrink-0 max-w-[65%]"
                          style={{ fontSize: 'clamp(0.85rem, 1.15vw, 1.45rem)' }}
                        >
                          {item.name}
                        </div>

                        {/* Classic Dotted Leader Line */}
                        <div className="parchment-leader-dots" />

                        {/* Price */}
                        <div
                          className="font-extrabold text-[#2e190e] text-right tabular-nums whitespace-nowrap flex-shrink-0"
                          style={{ fontSize: 'clamp(0.88rem, 1.25vw, 1.5rem)' }}
                        >
                          {formatPrice(item.price, currency)}
                        </div>
                      </div>

                      {/* Bottom Row: Ingredients / Description */}
                      {(item.description || item.tag) && (
                        <div
                          className="text-[#6d5543] italic truncate font-normal leading-tight pl-[1px] mt-[-1px]"
                          style={{ fontSize: 'clamp(0.62rem, 0.8vw, 0.98rem)' }}
                        >
                          {item.description || item.tag}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: 2 Stacked Food Photos (28-30% width) ─── */}
        <div className="parchment-side-gallery w-[28.5%] h-full flex flex-col gap-[clamp(6px,0.7vh,14px)]">
          {rightPhotos.map((src, i) => (
            <div
              key={`right-img-${i}`}
              className="parchment-photo-tile flex-1 min-h-0 w-full relative overflow-hidden rounded-[2px] shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-[#4a3424]"
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/25 to-transparent" />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
