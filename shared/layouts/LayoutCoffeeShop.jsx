import React from 'react'

function GoldLine({ width = '50%', margin = '0 auto' }) {
  return (
    <div
      style={{
        width,
        margin,
        height: 1,
        background: 'rgba(201, 168, 76, 0.5)',
      }}
    />
  )
}

export default function LayoutCoffeeShop({
  categories = [],
  allAddons = [],
  offline,
  menu = {},
  title = 'BOULEVARD COFFEE SHOP & BAKERY',
}) {
  const businessHours =
    menu.businessHours || 'MON-FRI: 10AM TO 6PM. SAT-SUN: 12PM TO 8PM.'
  const currency = menu.currency || 'DA'

  const categoriesWithAddons = categories.map((cat) => ({
    ...cat,
    items: cat.items || [],
    addons: cat.addons || [],
  }))
  const hasGlobalAddons = allAddons.length > 0

  return (
    <>
      <style>{`
        @keyframes pixelShift {
          0%, 99.9% { transform: translate(0, 0); }
          100% { transform: translate(2px, 1px); }
        }
        .coffee-burn-protect {
          animation: pixelShift 300s linear infinite;
        }

        /* Portrait: unlock scrolling (TV/landscape untouched) */
        @media (orientation: portrait) {
          .layout-coffeeshop-root {
            height: auto !important;
            min-height: 100vh !important;
            overflow: visible !important;
          }
          .layout-coffeeshop-root .coffeeshop-content {
            overflow: visible !important;
          }
        }
      `}</style>
      <div
        className="coffee-burn-protect layout-coffeeshop-root"
        style={{
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 30% 20%, #1A1A1A, #0D0D0D)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(1.5rem, 3vw, 3.5rem) clamp(2rem, 4vw, 5rem)',
          position: 'relative',
          fontFamily: "'Inter', 'Arial', sans-serif",
        }}
      >
        <GoldLine width="50%" />
        <div style={{ height: 'clamp(1rem, 1.5vw, 2rem)' }} />
        <h1
          style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontWeight: 700,
            fontSize: 'clamp(2.4rem, 4.5vw, 4.5rem)',
            color: '#C9A84C',
            letterSpacing: '4px',
            textAlign: 'center',
            lineHeight: 1.15,
            textTransform: 'uppercase',
            maxWidth: '90%',
          }}
        >
          {title}
        </h1>
        <div style={{ height: 'clamp(0.5rem, 0.75vw, 1rem)' }} />
        <p
          style={{
            fontFamily: "'Inter', 'Arial', sans-serif",
            fontWeight: 400,
            fontSize: 'clamp(0.85rem, 1.2vw, 1.4rem)',
            color: '#F5E6D3',
            letterSpacing: '8px',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          MENU
        </p>
        <div style={{ height: 'clamp(1rem, 1.5vw, 2rem)' }} />
        <GoldLine width="50%" />
        <div style={{ height: 'clamp(1.5rem, 2.5vw, 3rem)' }} />
        <div
          className="coffeeshop-content"
          style={{
            flex: 1,
            width: '100%',
            maxWidth: 'clamp(480px, 50vw, 720px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(1.25rem, 2vw, 2.5rem)',
          }}
        >
          {categoriesWithAddons.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(232, 221, 208, 0.35)',
                fontSize: '1.25rem',
              }}
            >
              No items yet
            </div>
          ) : (
            categoriesWithAddons.map((cat, ci) => (
              <div key={ci}>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', 'Georgia', serif",
                    fontWeight: 700,
                    fontSize: 'clamp(1.4rem, 2vw, 2.2rem)',
                    color: '#F5E6D3',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    marginBottom: 'clamp(0.6rem, 0.8vw, 1rem)',
                  }}
                >
                  {cat.name}
                </h2>
                <div
                  style={{
                    width: '40%',
                    margin: '0 auto clamp(0.75rem, 1vw, 1.25rem)',
                    height: 1,
                    background: 'rgba(201, 168, 76, 0.5)',
                  }}
                />
                {(cat.items || []).map((item, j) => (
                  <div
                    key={j}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      padding: 'clamp(0.2rem, 0.3vw, 0.4rem) 0',
                      gap: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', 'Arial', sans-serif",
                        fontWeight: 400,
                        fontSize: 'clamp(1rem, 1.4vw, 1.6rem)',
                        color: '#E8DDD0',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Inter', 'Arial', sans-serif",
                        fontWeight: 600,
                        fontSize: 'clamp(1rem, 1.4vw, 1.6rem)',
                        color: '#C9A84C',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {currency}
                      {item.price}
                    </span>
                  </div>
                ))}
                {cat.addons && cat.addons.length > 0 && (
                  <div
                    style={{
                      marginTop: 'clamp(0.3rem, 0.4vw, 0.5rem)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'clamp(0.15rem, 0.2vw, 0.3rem)',
                    }}
                  >
                    {cat.addons.map((addon, aj) => (
                      <div
                        key={aj}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          gap: '0.5rem',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Inter', 'Arial', sans-serif",
                            fontWeight: 400,
                            fontSize: 'clamp(0.85rem, 1.1vw, 1.25rem)',
                            color: '#E8DDD0',
                            fontStyle: 'italic',
                            lineHeight: 1.3,
                          }}
                        >
                          + {addon.name}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Inter', 'Arial', sans-serif",
                            fontWeight: 600,
                            fontSize: 'clamp(0.85rem, 1.1vw, 1.25rem)',
                            color: '#C9A84C',
                            whiteSpace: 'nowrap',
                            fontStyle: 'italic',
                          }}
                        >
                          {currency}
                          {addon.price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          {hasGlobalAddons && categoriesWithAddons.length > 0 && (
            <div
              style={{
                borderTop: '1px solid rgba(201, 168, 76, 0.3)',
                paddingTop: 'clamp(0.75rem, 1vw, 1.25rem)',
              }}
            >
              {allAddons.map((addon, aj) => (
                <div
                  key={aj}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', 'Arial', sans-serif",
                      fontWeight: 400,
                      fontSize: 'clamp(0.85rem, 1.1vw, 1.25rem)',
                      color: '#E8DDD0',
                      fontStyle: 'italic',
                    }}
                  >
                    + {addon.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', 'Arial', sans-serif",
                      fontWeight: 600,
                      fontSize: 'clamp(0.85rem, 1.1vw, 1.25rem)',
                      color: '#C9A84C',
                      whiteSpace: 'nowrap',
                      fontStyle: 'italic',
                    }}
                  >
                    {currency}
                    {addon.price}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ height: 'clamp(1.5rem, 2.5vw, 3rem)' }} />
        <GoldLine width="50%" />
        <div style={{ height: 'clamp(0.75rem, 1vw, 1.25rem)' }} />
        <p
          style={{
            fontFamily: "'Inter', 'Arial', sans-serif",
            fontWeight: 400,
            fontStyle: 'italic',
            fontSize: 'clamp(0.85rem, 1.2vw, 1.4rem)',
            color: '#F5E6D3',
            textAlign: 'center',
            letterSpacing: '1px',
            lineHeight: 1.5,
          }}
        >
          {businessHours}
        </p>
      </div>
    </>
  )
}
