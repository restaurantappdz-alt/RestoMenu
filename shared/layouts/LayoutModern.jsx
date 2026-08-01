import React, { useEffect, useState } from 'react'

const EMOJIS = ['🥐', '☕', '🥗', '🍳', '🥂', '🍝', '🥩', '🐟', '🧀', '🍰', '🥑', '🍓', '🫐', '🥖', '🍷']

function GoldCircleLine() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 auto', width: '30%' }}>
      <div style={{ flex: 1, height: 1, background: '#D4AF37' }} />
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4AF37', flexShrink: 0 }} />
      <div style={{ flex: 1, height: 1, background: '#D4AF37' }} />
    </div>
  )
}

function ItemImage({ url }) {
  if (!url) return null
  return (
    <img
      src={url}
      alt=""
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        objectFit: 'cover',
        marginRight: 10,
        flexShrink: 0,
      }}
    />
  )
}

export default function LayoutModern({ categories = [], allAddons = [], offline, menu = {}, title }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const businessHours = menu?.businessHours || 'MON–FRI 10AM–6PM • SAT–SUN 12PM–8PM'
  let emojiIndex = 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&display=swap');
        @keyframes pixelShift { 0%, 99.9% { transform: translate(0,0); } 100% { transform: translate(2px,1px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes goldGlow { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
        /* Portrait phone adaptation — TV/landscape rules untouched. */
        @media (orientation: portrait) {
          .layout-modern-root {
            height: auto !important;
            min-height: 100vh !important;
            overflow: visible !important;
          }
          .layout-modern-root .lm-inner {
            height: auto !important;
            overflow: visible !important;
            padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 4vw, 2rem) !important;
          }
          .layout-modern-root .lm-middle {
            flex: none !important;
            max-width: 100% !important;
            overflow: visible !important;
          }
        }
      `}</style>
      <div className="layout-modern-root" style={{
        height: '100%', width: '100%', overflow: 'hidden',
        background: '#FFFFFF',
        boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
        position: 'relative',
        fontFamily: "'Inter', 'Arial', sans-serif",
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 3,
          background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
        }} />
        <div className="lm-inner" style={{
          height: '100%', width: '100%', overflow: 'hidden',
          padding: 'clamp(1.5rem, 3vw, 3.5rem) clamp(2rem, 4vw, 5rem)',
          display: 'flex', flexDirection: 'column',
          animation: 'pixelShift 300s linear infinite',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}>
          <div style={{ flex: 'none', textAlign: 'center' }}>
            <GoldCircleLine />
            <div style={{ height: 'clamp(0.75rem, 1.2vw, 1.5rem)' }} />
            <h1 style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(2rem, 3.5vw, 3.8rem)',
              color: '#1A1A1A',
              letterSpacing: '-1px',
              textTransform: 'uppercase',
              lineHeight: 1.1,
            }}>
              {title || 'MENU'}
            </h1>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(0.75rem, 1vw, 1.1rem)',
              color: '#888888',
              letterSpacing: '4px',
              marginTop: 'clamp(0.2rem, 0.3vw, 0.4rem)',
              textTransform: 'uppercase',
            }}>
              {menu?.tagline || 'FRESH & SEASONAL'}
            </p>
            <div style={{ height: 'clamp(0.75rem, 1.2vw, 1.5rem)' }} />
            <GoldCircleLine />
          </div>

          <div className="lm-middle" style={{
            flex: 1, width: '100%', overflow: 'hidden',
            maxWidth: 'clamp(480px, 50vw, 720px)',
            margin: 'clamp(0.75rem, 1.2vw, 1.5rem) auto 0',
            animation: mounted ? 'fadeUp 0.5s ease-out' : 'none',
          }}>
            {categories.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AAAAAA', fontSize: '1.25rem', fontWeight: 300 }}>
                No items yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 1.5vw, 2rem)' }}>
                {categories.map((cat, ci) => (
                  <div key={ci}>
                    <h2 style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: 'clamp(1rem, 1.5vw, 1.7rem)',
                      color: '#1A1A1A',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      marginBottom: 'clamp(0.4rem, 0.6vw, 0.75rem)',
                      paddingBottom: 'clamp(0.2rem, 0.3vw, 0.4rem)',
                      borderBottom: '2px solid #D4AF37',
                      display: 'inline-block',
                    }}>
                      {cat.name}
                    </h2>
                    <div>
                      {(cat.items || []).map((item, j) => {
                        const emoji = !item.imageUrl ? (EMOJIS[(emojiIndex++) % EMOJIS.length] + ' ') : ''
                        return (
                          <div key={j} style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 'clamp(0.4rem, 0.5vw, 0.6rem) 0',
                            borderBottom: '1px solid #F0F0F0',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                              <ItemImage url={item.imageUrl} />
                              <span style={{
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 300,
                                fontSize: 'clamp(0.9rem, 1.2vw, 1.4rem)',
                                color: '#1A1A1A',
                                lineHeight: 1.3,
                              }}>
                                {emoji}{item.name}
                              </span>
                            </div>
                            <span style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 700,
                              fontSize: 'clamp(0.9rem, 1.2vw, 1.4rem)',
                              color: '#D4AF37',
                              whiteSpace: 'nowrap',
                              marginLeft: 12,
                            }}>
                              {item.price} <span style={{ fontWeight: 300, fontSize: '0.65em', color: '#AAAAAA' }}>{menu?.currency || 'MAD'}</span>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    {cat.addons && cat.addons.length > 0 && (
                      <div style={{ marginTop: 'clamp(0.2rem, 0.3vw, 0.4rem)' }}>
                        {cat.addons.map((addon, aj) => (
                          <div key={aj} style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 'clamp(0.15rem, 0.2vw, 0.25rem) 0',
                          }}>
                            <span style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 300,
                              fontSize: 'clamp(0.75rem, 0.95vw, 1.1rem)',
                              color: '#888888',
                              fontStyle: 'italic',
                            }}>
                              + {addon.name}
                            </span>
                            <span style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 500,
                              fontSize: 'clamp(0.75rem, 0.95vw, 1.1rem)',
                              color: '#888888',
                              fontStyle: 'italic',
                            }}>
                              {menu?.currency || 'MAD'}{addon.price}
                            </span>
                          </div>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 'clamp(0.4rem, 0.6vw, 0.75rem)' }}>
                {allAddons.map((addon, aj) => (
                  <div key={aj} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 300,
                      fontSize: 'clamp(0.75rem, 0.9vw, 1rem)',
                      color: '#888888',
                      fontStyle: 'italic',
                    }}>
                      + {addon.name}
                    </span>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                      fontSize: 'clamp(0.75rem, 0.9vw, 1rem)',
                      color: '#888888',
                      fontStyle: 'italic',
                    }}>
                      {menu?.currency || 'MAD'}{addon.price}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <GoldCircleLine />
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              color: '#AAAAAA',
              fontSize: 'clamp(0.65rem, 0.8vw, 0.9rem)',
              letterSpacing: '1px',
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

