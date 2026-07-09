import React, { useEffect, useState } from 'react'

function GoldDiamondLine() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 auto', width: '70%' }}>
      <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
      <span style={{ color: '#D4AF37', fontSize: 'clamp(0.5rem, 0.6vw, 0.8rem)' }}>◆</span>
      <span style={{ color: '#D4AF37', fontSize: 'clamp(0.7rem, 0.9vw, 1.1rem)' }}>✦</span>
      <span style={{ color: '#D4AF37', fontSize: 'clamp(0.5rem, 0.6vw, 0.8rem)' }}>◆</span>
      <div style={{ flex: 1, height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
    </div>
  )
}

function ItemImage({ url }) {
  if (!url) return <span style={{ marginRight: 10, fontSize: '1.2rem' }}>🥗</span>
  return (
    <img
      src={url}
      alt=""
      style={{
        width: 50, height: 50,
        borderRadius: 10,
        objectFit: 'cover',
        marginRight: 12,
        flexShrink: 0,
        border: '1px solid rgba(212, 175, 55, 0.25)',
      }}
    />
  )
}

export default function LayoutMoroccan({ categories = [], allAddons = [], offline, menu = {}, title }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const businessHours = menu?.businessHours || 'LUN–VEN: 11H–22H • SAM–DIM: 10H–23H'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,700;1,300&family=Inter:wght@200;300;400;600&display=swap');
        @keyframes pixelShift { 0%, 99.9% { transform: translate(0,0); } 100% { transform: translate(2px,1px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes goldShimmer { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        .moroccan-pattern {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(212,175,55,0.02) 40px, rgba(212,175,55,0.02) 41px),
            repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(212,175,55,0.02) 40px, rgba(212,175,55,0.02) 41px);
        }
      `}</style>
      <div style={{
        height: '100%', width: '100%', overflow: 'hidden',
        background: 'radial-gradient(circle at 70% 30%, #1A4A4A, #0D2A2A)',
        position: 'relative',
        fontFamily: "'Inter', 'Arial', sans-serif",
      }}>
        <div className="moroccan-pattern" />
        <div style={{
          height: '100%', width: '100%', overflow: 'hidden',
          padding: 'clamp(1.5rem, 3vw, 3.5rem) clamp(2rem, 4vw, 5rem)',
          display: 'flex', flexDirection: 'column',
          position: 'relative', zIndex: 1,
          animation: 'pixelShift 300s linear infinite',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}>
          {offline && <OfflineBanner />}

          <div style={{ flex: 'none', textAlign: 'center' }}>
            <GoldDiamondLine />
            <div style={{ height: 'clamp(0.75rem, 1.2vw, 1.5rem)' }} />
            <h1 style={{
              fontFamily: "'Cormorant Garamond', 'Georgia', serif",
              fontWeight: 700,
              fontSize: 'clamp(2.6rem, 5vw, 5rem)',
              color: '#D4AF37',
              letterSpacing: '6px',
              lineHeight: 1.1,
              textShadow: '0 0 20px rgba(212, 175, 55, 0.2)',
            }}>
              {title || 'NOTRE MENU'}
            </h1>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(0.8rem, 1.1vw, 1.3rem)',
              color: '#A8C4C0',
              letterSpacing: '3px',
              marginTop: 'clamp(0.3rem, 0.5vw, 0.6rem)',
            }}>
              {menu?.tagline || 'Saveurs d’Orient'}
            </p>
            <div style={{ height: 'clamp(0.75rem, 1.2vw, 1.5rem)' }} />
            <GoldDiamondLine />
          </div>

          <div style={{
            flex: 1, width: '100%', overflow: 'hidden',
            maxWidth: 'clamp(520px, 58vw, 840px)',
            margin: 'clamp(0.75rem, 1.2vw, 1.5rem) auto 0',
            animation: mounted ? 'fadeUp 0.5s ease-out' : 'none',
          }}>
            {categories.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(168,196,192,0.4)', fontSize: '1.25rem' }}>
                No items yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 1.5vw, 2rem)' }}>
                {categories.map((cat, ci) => (
                  <div key={ci}>
                    <h2 style={{
                      fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                      fontWeight: 700,
                      fontSize: 'clamp(1.4rem, 2.2vw, 2.5rem)',
                      color: '#D4AF37',
                      textTransform: 'uppercase',
                      letterSpacing: '5px',
                      textAlign: 'center',
                      paddingBottom: 'clamp(0.3rem, 0.5vw, 0.6rem)',
                      marginBottom: 'clamp(0.4rem, 0.6vw, 0.75rem)',
                      borderBottom: '2px solid rgba(212, 175, 55, 0.4)',
                    }}>
                      {cat.name}
                    </h2>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: cat.items?.length > 6 ? '1fr 1fr' : '1fr',
                      gap: 'clamp(0.4rem, 0.5vw, 0.7rem)',
                    }}>
                      {(cat.items || []).map((item, j) => (
                        <div key={j} style={{
                          display: 'flex', alignItems: 'center',
                          background: 'rgba(255,255,255,0.04)',
                          borderRadius: 12,
                          padding: 'clamp(0.4rem, 0.6vw, 0.8rem) clamp(0.6rem, 0.8vw, 1rem)',
                        }}>
                          <ItemImage url={item.imageUrl} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 300,
                              fontSize: 'clamp(0.85rem, 1.2vw, 1.5rem)',
                              color: '#E8DDD0',
                              lineHeight: 1.3,
                            }}>
                              {item.name}
                            </span>
                          </div>
                          <span style={{
                            fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                            fontWeight: 700,
                            fontSize: 'clamp(1rem, 1.5vw, 1.8rem)',
                            color: '#D4AF37',
                            whiteSpace: 'nowrap',
                            marginLeft: 8,
                          }}>
                            {item.price} <span style={{ fontSize: '0.55em', fontWeight: 300, color: '#A8C4C0' }}>{menu?.currency || 'MAD'}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                    {cat.addons && cat.addons.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6, justifyContent: 'center' }}>
                        {cat.addons.map((addon, aj) => (
                          <span key={aj} style={{
                            background: 'rgba(212, 175, 55, 0.12)',
                            border: '1px solid rgba(212, 175, 55, 0.5)',
                            color: '#D4AF37',
                            borderRadius: 30,
                            padding: '3px 18px',
                            fontSize: 'clamp(0.75rem, 0.9vw, 1rem)',
                            fontStyle: 'italic',
                          }}>
                            + {addon.name} – {menu?.currency || 'MAD'}{addon.price}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 'none', textAlign: 'center', marginTop: 'clamp(0.5rem, 0.75vw, 1rem)' }}>
            {allAddons.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 'clamp(0.4rem, 0.6vw, 0.75rem)' }}>
                {allAddons.map((addon, aj) => (
                  <span key={aj} style={{
                    background: 'rgba(212, 175, 55, 0.12)',
                    border: '1px solid rgba(212, 175, 55, 0.5)',
                    color: '#D4AF37',
                    borderRadius: 30,
                    padding: '3px 18px',
                    fontSize: 'clamp(0.75rem, 0.9vw, 1rem)',
                    fontStyle: 'italic',
                  }}>
                    + {addon.name} – {menu?.currency || 'MAD'}{addon.price}
                  </span>
                ))}
              </div>
            )}
            <div style={{ width: '40%', margin: '0 auto', height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }} />
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              color: '#A8C4C0',
              fontSize: 'clamp(0.7rem, 0.85vw, 0.95rem)',
              letterSpacing: '2px',
              marginTop: 'clamp(0.3rem, 0.5vw, 0.6rem)',
            }}>
              {businessHours}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function OfflineBanner() {
  return (
    <div style={{
      position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 50, background: '#D4AF37', color: '#0D2A2A',
      padding: '0.5rem 1.5rem', fontSize: '0.875rem', fontWeight: 600,
      fontFamily: "'Inter', sans-serif", letterSpacing: '2px',
    }}>
      OFFLINE — CACHED MENU
    </div>
  )
}
