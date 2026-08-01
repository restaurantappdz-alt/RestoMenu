import React, { useEffect, useState } from 'react'
import topLeftIvy from '@svgs/plants/hanging_ivy.png'
import topMiddlePlant from '@svgs/plants/hanging3.png'
import bottomLeftPot from '@svgs/plants/simple plant.png'
import bottomRightPot from '@svgs/plants/plant svg.png'

const COLOR_GRADE_FILTER =
  'brightness(0.80) saturate(0.60) hue-rotate(12deg) contrast(0.88)'
const BG_BLUR = 'blur(1.5px)'

export default function LayoutNatureBistro({ categories = [], allAddons = [], offline, menu = {}, title }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const businessHours = menu?.businessHours || 'MON–FRI  10AM–10PM  •  SAT–SUN  9AM–11PM'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@200;300;400;500;600&display=swap');
        @keyframes pixelShift { 0%, 99.9% { transform: translate(0,0); } 100% { transform: translate(2px,1px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sway { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
        .sway { animation: sway 4s ease-in-out infinite; }
        .noise-overlay {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 256px 256px;
        }
        /* Portrait (phone) adaptation only — TV/landscape untouched */
        @media (orientation: portrait) {
          .layout-naturebistro-root {
            height: auto !important;
            min-height: 100vh;
            overflow: visible !important;
            animation: none !important;
          }
          .layout-naturebistro-root .nb-plant-tl,
          .layout-naturebistro-root .nb-plant-tm,
          .layout-naturebistro-root .nb-plant-bl,
          .layout-naturebistro-root .nb-plant-br {
            position: fixed !important;
          }
          .layout-naturebistro-root .nb-plant-tl { top: -20px !important; left: 2% !important; }
          .layout-naturebistro-root .nb-plant-tm { top: -20px !important; left: 50% !important; }
          .layout-naturebistro-root .nb-plant-bl { bottom: 0 !important; left: 4% !important; }
          .layout-naturebistro-root .nb-plant-br { bottom: 0 !important; right: 8% !important; }
          .layout-naturebistro-root .layout-naturebistro-card {
            top: auto !important;
            transform: none !important;
            max-height: none !important;
            overflow: visible !important;
            justify-content: flex-start !important;
            margin: clamp(1rem, 3vh, 2rem) auto !important;
          }
          .layout-naturebistro-root .nb-card-content {
            flex: 0 0 auto !important;
            overflow: visible !important;
          }
          .layout-naturebistro-root .nb-grid {
            grid-template-columns: 1fr !important;
          }
          .layout-naturebistro-root .nb-item-name {
            white-space: normal !important;
          }
        }
      `}</style>

      <div className="layout-naturebistro-root" style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        fontFamily: "'Inter', 'Arial', sans-serif",
        background: 'radial-gradient(circle, #FAF9F6 40%, #EFEBE4 100%)',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.6s ease',
        animation: 'pixelShift 300s linear infinite',
      }}>
        <div className="noise-overlay" />

        {/* ── Background plants (blurred, color-graded, overlap behind card) ── */}
        <div className="nb-plant-bl" style={{ position: 'absolute', bottom: '-3%', left: '6%', zIndex: 0 }}>
          <img
            src={bottomLeftPot}
            alt=""
            style={{
              display: 'block',
              width: 'min(480px, 40vw)',
              height: 'auto',
              objectFit: 'contain',
              pointerEvents: 'none',
              mixBlendMode: 'multiply',
              filter: `${COLOR_GRADE_FILTER} ${BG_BLUR} drop-shadow(0 14px 28px rgba(0,25,0,0.35))`,
              opacity: 0.88,
            }}
          />
        </div>
        <div className="nb-plant-br" style={{ position: 'absolute', bottom: '2%', right: '12%', zIndex: 0 }}>
          <img
            src={bottomRightPot}
            alt=""
            style={{
              display: 'block',
              width: 'min(260px, 24vw)',
              height: 'auto',
              objectFit: 'contain',
              pointerEvents: 'none',
              mixBlendMode: 'multiply',
              filter: `${COLOR_GRADE_FILTER} ${BG_BLUR} drop-shadow(0 14px 28px rgba(0,25,0,0.35))`,
              opacity: 0.88,
            }}
          />
        </div>

        {/* ── Foreground plants (color-graded, overlap behind card edges) ── */}
          <img
            src={topLeftIvy}
            alt=""
            className="sway nb-plant-tl"
            style={{
              position: 'absolute',
              top: '-20px',
              left: '4%',
              width: 'min(300px, 30vw)',
              height: 'auto',
              objectFit: 'contain',
              pointerEvents: 'none',
              mixBlendMode: 'multiply',
              filter: `${COLOR_GRADE_FILTER} drop-shadow(0 6px 18px rgba(0,25,0,0.12))`,
              opacity: 0.9,
              zIndex: 5,
            }}
        />
          <img
            src={topMiddlePlant}
            alt=""
            className="sway nb-plant-tm"
            style={{
              position: 'absolute',
              top: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(340px, 34vw)',
              height: 'auto',
              objectFit: 'contain',
              pointerEvents: 'none',
              mixBlendMode: 'multiply',
              filter: `${COLOR_GRADE_FILTER} drop-shadow(0 6px 18px rgba(0,25,0,0.12))`,
              opacity: 0.9,
              zIndex: 5,
            }}
        />

        {/* ── Glassmorphism Card ── */}
        <div className="layout-naturebistro-card" style={{
          position: 'relative',
          zIndex: 10,
          width: 'min(90%, 1040px)',
          maxHeight: '84vh',
          margin: '0 auto',
          top: '50%',
          transform: 'translateY(-50%)',
          padding: 'clamp(2rem,3.5vw,3.5rem) clamp(2.5rem,4vw,5rem)',
          background: 'rgba(255,255,255,0.20)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
          border: '1px solid rgba(255,255,255,0.30)',
          borderRadius: 32,
          boxShadow: `
            0 30px 80px rgba(0,20,0,0.14),
            0 12px 28px rgba(0,20,0,0.08),
            inset 0 1px 0 rgba(255,255,255,0.40)
          `,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          animation: mounted ? 'fadeUp 0.8s ease-out' : 'none',
        }}>
          <h1 style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontWeight: 700,
            fontSize: 'clamp(2.8rem, 5vw, 4.5rem)',
            color: '#1A3A2A',
            textAlign: 'center',
            letterSpacing: '1px',
            lineHeight: 1.1,
            marginBottom: 'clamp(0.1rem,0.15vw,0.2rem)',
          }}>
            {title || 'NOTRE MENU'}
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(1rem, 1.5vw, 1.4rem)',
            color: '#5A6B5A',
            textAlign: 'center',
            marginBottom: 'clamp(0.6rem,1vw,1.25rem)',
          }}>
            {menu?.tagline || 'Fresh from nature, served with love'}
          </p>

          <div className="nb-card-content" style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(0.2rem,0.35vw,0.45rem)',
          }}>
            {categories.length === 0 ? (
              <div style={{
                height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#5A6B5A', fontSize: '1.25rem', fontStyle: 'italic', opacity: 0.5,
              }}>
                No items yet
              </div>
            ) : (
              categories.map((cat, ci) => (
                <div key={ci}>
                  <h2 style={{
                    fontFamily: "'Playfair Display', 'Georgia', serif",
                    fontWeight: 600,
                    fontSize: 'clamp(1.5rem, 2.2vw, 2.2rem)',
                    color: '#1A3A2A',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    textAlign: 'center',
                    marginBottom: 'clamp(0.2rem,0.3vw,0.4rem)',
                    paddingBottom: 'clamp(0.15rem,0.25vw,0.3rem)',
                    borderBottom: '1px solid rgba(123,163,123,0.15)',
                  }}>
                    🌿 {cat.name} 🌿
                  </h2>
                  <div className="nb-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: cat.items?.length > 4 ? '1fr 1fr' : '1fr',
                    gap: 'clamp(0.15rem,0.2vw,0.25rem)',
                  }}>
                    {(cat.items || []).map((item, j) => (
                      <div key={j} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'clamp(0.35rem,0.5vw,0.6rem) clamp(0.5rem,0.8vw,1rem)',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: 12,
                      }}>
                        <span className="nb-item-name" style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 500,
                          fontSize: 'clamp(1.3rem, 1.8vw, 1.7rem)',
                          color: '#1A3A2A',
                          lineHeight: 1.3,
                          whiteSpace: 'nowrap',
                        }}>
                          {item.name}
                        </span>
                        <div style={{
                          flex: 1,
                          height: 'clamp(0.85rem,1vw,1.1rem)',
                          margin: '0 clamp(0.3rem,0.5vw,0.6rem)',
                          alignSelf: 'center',
                          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="16" viewBox="0 0 40 16"><path d="M0,8 Q20,12 40,8" fill="none" stroke="%232c4a3e" stroke-width="0.8" opacity="0.7"/><path d="M20,9 Q15,3 24,3 Q24,8 20,9 Z" fill="%232c4a3e" opacity="0.6"/></svg>')`,
                          backgroundSize: '40px auto',
                          backgroundRepeat: 'repeat-x',
                          backgroundPosition: 'center',
                          opacity: 0.55,
                        }} />
                        <span style={{
                          fontFamily: "'Playfair Display', 'Georgia', serif",
                          fontWeight: 700,
                          fontSize: 'clamp(1.3rem, 1.8vw, 1.7rem)',
                          color: '#1A3A2A',
                          whiteSpace: 'nowrap',
                        }}>
                          {item.price} <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '0.55em', color: '#5A6B5A' }}>{menu?.currency || 'MAD'}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  {cat.addons && cat.addons.length > 0 && (
                    <div style={{
                      marginTop: 'clamp(0.2rem,0.25vw,0.3rem)',
                      textAlign: 'center',
                    }}>
                      {cat.addons.map((addon, aj) => (
                        <span key={aj} style={{
                          display: 'inline-block',
                          padding: '3px 20px',
                          background: 'rgba(123,163,123,0.06)',
                          border: '1px solid rgba(123,163,123,0.15)',
                          borderRadius: 30,
                          fontSize: 'clamp(0.85rem, 1.1vw, 1.05rem)',
                          color: '#5A6B5A',
                          fontFamily: "'Inter', sans-serif",
                          fontStyle: 'italic',
                        }}>
                          + {addon.name} – {menu?.currency || 'MAD'}{addon.price}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div style={{
            marginTop: 'clamp(0.35rem,0.5vw,0.75rem)',
            paddingTop: 'clamp(0.25rem,0.35vw,0.5rem)',
            borderTop: '1px solid rgba(123,163,123,0.08)',
            textAlign: 'center',
            fontFamily: "'Inter', sans-serif",
            color: '#5A6B5A',
            fontSize: 'clamp(0.8rem, 1vw, 0.95rem)',
            fontWeight: 300,
            letterSpacing: '1px',
          }}>
            {businessHours}
          </div>
        </div>
      </div>
    </>
  )
}
