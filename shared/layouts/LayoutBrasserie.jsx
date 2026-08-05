import React, { useEffect, useState } from 'react'

function GoldLine() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '0 auto', width: '60%' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(201, 168, 76, 0.6)' }} />
      <span style={{ color: '#C9A84C', fontSize: 'clamp(0.6rem, 0.8vw, 1rem)' }}>✦</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(201, 168, 76, 0.6)' }} />
    </div>
  )
}

function Dots() {
  return (
    <span style={{
      flex: 1,
      minWidth: 16,
      height: '1.2em',
      margin: '0 0.5rem',
      overflow: 'hidden',
      color: 'rgba(201, 168, 76, 0.35)',
      fontFamily: "'Inter', sans-serif",
      fontSize: 'inherit',
      alignSelf: 'flex-end',
      lineHeight: '1em',
      letterSpacing: '0.15em',
      textAlign: 'right',
      whiteSpace: 'nowrap',
    }}>
      {'································'}
    </span>
  )
}

function ItemImage({ url }) {
  if (!url) return <span style={{ marginRight: 10, fontSize: '1.2rem' }}>🍽️</span>
  return (
    <img
      src={url}
      alt=""
      onError={(e) => { e.currentTarget.style.display = 'none' }}
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        objectFit: 'cover',
        marginRight: 10,
        flexShrink: 0,
        border: '1px solid rgba(201, 168, 76, 0.2)',
      }}
    />
  )
}

export default function LayoutBrasserie({ categories = [], allAddons = [], offline, menu = {}, title }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const businessHours = menu?.businessHours || 'MON–VEN: 11H–22H • SAM–DIM: 10H–23H'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;600;700&display=swap');
        @keyframes pixelShift { 0%, 99.9% { transform: translate(0,0); } 100% { transform: translate(2px,1px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glowPulse { 0%, 100% { text-shadow: 0 0 10px rgba(201,168,76,0.1); } 50% { text-shadow: 0 0 25px rgba(201,168,76,0.25); } }
        .brasserie-bg::before {
          content: '';
          position: absolute; inset: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px 256px;
          pointer-events: none;
          z-index: 0;
        }

        /* Portrait: unlock scrolling, stack to one column (TV/landscape untouched) */
        @media (orientation: portrait) {
          .layout-brasserie-root {
            height: auto !important;
            min-height: 100vh !important;
            overflow: visible !important;
          }
          .layout-brasserie-root > div {
            height: auto !important;
            overflow: visible !important;
          }
          .layout-brasserie-root > div > div:nth-child(2) {
            overflow: visible !important;
          }
          .layout-brasserie-root .brasserie-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div className="brasserie-bg layout-brasserie-root" style={{
        height: '100%', width: '100%', overflow: 'hidden',
        background: 'radial-gradient(circle at 20% 80%, #F5EDDF, #FDF8F0)',
        position: 'relative',
        fontFamily: "'Inter', 'Arial', sans-serif",
      }}>
        <div style={{
          height: '100%', width: '100%', overflow: 'hidden',
          padding: 'clamp(1.5rem, 3vw, 3.5rem) clamp(2rem, 4vw, 5rem)',
          display: 'flex', flexDirection: 'column',
          position: 'relative', zIndex: 1,
          animation: 'pixelShift 300s linear infinite',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}>
          <div style={{ flex: 'none', textAlign: 'center' }}>
            <GoldLine />
            <div style={{ height: 'clamp(1rem, 1.5vw, 2rem)' }} />
            <h1 style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontWeight: 700,
              fontSize: 'clamp(2.4rem, 4vw, 4.2rem)',
              color: '#2C1810',
              letterSpacing: '2px',
              lineHeight: 1.1,
              animation: mounted ? 'glowPulse 4s ease-in-out infinite' : 'none',
            }}>
              {title || 'NOTRE MENU'}
            </h1>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 'clamp(0.85rem, 1.2vw, 1.4rem)',
              color: '#7A6B5A',
              letterSpacing: '1px',
              marginTop: 'clamp(0.3rem, 0.5vw, 0.6rem)',
            }}>
              {menu?.tagline || 'Fait maison avec amour'}
            </p>
            <div style={{ height: 'clamp(1rem, 1.5vw, 2rem)' }} />
            <GoldLine />
          </div>

          <div style={{
            flex: 1, width: '100%', overflow: 'hidden',
            maxWidth: 'clamp(500px, 55vw, 800px)',
            margin: 'clamp(1rem, 1.5vw, 2rem) auto 0',
            animation: mounted ? 'fadeUp 0.5s ease-out' : 'none',
          }}>
            {categories.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A6B5A', fontSize: '1.25rem' }}>
                No items yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 1.8vw, 2.5rem)' }}>
                {categories.map((cat, ci) => (
                  <div key={ci}>
                    <h2 style={{
                      fontFamily: "'Playfair Display', 'Georgia', serif",
                      fontWeight: 700,
                      fontSize: 'clamp(1.2rem, 1.8vw, 2rem)',
                      color: '#2C1810',
                      textTransform: 'uppercase',
                      letterSpacing: '4px',
                      textAlign: 'center',
                      marginBottom: 'clamp(0.4rem, 0.6vw, 0.75rem)',
                    }}>
                      {cat.name}
                    </h2>
                    <div style={{
                      width: '30%', margin: '0 auto',
                      height: 1, background: 'rgba(201, 168, 76, 0.4)',
                      marginBottom: 'clamp(0.5rem, 0.8vw, 1rem)',
                    }} />
                    <div className="brasserie-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: cat.items?.length > 3 ? '1fr 1fr' : '1fr',
                      gap: 'clamp(0.4rem, 0.6vw, 0.8rem)',
                    }}>
                      {(cat.items || []).map((item, j) => (
                        <div key={j} style={{
                          display: 'flex', alignItems: 'center',
                          gap: 4,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                            <ItemImage url={item.imageUrl} />
                            <span style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 400,
                              fontSize: 'clamp(0.9rem, 1.2vw, 1.4rem)',
                              color: '#3A2C1E',
                              lineHeight: 1.3,
                            }}>
                              {item.name}
                            </span>
                          </div>
                          <Dots />
                          <span style={{
                            fontFamily: "'Playfair Display', 'Georgia', serif",
                            fontWeight: 700,
                            fontSize: 'clamp(0.95rem, 1.3vw, 1.5rem)',
                            color: '#C9A84C',
                            whiteSpace: 'nowrap',
                            marginLeft: 4,
                          }}>
                            {item.price} <span style={{ fontSize: '0.6em', fontWeight: 400, color: '#7A6B5A' }}>{menu?.currency || 'DA'}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                    {cat.addons && cat.addons.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                        {cat.addons.map((addon, aj) => (
                          <span key={aj} style={{
                            background: '#F5EDDF',
                            color: '#2C1810',
                            padding: '4px 16px',
                            borderRadius: 20,
                            fontSize: 'clamp(0.75rem, 1vw, 1.1rem)',
                            fontStyle: 'italic',
                            border: '1px solid rgba(201,168,76,0.15)',
                          }}>
                            + {addon.name} – {menu?.currency || 'DA'}{addon.price}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 'none', textAlign: 'center', marginTop: 'clamp(0.75rem, 1vw, 1.5rem)' }}>
            {allAddons.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 'clamp(0.5rem, 0.75vw, 1rem)' }}>
                {allAddons.map((addon, aj) => (
                  <span key={aj} style={{
                    background: '#F5EDDF',
                    color: '#2C1810',
                    padding: '4px 16px',
                    borderRadius: 20,
                    fontSize: 'clamp(0.75rem, 1vw, 1.1rem)',
                    fontStyle: 'italic',
                    border: '1px solid rgba(201,168,76,0.15)',
                  }}>
                    + {addon.name} – {menu?.currency || 'DA'}{addon.price}
                  </span>
                ))}
              </div>
            )}
            <GoldLine />
            <p style={{
              fontFamily: "'Inter', sans-serif",
              color: '#7A6B5A',
              fontSize: 'clamp(0.7rem, 0.9vw, 1rem)',
              fontStyle: 'italic',
              marginTop: 'clamp(0.4rem, 0.6vw, 0.75rem)',
              letterSpacing: '1px',
            }}>
              {businessHours}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

