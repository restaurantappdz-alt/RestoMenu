import React from 'react'

const styles = {
  wrapper: {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    background: 'linear-gradient(160deg, #f5f5f0 0%, #ffffff 50%, #f0efea 100%)',
    position: 'relative',
    fontFamily: "'Inter', 'Roboto', system-ui, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    padding: 'clamp(2rem, 3.5vw, 4rem) clamp(3rem, 5vw, 6rem)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'clamp(1rem, 1.5vw, 2rem)',
    borderBottom: '2px solid #222',
    paddingBottom: 'clamp(0.75rem, 1vw, 1.25rem)',
  },
  title: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 800,
    fontSize: 'clamp(2.2rem, 4vw, 4.5rem)',
    color: '#222',
    lineHeight: 1.08,
    letterSpacing: '-0.03em',
  },
  titleAccent: {
    color: '#2ECC71',
  },
  tagline: {
    fontSize: 'clamp(0.7rem, 1vw, 1.1rem)',
    color: '#666',
    fontWeight: 500,
    marginTop: '0.5rem',
  },
  mascotWrap: {
    width: 'clamp(80px, 10vw, 140px)',
    height: 'clamp(80px, 10vw, 140px)',
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#fff',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  mascotImg: {
    width: '80%',
    height: '80%',
    objectFit: 'contain',
  },
  main: {
    flex: 1,
    display: 'flex',
    gap: 'clamp(1.5rem, 2.5vw, 3rem)',
    minHeight: 0,
    marginTop: '0.5rem',
  },
  menuCol: {
    flex: 2,
    minWidth: 0,
  },
  addonCol: {
    flex: 1,
    minWidth: 0,
    maxWidth: 'clamp(200px, 22vw, 320px)',
  },
  catHeader: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(1rem, 1.6vw, 1.8rem)',
    color: '#2ECC71',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 'clamp(0.6rem, 0.8vw, 1rem)',
    borderBottom: '2px solid #2ECC71',
    paddingBottom: '0.4rem',
    display: 'inline-block',
  },
  itemRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.6rem 0',
    borderBottom: '1px solid #e0ddd5',
  },
  itemName: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: 'clamp(0.85rem, 1.2vw, 1.35rem)',
    color: '#333',
    lineHeight: 1.3,
  },
  itemPrice: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(0.9rem, 1.3vw, 1.5rem)',
    color: '#222',
    whiteSpace: 'nowrap',
  },
  addonSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: 'clamp(2rem, 3vw, 3.5rem)',
  },
  addonTitle: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(0.85rem, 1.2vw, 1.4rem)',
    color: '#222',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    lineHeight: 1.2,
  },
  addonPrice: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 800,
    fontSize: 'clamp(1.2rem, 1.8vw, 2rem)',
    color: '#2ECC71',
  },
  empty: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
    fontSize: '1.25rem',
    fontWeight: 500,
  },
  offlineBanner: {
    position: 'fixed',
    top: '1.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 50,
    background: '#2ECC71',
    color: '#fff',
    padding: '0.5rem 1.5rem',
    borderRadius: '999px',
    fontSize: '0.875rem',
    fontWeight: 700,
    boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)',
  },
}

function ItemImage({ url }) {
  if (!url) return null
  return (
    <img
      src={url}
      alt=""
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        objectFit: 'cover',
        marginRight: 10,
        flexShrink: 0,
      }}
    />
  )
}

export default function LayoutMinimal({ categories, allAddons, offline, menu, title }) {
  return (
    <div style={styles.wrapper}>
      {offline && <div style={styles.offlineBanner}>Offline — showing cached menu</div>}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            {title || 'Notre Menu'}
          </h1>
          <p style={styles.tagline}>{menu?.tagline || 'Fraîchement préparé chaque jour'}</p>
        </div>
        <div style={styles.mascotWrap}>
          <img src="/mascot.svg" alt="" style={styles.mascotImg} />
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.menuCol}>
          {categories.length === 0 ? (
            <div style={styles.empty}>No items yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.5rem, 2vw, 2.5rem)' }}>
              {categories.map((cat, ci) => (
                <div key={ci}>
                  <div style={styles.catHeader}>{cat.name}</div>
                  <div>
                    {(cat.items || []).map((item, j) => (
                      <div key={j} style={styles.itemRow}>
                        <span style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                          <ItemImage url={item.imageUrl} />
                          <span style={styles.itemName}>{item.name}</span>
                        </span>
                        <span style={styles.itemPrice}>
                          {item.price} <span style={{ fontWeight: 500, fontSize: '0.7em', color: '#888' }}>MAD</span>
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
          <div style={styles.addonCol}>
            <div style={styles.addonSection}>
              <div style={{ width: 40, height: 2, background: '#2ECC71', marginBottom: '1.5rem', opacity: 0.6 }} />
              <h3 style={styles.addonTitle}>
                Barquette<br /><span style={{ color: '#2ECC71' }}>de Frites</span>
              </h3>
              <div style={{ margin: '1.25rem 0', width: '3rem', borderTop: '1px solid #ddd' }} />
              <img src="/fries.svg" alt="" style={{ width: 'clamp(80px, 10vw, 120px)', opacity: 0.4, marginBottom: '1rem' }} />
              {allAddons.map((addon, j) => (
                <p key={j} style={styles.addonPrice}>
                  {addon.price} <span style={{ fontWeight: 500, fontSize: '0.65em', color: '#888' }}>MAD</span>
                </p>
              ))}
              <div style={{ marginTop: '1.5rem', padding: '0.5rem 1.25rem', border: '1px solid #ddd', borderRadius: '999px' }}>
                <span style={{ fontSize: 'clamp(0.65rem, 0.8vw, 0.9rem)', color: '#888', fontWeight: 600 }}>+ Add to your order</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
