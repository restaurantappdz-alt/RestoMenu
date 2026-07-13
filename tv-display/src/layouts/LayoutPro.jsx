import React, { useEffect, useState } from 'react'

const CATEGORY_ICONS = {
  default: '🍽️',
  drink: '☕',
  coffee: '☕',
  tea: '🫖',
  juice: '🧃',
  smoothie: '🥤',
  main: '🥩',
  sandwich: '🥪',
  burger: '🍔',
  pizza: '🍕',
  pasta: '🍝',
  salad: '🥗',
  soup: '🍜',
  fish: '🐟',
  meat: '🥩',
  chicken: '🍗',
  dessert: '🍰',
  cake: '🎂',
  icecream: '🍦',
  breakfast: '🍳',
  starter: '🥟',
  appetizer: '🥟',
  side: '🥔',
  bread: '🥖',
  cheese: '🧀',
  fruit: '🍓',
  special: '⭐',
  grill: '🔥',
  tagine: '🍲',
  couscous: '🥘',
}

function getCategoryIcon(name) {
  if (!name) return CATEGORY_ICONS.default
  const key = name.toLowerCase().trim()
  for (const [k, v] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(k)) return v
  }
  return CATEGORY_ICONS.default
}

function GoldDivider({ variant = 'dots' }) {
  if (variant === 'line') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto', width: '100%', maxWidth: 'clamp(200px, 30vw, 400px)' }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6))' }} />
        <span style={{ color: '#D4AF37', fontSize: 'clamp(0.55rem, 0.7vw, 0.85rem)' }}>◈</span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(212,175,55,0.6), transparent)' }} />
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 4, height: 4,
          borderRadius: '50%',
          background: i === 1 ? '#D4AF37' : 'rgba(212,175,55,0.3)',
          display: 'block',
        }} />
      ))}
    </div>
  )
}

function ItemImage({ url }) {
  if (!url) return (
    <span style={{ marginRight: 8, fontSize: 'clamp(0.9rem, 1.1vw, 1.3rem)', filter: 'grayscale(0.3)', opacity: 0.7 }}>✦</span>
  )
  return (
    <div style={{
      width: 36, height: 36,
      borderRadius: 4,
      overflow: 'hidden',
      marginRight: 10,
      flexShrink: 0,
      border: '1px solid rgba(212,175,55,0.15)',
    }}>
      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}

export default function LayoutPro({ categories = [], allAddons = [], offline, menu = {}, title }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const businessHours = menu?.businessHours || 'MON–FRI  10AM–10PM  •  SAT–SUN  9AM–11PM'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@200;300;400;500;600;700&display=swap');
        @keyframes pixelShift { 0%, 99.9% { transform: translate(0,0); } 100% { transform: translate(2px,1px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes goldBreath { 0%, 100% { text-shadow: 0 0 20px rgba(212,175,55,0.15); } 50% { text-shadow: 0 0 40px rgba(212,175,55,0.3); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      `}</style>
      <div style={{
        height: '100%', width: '100%', overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Inter', 'Arial', sans-serif",
        background: '#0D0D0D',
      }}>
        {/* Full-screen background with dark overlay — simulates a premium stock photo */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(45,35,25,0.6), transparent 60%),
            radial-gradient(ellipse at 70% 80%, rgba(20,15,10,0.8), transparent 50%),
            linear-gradient(135deg, #1A1510 0%, #0D0D0D 40%, #1A1510 70%, #0D0D0D 100%)
          `,
          zIndex: 0,
        }} />

        {/* Subtle MagicPattern-style dot grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          opacity: 0.08,
          backgroundImage: `
            radial-gradient(circle, rgba(212,175,55,0.6) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }} />

        {/* Subtle wavy gold accent line at top */}
        <svg style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, pointerEvents: 'none' }} viewBox="0 0 1440 60" preserveAspectRatio="none" width="100%" height="clamp(30px, 4vw, 60px)">
          <path d="M0,30 C240,0 480,60 720,30 C960,0 1200,60 1440,30 L1440,0 L0,0 Z" fill="rgba(212,175,55,0.08)" />
          <path d="M0,35 C240,5 480,65 720,35 C960,5 1200,65 1440,35 L1440,0 L0,0 Z" fill="rgba(212,175,55,0.04)" />
        </svg>

        {/* Corner ornaments */}
        <svg style={{ position: 'absolute', top: 'clamp(1rem, 2vw, 2.5rem)', left: 'clamp(1rem, 2vw, 2.5rem)', zIndex: 2, pointerEvents: 'none' }} width="clamp(24px, 3vw, 48px)" height="clamp(24px, 3vw, 48px)" viewBox="0 0 48 48">
          <path d="M48,0 L48,6 C48,6 42,0 48,0 Z" fill="rgba(212,175,55,0.2)" />
          <path d="M48,0 L42,0 C42,0 48,6 48,0 Z" fill="rgba(212,175,55,0.3)" />
        </svg>
        <svg style={{ position: 'absolute', top: 'clamp(1rem, 2vw, 2.5rem)', right: 'clamp(1rem, 2vw, 2.5rem)', zIndex: 2, pointerEvents: 'none', transform: 'scaleX(-1)' }} width="clamp(24px, 3vw, 48px)" height="clamp(24px, 3vw, 48px)" viewBox="0 0 48 48">
          <path d="M48,0 L48,6 C48,6 42,0 48,0 Z" fill="rgba(212,175,55,0.2)" />
          <path d="M48,0 L42,0 C42,0 48,6 48,0 Z" fill="rgba(212,175,55,0.3)" />
        </svg>

        <div style={{
          height: '100%', width: '100%', overflow: 'hidden',
          padding: 'clamp(1.5rem, 3vw, 3.5rem) clamp(2rem, 4vw, 5rem)',
          display: 'flex', flexDirection: 'column',
          position: 'relative', zIndex: 3,
          animation: 'pixelShift 300s linear infinite',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}>
          {/* Header */}
          <div style={{ flex: 'none', textAlign: 'center' }}>
            <div style={{ height: 'clamp(0.5rem, 0.8vw, 1rem)' }} />
            <h1 style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontWeight: 700,
              fontSize: 'clamp(2.2rem, 4vw, 4.5rem)',
              color: '#D4AF37',
              letterSpacing: '3px',
              lineHeight: 1.15,
              animation: mounted ? 'goldBreath 4s ease-in-out infinite' : 'none',
            }}>
              {title || 'MENU'}
            </h1>
            <div style={{ height: 'clamp(0.3rem, 0.5vw, 0.6rem)' }} />
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(0.75rem, 1vw, 1.2rem)',
              color: '#F5E6D3',
              opacity: 0.7,
              letterSpacing: '2px',
            }}>
              {menu?.tagline || 'Crafted with passion, served with pride'}
            </p>
            <div style={{ height: 'clamp(0.5rem, 0.8vw, 1rem)' }} />
            <GoldDivider variant="line" />
            <div style={{ height: 'clamp(0.3rem, 0.5vw, 0.6rem)' }} />
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 'clamp(0.4rem, 0.6vw, 0.8rem)',
            }}>
              {['✦', '❀', '✦'].map((s, i) => (
                <span key={i} style={{
                  color: i === 1 ? '#D4AF37' : 'rgba(212,175,55,0.3)',
                  fontSize: 'clamp(0.5rem, 0.7vw, 0.9rem)',
                }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Body */}
          <div style={{
            flex: 1, width: '100%', overflow: 'hidden',
            maxWidth: 'clamp(520px, 56vw, 820px)',
            margin: 'clamp(0.75rem, 1.2vw, 1.5rem) auto 0',
            animation: mounted ? 'fadeUp 0.6s ease-out' : 'none',
          }}>
            {categories.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(245,230,211,0.25)', fontSize: '1.25rem', fontStyle: 'italic' }}>
                No items yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.75rem, 1.2vw, 1.5rem)' }}>
                {categories.map((cat, ci) => (
                  <div key={ci}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      marginBottom: 'clamp(0.3rem, 0.5vw, 0.6rem)',
                    }}>
                      <span style={{ fontSize: 'clamp(0.85rem, 1.1vw, 1.3rem)' }}>
                        {getCategoryIcon(cat.name)}
                      </span>
                      <h2 style={{
                        fontFamily: "'Playfair Display', 'Georgia', serif",
                        fontWeight: 600,
                        fontSize: 'clamp(1.1rem, 1.6vw, 1.9rem)',
                        color: '#F5E6D3',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                      }}>
                        {cat.name}
                      </h2>
                      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(212,175,55,0.3), transparent)' }} />
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: cat.items?.length > 4 ? '1fr 1fr' : '1fr',
                      gap: 'clamp(0.2rem, 0.3vw, 0.4rem)',
                    }}>
                      {(cat.items || []).map((item, j) => (
                        <div key={j} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: 'clamp(0.3rem, 0.4vw, 0.5rem) 0',
                          borderBottom: '1px solid rgba(245,230,211,0.04)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                            <ItemImage url={item.imageUrl} />
                            <span style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 300,
                              fontSize: 'clamp(0.8rem, 1.1vw, 1.3rem)',
                              color: '#F5E6D3',
                              lineHeight: 1.3,
                            }}>
                              {item.name}
                            </span>
                          </div>
                          <span style={{
                            fontFamily: "'Playfair Display', 'Georgia', serif",
                            fontWeight: 700,
                            fontSize: 'clamp(0.85rem, 1.15vw, 1.4rem)',
                            color: '#D4AF37',
                            whiteSpace: 'nowrap',
                            marginLeft: 8,
                          }}>
                            {item.price} <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: '0.6em', color: 'rgba(212,175,55,0.5)' }}>{menu?.currency || 'MAD'}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                    {cat.addons && cat.addons.length > 0 && (
                      <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: 6,
                        marginTop: 'clamp(0.3rem, 0.4vw, 0.5rem)',
                      }}>
                        {cat.addons.map((addon, aj) => (
                          <span key={aj} style={{
                            background: 'rgba(212,175,55,0.08)',
                            border: '1px solid rgba(212,175,55,0.3)',
                            borderRadius: 30,
                            padding: '2px 14px',
                            color: '#D4AF37',
                            fontSize: 'clamp(0.65rem, 0.8vw, 0.95rem)',
                            fontStyle: 'italic',
                            fontFamily: "'Inter', sans-serif",
                          }}>
                            + {addon.name} <span style={{ fontWeight: 600 }}>{menu?.currency || 'MAD'}{addon.price}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ flex: 'none', textAlign: 'center', marginTop: 'clamp(0.5rem, 0.75vw, 1rem)' }}>
            {allAddons.length > 0 && (
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center',
                marginBottom: 'clamp(0.3rem, 0.5vw, 0.6rem)',
              }}>
                {allAddons.map((addon, aj) => (
                  <span key={aj} style={{
                    background: 'rgba(212,175,55,0.08)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    borderRadius: 30,
                    padding: '2px 14px',
                    color: '#D4AF37',
                    fontSize: 'clamp(0.65rem, 0.8vw, 0.95rem)',
                    fontStyle: 'italic',
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    + {addon.name} <span style={{ fontWeight: 600 }}>{menu?.currency || 'MAD'}{addon.price}</span>
                  </span>
                ))}
              </div>
            )}
            <GoldDivider variant="line" />
            <div style={{ height: 'clamp(0.3rem, 0.5vw, 0.6rem)' }} />
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 200,
              color: 'rgba(245,230,211,0.4)',
              fontSize: 'clamp(0.6rem, 0.75vw, 0.85rem)',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}>
              {businessHours}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
