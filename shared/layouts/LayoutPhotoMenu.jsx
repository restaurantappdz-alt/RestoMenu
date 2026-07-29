function ChefHat(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z"/>
      <line x1="6" y1="17" x2="18" y2="17"/>
    </svg>
  )
}

function Clock(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function Star({ fill, ...props }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

export const capabilities = {
  id: 'photoMenu',
  name: 'Photo Menu',
  maxItems: 8,
  supportsDescriptions: true,
  supportsTags: true,
  supportsHeroPhoto: true,
  supportsAddons: false,
  supportsItemImages: false,
  displayMode: 'single-category',
  hasHeader: true,
  hasFooter: true,
}

function Dot() {
  return <span className="mx-[0.5vw] opacity-40" style={{ color: '#7a6f56' }}>·</span>
}

function FallbackHeroCard({ heroName, heroDescription, heroPrice }) {
  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: '#131109',
        padding: '3vw',
        height: '100%',
      }}
    >
      {/* Decorative corner brackets */}
      {[
        { top: '2.5vh', left: '1.8vw' },
        { top: '2.5vh', right: '1.8vw' },
        { bottom: '2.5vh', left: '1.8vw' },
        { bottom: '2.5vh', right: '1.8vw' },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            ...pos,
            width: '2.2vw',
            height: '2.2vw',
            borderTop: i < 2 ? '1px solid rgba(200,144,42,0.3)' : 'none',
            borderBottom: i >= 2 ? '1px solid rgba(200,144,42,0.3)' : 'none',
            borderLeft: i % 2 === 0 ? '1px solid rgba(200,144,42,0.3)' : 'none',
            borderRight: i % 2 === 1 ? '1px solid rgba(200,144,42,0.3)' : 'none',
          }}
        />
      ))}

      {/* Content */}
      <div className="flex flex-col items-center text-center" style={{ maxWidth: '88%' }}>
        <ChefHat
          style={{ width: '3vw', height: '3vw', marginBottom: '1.8vh', color: '#c8902a', opacity: 0.5 }}
        />
        <span
          className="tracking-[0.3em] uppercase font-semibold"
          style={{ fontSize: 'clamp(0.55rem, 0.72vw, 1rem)', color: '#c8902a', marginBottom: '1.2vh', letterSpacing: '0.3em' }}
        >
          Tonight&apos;s Special
        </span>
        <div style={{ height: '1px', width: '4vw', background: 'rgba(200,144,42,0.3)', marginBottom: '1.8vh' }} />
        <h1
          className="font-bold leading-tight"
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.8rem, 2.8vw, 3.5rem)',
            color: '#f0ead8',
            marginBottom: '1.8vh',
          }}
        >
          {heroName || 'Menu Name'}
        </h1>
        {heroDescription && (
          <p
            className="leading-relaxed"
            style={{
              fontSize: 'clamp(0.7rem, 1.05vw, 1.2rem)',
              color: 'rgba(240,234,216,0.55)',
              marginBottom: '2vh',
              maxWidth: '85%',
            }}
          >
            {heroDescription}
          </p>
        )}
        <div style={{ height: '1px', width: '4vw', background: 'rgba(200,144,42,0.3)', marginBottom: '2vh' }} />
        {heroPrice && (
          <span
            className="font-bold tabular-nums leading-none"
            style={{ fontSize: 'clamp(2.5rem, 4vw, 5rem)', color: '#c8902a', marginBottom: '1.5vh' }}
          >
            ${heroPrice}
          </span>
        )}
        <div className="flex items-center gap-[0.3vw]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} style={{ width: '1vw', height: '1vw', color: '#c8902a', fill: '#c8902a' }} />
          ))}
        </div>
      </div>
    </section>
  )
}

function HeroPhotoCard({ imageUrl, heroName, heroDescription, heroLabel, heroPrice }) {
  return (
    <section className="relative overflow-hidden" style={{ background: '#131109', height: '100%' }}>
      <img
        src={imageUrl}
        alt={`Featured dish: ${heroName || ''}`}
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ pointerEvents: 'none' }}
      />
      {/* Cinematic gradient overlay — bottom-heavy */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(12,11,9,0.98) 0%, rgba(12,11,9,0.8) 38%, rgba(12,11,9,0.2) 62%, transparent 100%)',
        }}
      />
      {/* Text overlay */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col" style={{ padding: '2.5vw' }}>
        <div className="flex items-center gap-[0.4vw]" style={{ marginBottom: '0.8vh' }}>
          <ChefHat style={{ width: '1vw', height: '1vw', flexShrink: 0, color: '#c8902a' }} />
          <span
            className="tracking-[0.26em] uppercase font-semibold"
            style={{ fontSize: 'clamp(0.5rem, 0.72vw, 0.9rem)', color: '#c8902a', letterSpacing: '0.26em' }}
          >
            {heroLabel || 'Chef\'s Recommendation'}
          </span>
        </div>
        <h1
          className="font-bold leading-tight"
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.6rem, 2.7vw, 3.2rem)',
            color: '#f0ead8',
            marginBottom: '1vh',
          }}
        >
          {heroName}
        </h1>
        <div style={{ height: '1px', width: '2.5vw', background: 'rgba(200,144,42,0.4)', marginBottom: '1.2vh' }} />
        {heroDescription && (
          <p
            className="leading-relaxed"
            style={{
              fontSize: 'clamp(0.65rem, 1.05vw, 1.15rem)',
              color: 'rgba(240,234,216,0.68)',
              maxWidth: '88%',
              marginBottom: '2vh',
            }}
          >
            {heroDescription}
          </p>
        )}
        <div className="flex items-end justify-between">
          <span
            className="font-bold tabular-nums leading-none"
            style={{ fontSize: 'clamp(2rem, 3.4vw, 4rem)', color: '#c8902a' }}
          >
            {heroPrice ? `$${heroPrice}` : ''}
          </span>
          <div className="flex items-center gap-[0.2vw]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} style={{ width: '1vw', height: '1vw', color: '#c8902a', fill: '#c8902a' }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function LayoutPhotoMenu({ categories, allAddons, offline, menu, title }) {
  // Single-category display: only show items from the first category
  const items = categories[0]?.items || []
  const slicedItems = items.slice(0, capabilities.maxItems)

  const currency = menu?.currency || '$'
  const hours = menu?.businessHours || 'Open Daily'
  const allergyNote = menu?.allergyNote || null
  const pricingNote = menu?.pricingNote || null
  const hasHeroImage = menu?.heroImageUrl

  return (
    <div
      className="h-full w-full relative overflow-hidden"
      style={{
        background: '#0c0b09',
        fontFamily: '"Barlow", system-ui, sans-serif',
      }}
    >
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Barlow:wght@300;400;500;600;700&display=swap');
      `}</style>

      {offline && (
        <div
          className="absolute top-[2vh] left-1/2 -translate-x-1/2 z-50"
          style={{
            background: 'rgba(200,144,42,0.9)',
            color: '#0c0b09',
            padding: '0.8vh 2vw',
            borderRadius: '9999px',
            fontSize: 'clamp(0.55rem, 0.8vw, 1rem)',
            fontWeight: 700,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
          }}
        >
          Offline — showing cached menu
        </div>
      )}

      {/* ── HEADER ── */}
      <header
        className="flex-shrink-0 flex items-center justify-between"
        style={{
          padding: '1.2vh 3vw',
          borderBottom: '1px solid rgba(240,234,216,0.08)',
        }}
      >
        {/* Branding */}
        <div className="flex flex-col">
          <span
            className="font-bold tracking-wide leading-none"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(1.2rem, 2.2vw, 2.8rem)',
              color: '#f0ead8',
            }}
          >
            {title}
          </span>
          {menu?.tagline && (
            <span
              className="tracking-[0.22em] uppercase mt-[0.3vh]"
              style={{
                fontSize: 'clamp(0.45rem, 0.75vw, 0.9rem)',
                color: '#7a6f56',
                letterSpacing: '0.22em',
              }}
            >
              {menu.tagline}
            </span>
          )}
        </div>

        {/* Category label — center */}
        {categories.length > 0 && (
          <div className="flex flex-col items-center">
            <span
              className="tracking-[0.28em] uppercase font-semibold mb-[0.3vh]"
              style={{
                fontSize: 'clamp(0.4rem, 0.7vw, 0.85rem)',
                color: '#c8902a',
                letterSpacing: '0.28em',
              }}
            >
              Now Serving
            </span>
            <span
              className="font-bold tracking-tight leading-none"
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 'clamp(1.1rem, 2vw, 2.5rem)',
                color: '#f0ead8',
              }}
            >
              {categories[0].name}
            </span>
          </div>
        )}
      </header>

      {/* ── MAIN GRID ── */}
      <main
        className="flex-1 overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: '58fr 42fr',
          height: 'calc(100% - clamp(4rem, 8vh, 6rem))',
        }}
      >
        {/* ── LEFT: Menu List ── */}
        <section
          className="flex flex-col justify-center overflow-y-auto"
          style={{
            padding: '0 3vw',
            borderRight: '1px solid rgba(240,234,216,0.08)',
          }}
        >
          {slicedItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p style={{ fontSize: 'clamp(1rem, 1.5vw, 2rem)', color: '#7a6f56' }}>No items yet</p>
            </div>
          ) : (
            slicedItems.map((item, index) => (
              <article
                key={index}
                className="flex flex-col animate-cascade-item"
                style={{
                  animationDelay: `${index * 0.08}s`,
                  padding: '1.6vh 0',
                  borderBottom: index < slicedItems.length - 1 ? '1px solid rgba(240,234,216,0.06)' : 'none',
                }}
              >
                {/* Name row + price */}
                <div className="flex items-baseline justify-between gap-[1vw]">
                  <div className="flex items-center gap-[0.6vw] min-w-0">
                    <h2
                      className="font-bold leading-tight truncate"
                      style={{
                        fontFamily: '"Playfair Display", Georgia, serif',
                        fontSize: 'clamp(0.95rem, 1.75vw, 2.2rem)',
                        color: '#f0ead8',
                      }}
                    >
                      {item.name}
                    </h2>
                    {item.tag && (
                      <span
                        className="flex-shrink-0 font-semibold tracking-widest uppercase"
                        style={{
                          fontSize: 'clamp(0.35rem, 0.6vw, 0.75rem)',
                          padding: '0.2vh 0.6vw',
                          borderRadius: '0.25rem',
                          background: 'rgba(200,144,42,0.1)',
                          color: '#c8902a',
                          border: '1px solid rgba(200,144,42,0.25)',
                        }}
                      >
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <span
                    className="flex-shrink-0 font-bold tabular-nums"
                    style={{ fontSize: 'clamp(1rem, 1.9vw, 2.4rem)', color: '#c8902a' }}
                  >
                    {currency}{item.price}
                  </span>
                </div>

                {/* Description */}
                {item.description && (
                  <p
                    className="leading-relaxed"
                    style={{
                      fontSize: 'clamp(0.6rem, 1.05vw, 1.2rem)',
                      color: '#7a6f56',
                      marginTop: '0.4vh',
                    }}
                  >
                    {item.description}
                  </p>
                )}
              </article>
            ))
          )}
        </section>

        {/* ── RIGHT: Hero Photo / Fallback ── */}
        {/* Only show hero price when explicitly configured; never synthesize from first item */}
        {hasHeroImage ? (
          <HeroPhotoCard
            imageUrl={menu.heroImageUrl}
            heroName={menu.heroName || title}
            heroDescription={menu.heroDescription}
            heroLabel={menu.heroLabel}
            heroPrice={menu.heroPrice || null}
          />
        ) : (
          <FallbackHeroCard
            heroName={menu.heroName || title}
            heroDescription={menu.heroDescription}
            heroPrice={menu.heroPrice || null}
          />
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          padding: '0.8vh 3vw',
          borderTop: '1px solid rgba(240,234,216,0.08)',
          background: 'rgba(19,17,9,0.6)',
        }}
      >
        <div className="flex items-center" style={{ fontSize: 'clamp(0.4rem, 0.72vw, 0.9rem)', color: '#7a6f56' }}>
          <Clock style={{ width: '0.8vw', height: '0.8vw', marginRight: '0.4vw', flexShrink: 0 }} />
          <span>{hours}</span>
          {allergyNote && <><Dot /><span>{allergyNote}</span></>}
          {pricingNote && <><Dot /><span>{pricingNote}</span></>}
        </div>
      </footer>
    </div>
  )
}
