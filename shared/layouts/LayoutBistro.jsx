import React from 'react'

const styles = {
  wrapper: {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, #1a2a1a 0%, #0f1f0f 50%, #0a170a 100%)',
    position: 'relative',
    fontFamily: "'Courier New', 'Courier', monospace",
    display: 'flex',
    flexDirection: 'column',
    padding: 'clamp(2rem, 3.5vw, 4rem) clamp(2.5rem, 4vw, 5rem)',
  },
  chalkBorder: {
    position: 'absolute',
    inset: 'clamp(0.6rem, 1vw, 1.2rem)',
    border: '2px dashed rgba(240, 234, 214, 0.25)',
    borderRadius: 'clamp(1rem, 1.5vw, 2rem)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  innerBorder: {
    position: 'absolute',
    inset: 'clamp(1rem, 1.8vw, 2rem)',
    border: '1px solid rgba(240, 234, 214, 0.10)',
    borderRadius: 'clamp(0.5rem, 1vw, 1rem)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  content: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'clamp(1rem, 1.8vw, 2.5rem)',
    paddingBottom: 'clamp(0.75rem, 1vw, 1.25rem)',
    borderBottom: '2px dotted rgba(240, 234, 214, 0.2)',
  },
  titleBlock: {
    maxWidth: '65%',
  },
  title: {
    fontFamily: "'Courier New', monospace",
    fontWeight: 700,
    fontSize: 'clamp(2rem, 4.5vw, 5rem)',
    color: '#F0EAD6',
    lineHeight: 1.1,
    letterSpacing: '0.05em',
    textShadow: '0 0 4px rgba(240, 234, 214, 0.15)',
  },
  titleAccent: {
    color: '#E8C87A',
  },
  tagline: {
    fontSize: 'clamp(0.65rem, 1vw, 1.1rem)',
    color: 'rgba(240, 234, 214, 0.5)',
    fontWeight: 400,
    marginTop: '0.5rem',
    letterSpacing: '0.02em',
  },
  mascotWrap: {
    width: 'clamp(80px, 10vw, 140px)',
    height: 'clamp(80px, 10vw, 140px)',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid rgba(240, 234, 214, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    opacity: 0.6,
  },
  mascotImg: {
    width: '80%',
    height: '80%',
    objectFit: 'contain',
    filter: 'brightness(0.8) sepia(0.3)',
  },
  main: {
    flex: 1,
    display: 'flex',
    gap: 'clamp(1rem, 2vw, 2.5rem)',
    minHeight: 0,
  },
  menuCol: {
    flex: 3,
    minWidth: 0,
    paddingRight: 'clamp(1rem, 2vw, 2.5rem)',
    borderRight: '1px dotted rgba(240, 234, 214, 0.15)',
  },
  addonCol: {
    flex: 1,
    minWidth: 0,
    maxWidth: 'clamp(180px, 22vw, 300px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingTop: 'clamp(0.5rem, 1vw, 1.5rem)',
    paddingLeft: 'clamp(0.5rem, 1vw, 1.5rem)',
  },
  catHeader: {
    fontFamily: "'Courier New', monospace",
    fontWeight: 700,
    fontSize: 'clamp(1rem, 1.8vw, 2.2rem)',
    color: '#E8C87A',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: 'clamp(0.75rem, 1vw, 1.5rem)',
    position: 'relative',
    display: 'inline-block',
  },
  catUnderline: {
    content: '""',
    display: 'block',
    width: '100%',
    height: '2px',
    background: 'rgba(232, 200, 122, 0.25)',
    marginTop: '0.25rem',
    borderRadius: '1px',
  },
  categoryBlock: {
    marginBottom: 'clamp(1.5rem, 2.5vw, 3rem)',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
    padding: '0.5rem 0',
    borderBottom: '1px dotted rgba(240, 234, 214, 0.06)',
  },
  itemNameBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: 0,
    flex: 1,
  },
  itemImage: {
    width: 40,
    height: 40,
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid rgba(240, 234, 214, 0.1)',
    flexShrink: 0,
  },
  itemName: {
    fontFamily: "'Courier New', monospace",
    fontWeight: 600,
    fontSize: 'clamp(0.8rem, 1.2vw, 1.4rem)',
    color: '#F0EAD6',
    lineHeight: 1.3,
    letterSpacing: '0.01em',
  },
  itemConnector: {
    flex: 1,
    height: 0,
    borderTop: '1px dotted rgba(240, 234, 214, 0.15)',
    minWidth: '1rem',
    margin: '0 0.25rem',
    alignSelf: 'center',
  },
  itemPrice: {
    fontFamily: "'Courier New', monospace",
    fontWeight: 700,
    fontSize: 'clamp(0.85rem, 1.3vw, 1.5rem)',
    color: '#F0EAD6',
    whiteSpace: 'nowrap',
  },
  priceCurrency: {
    fontSize: '0.6em',
    color: 'rgba(240, 234, 214, 0.45)',
    fontWeight: 400,
    marginLeft: '0.35rem',
  },
  addonSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  addonTitle: {
    fontFamily: "'Courier New', monospace",
    fontWeight: 700,
    fontSize: 'clamp(0.75rem, 1.1vw, 1.3rem)',
    color: '#E8C87A',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    lineHeight: 1.3,
  },
  addonPrice: {
    fontFamily: "'Courier New', monospace",
    fontWeight: 700,
    fontSize: 'clamp(1rem, 1.5vw, 1.8rem)',
    color: '#F0EAD6',
  },
  addonCurrency: {
    fontSize: '0.6em',
    color: 'rgba(240, 234, 214, 0.4)',
    fontWeight: 400,
    marginLeft: '0.35rem',
  },
  addonBadge: {
    marginTop: '1rem',
    padding: '0.4rem 0.75rem',
    border: '1px solid rgba(240, 234, 214, 0.1)',
    borderRadius: '2px',
    fontSize: 'clamp(0.55rem, 0.7vw, 0.75rem)',
    color: 'rgba(240, 234, 214, 0.4)',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '0.05em',
  },
  empty: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(240, 234, 214, 0.3)',
    fontSize: '1.25rem',
    fontFamily: "'Courier New', monospace",
    fontWeight: 500,
  },

}

function BistroItemImage({ url }) {
  if (!url) return null
  return <img src={url} alt="" style={styles.itemImage} />
}

export default function LayoutBistro({ categories, allAddons, offline, menu, title }) {
  return (
    <div className="layout-bistro-root" style={styles.wrapper}>
      <style>{`
/* Portrait phone adaptation — scoped to this layout; landscape/TV rules untouched */
@media (orientation: portrait) {
  .layout-bistro-root {
    height: auto !important;
    min-height: 100vh !important;
    overflow: visible !important;
    padding: 1.5rem 1.25rem !important;
  }
  .layout-bistro-root .bistro-header {
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
  }
  .layout-bistro-root .bistro-title-block {
    max-width: 100% !important;
  }
  .layout-bistro-root .bistro-mascot-wrap {
    margin-top: 1rem !important;
  }
  .layout-bistro-root .bistro-main {
    flex-direction: column !important;
    gap: 2rem !important;
  }
  .layout-bistro-root .bistro-menu-col {
    flex: none !important;
    width: 100% !important;
    padding-right: 0 !important;
    border-right: none !important;
  }
  .layout-bistro-root .bistro-addon-col {
    flex: none !important;
    width: 100% !important;
    max-width: 100% !important;
    padding-left: 0 !important;
    padding-top: 1.5rem !important;
    border-top: 1px dotted rgba(240, 234, 214, 0.15) !important;
  }
}
`}</style>
      <div style={styles.chalkBorder} />
      <div style={styles.innerBorder} />
      <div className="bistro-content" style={styles.content}>
        <div className="bistro-header" style={styles.header}>
          <div className="bistro-title-block" style={styles.titleBlock}>
            <h1 style={styles.title}>
              {title || 'Notre Menu'}
            </h1>
            <p style={styles.tagline}>{menu?.tagline || 'Fait maison avec amour'}</p>
          </div>
          <div className="bistro-mascot-wrap" style={styles.mascotWrap}>
            <img src={(import.meta.env.BASE_URL || '/') + 'mascot.svg'} alt="" style={styles.mascotImg} />
          </div>
        </div>

        <div className="bistro-main" style={styles.main}>
          <div className="bistro-menu-col" style={styles.menuCol}>
            {categories.length === 0 ? (
              <div style={styles.empty}>No items yet</div>
            ) : (
              <div>
                {categories.map((cat, ci) => (
                  <div key={ci} style={styles.categoryBlock}>
                    <div style={styles.catHeader}>
                      {cat.name}
                      <div style={styles.catUnderline} />
                    </div>
                    <div>
                      {(cat.items || []).map((item, j) => (
                        <div key={j} style={styles.itemRow}>
                          <div style={styles.itemNameBlock}>
                            <BistroItemImage url={item.imageUrl} />
                            <span style={styles.itemName}>{item.name}</span>
                          </div>
                          <div style={styles.itemConnector} />
                          <span style={styles.itemPrice}>
                            {item.price}<span style={styles.priceCurrency}>MAD</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {allAddons.length > 0 && (
            <div className="bistro-addon-col" style={styles.addonCol}>
              <div style={styles.addonSection}>
                <div style={{ width: '2rem', height: 1, background: 'rgba(232, 200, 122, 0.3)', marginBottom: '1rem' }} />
                <h3 style={styles.addonTitle}>
                  Barquette<br /><span style={{ color: '#F0EAD6' }}>de Frites</span>
                </h3>
                <div style={{ margin: '0.75rem 0', width: '2rem', borderTop: '1px dotted rgba(240, 234, 214, 0.15)' }} />
                <img src={(import.meta.env.BASE_URL || '/') + 'fries.svg'} alt="" style={{ width: 'clamp(70px, 9vw, 110px)', opacity: 0.25, marginBottom: '0.75rem' }} />
                {allAddons.map((addon, j) => (
                  <p key={j} style={styles.addonPrice}>
                    {addon.price}<span style={styles.addonCurrency}>MAD</span>
                  </p>
                ))}
                <div style={styles.addonBadge}>+ Ajouter à la commande</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
