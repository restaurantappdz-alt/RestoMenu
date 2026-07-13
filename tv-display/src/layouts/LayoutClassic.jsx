import React from 'react'

const base = import.meta.env.BASE_URL || '/'

/* ── Cutlery wallpaper ── */
function RestaurantPattern() {
  const items = [
    { src: base + 'svgs/cutlery.png', tier: 'large', pos: 'a1' },
    { src: base + 'svgs/fork.png', tier: 'large', pos: 'a2' },
    { src: base + 'svgs/spoon.png', tier: 'large', pos: 'a3' },
    { src: base + 'svgs/tray.png', tier: 'large', pos: 'a4' },
    { src: base + 'svgs/spoon-and-fork.png', tier: 'large', pos: 'a5' },
    { src: base + 'svgs/coffee-cup.png', tier: 'large', pos: 'a6' },
    { src: base + 'svgs/fork.png', tier: 'med', pos: 'b1' },
    { src: base + 'svgs/spoon.png', tier: 'med', pos: 'b2' },
    { src: base + 'svgs/cutlery.png', tier: 'med', pos: 'b3' },
    { src: base + 'svgs/tea.png', tier: 'med', pos: 'b4' },
    { src: base + 'svgs/coffee.png', tier: 'med', pos: 'b5' },
    { src: base + 'svgs/sugar.png', tier: 'med', pos: 'b6' },
    { src: base + 'svgs/coffee-2.png', tier: 'med', pos: 'b7' },
    { src: base + 'svgs/tray.png', tier: 'med', pos: 'b8' },
    { src: base + 'svgs/fork.png', tier: 'small', pos: 'c1' },
    { src: base + 'svgs/spoon.png', tier: 'small', pos: 'c2' },
    { src: base + 'svgs/cutlery.png', tier: 'small', pos: 'c3' },
    { src: base + 'svgs/coffee-2.png', tier: 'small', pos: 'c4' },
    { src: base + 'svgs/tea.png', tier: 'small', pos: 'c5' },
    { src: base + 'svgs/sugar.png', tier: 'small', pos: 'c6' },
    { src: base + 'svgs/spoon-and-fork.png', tier: 'small', pos: 'c7' },
    { src: base + 'svgs/coffee-cup.png', tier: 'small', pos: 'c8' },
  ]
  return (
    <div className="restaurant-pattern">
      {items.map((item, i) => (
        <img key={i} src={item.src} alt="" className={`pattern-icon icon-${item.tier} icon-${item.pos}`} />
      ))}
    </div>
  )
}

function SketchyConnector() {
  return (
    <span className="item-connector" aria-hidden="true">
      <svg viewBox="0 0 300 14" preserveAspectRatio="none" fill="none" strokeLinecap="round">
        <path d="M0,7 C16,2 32,12 48,7 C64,2 80,12 96,7 C112,2 128,12 144,7 C160,2 176,12 192,7 C208,2 224,12 240,7 C256,2 272,12 288,7 C300,7 300,7 300,7" stroke="rgba(255,183,3,0.18)" strokeWidth="1.4" />
        <path d="M0,9 C18,4 36,14 54,9 C72,4 90,14 108,9 C126,4 144,14 162,9 C180,4 198,14 216,9 C234,4 252,14 270,9 C288,4 300,9 300,9" stroke="rgba(255,81,0,0.10)" strokeWidth="0.9" />
        <path d="M2,7 C20,1 38,11 56,7 C74,1 92,11 110,7 C128,1 146,11 164,7 C182,1 200,11 218,7 C236,1 254,11 290,7" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
      </svg>
    </span>
  )
}

function BrushStroke() {
  return (
    <svg className="brush-stroke" viewBox="0 0 200 14" preserveAspectRatio="none">
      <defs>
        <linearGradient id="brushGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF7A00" />
          <stop offset="60%" stopColor="#FF5100" />
          <stop offset="100%" stopColor="#FF7A00" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M 0,8 C 15,2 30,14 50,8 C 70,2 85,14 105,8 C 125,2 140,14 160,8 C 178,2 192,12 200,8" stroke="url(#brushGrad)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <path d="M 2,10 C 18,5 34,13 54,10 C 74,5 90,13 110,10 C 130,5 146,13 166,10 C 182,5 196,11 200,10" stroke="#FF7A00" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.35" className="animate-shimmer-2" />
    </svg>
  )
}

function FullScreenWavyFrame() {
  return (
    <svg className="full-frame-wave" viewBox="0 0 1920 1080" preserveAspectRatio="none">
      <g transform="translate(960, 540) scale(0.945) translate(-960, -540)">
        <path d="M 20,16 C 80,8 140,24 200,16 C 260,8 320,24 380,16 C 440,8 500,24 560,16 C 620,8 680,24 740,16 C 800,8 860,24 920,16 C 980,8 1040,24 1100,16 C 1160,8 1220,24 1280,16 C 1340,8 1400,24 1460,16 C 1520,8 1580,24 1640,16 C 1700,8 1760,24 1820,16 C 1880,8 1908,20 1908,16" stroke="#FF7A00" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-frame animate-shimmer" />
        <path d="M 20,22 C 82,14 144,30 206,22 C 268,14 330,30 392,22 C 454,14 516,30 578,22 C 640,14 702,30 764,22 C 826,14 888,30 950,22 C 1012,14 1074,30 1136,22 C 1198,14 1260,30 1322,22 C 1384,14 1446,30 1508,22 C 1570,14 1632,30 1694,22 C 1756,14 1818,30 1908,22" stroke="#FFB703" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" className="animate-draw-frame animate-shimmer-2" style={{ animationDelay: '0.3s' }} />
        <path d="M 20,1064 C 80,1072 140,1056 200,1064 C 260,1072 320,1056 380,1064 C 440,1072 500,1056 560,1064 C 620,1072 680,1056 740,1064 C 800,1072 860,1056 920,1064 C 980,1072 1040,1056 1100,1064 C 1160,1072 1220,1056 1280,1064 C 1340,1072 1400,1056 1460,1064 C 1520,1072 1580,1056 1640,1064 C 1700,1072 1760,1056 1820,1064 C 1880,1072 1908,1060 1908,1064" stroke="#FF7A00" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-frame animate-shimmer" style={{ animationDelay: '0.5s' }} />
        <path d="M 20,1058 C 82,1066 144,1050 206,1058 C 268,1066 330,1050 392,1058 C 454,1066 516,1050 578,1058 C 640,1066 702,1050 764,1058 C 826,1066 888,1050 950,1058 C 1012,1066 1074,1050 1136,1058 C 1198,1066 1260,1050 1322,1058 C 1384,1066 1446,1050 1508,1058 C 1570,1066 1632,1050 1694,1058 C 1756,1066 1818,1050 1908,1058" stroke="#FFB703" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" className="animate-draw-frame animate-shimmer-2" style={{ animationDelay: '0.8s' }} />
        <path d="M 14,30 C 6,90 22,150 14,210 C 6,270 22,330 14,390 C 6,450 22,510 14,570 C 6,630 22,690 14,750 C 6,810 22,870 14,930 C 6,990 22,1050 14,1060" stroke="#FF7A00" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" className="animate-draw-frame animate-shimmer" style={{ animationDelay: '0.2s' }} />
        <path d="M 1906,30 C 1914,90 1898,150 1906,210 C 1914,270 1898,330 1906,390 C 1914,450 1898,510 1906,570 C 1914,630 1898,690 1906,750 C 1914,810 1898,870 1906,930 C 1914,990 1898,1050 1906,1060" stroke="#FF7A00" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" className="animate-draw-frame animate-shimmer" style={{ animationDelay: '0.6s' }} />
        <circle cx="14" cy="16" r="5" fill="#FF7A00" opacity="0.45" className="animate-shimmer" />
        <circle cx="1906" cy="16" r="5" fill="#FF7A00" opacity="0.45" className="animate-shimmer-2" />
        <circle cx="14" cy="1064" r="5" fill="#FF7A00" opacity="0.45" className="animate-shimmer" />
        <circle cx="1906" cy="1064" r="5" fill="#FF7A00" opacity="0.45" className="animate-shimmer-2" />
      </g>
    </svg>
  )
}

export default function LayoutClassic({ categories, allAddons, offline, menu, title }) {
  return (
    <div className="h-full w-full relative overflow-hidden">
      <img src={base + 'waves.svg'} alt="" className="bg-layer z-0" />
      <div className="mesh-deep z-[1]" />
      <div className="mesh-overlay z-[2]" />
      <RestaurantPattern />
      <div className="pattern-vignette" />
      <FullScreenWavyFrame />

      <div className="content-canvas">
        {offline && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-brand-orange/90 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg backdrop-blur-md animate-pop-in">
            Offline — showing cached menu
          </div>
        )}

        <div className="header-row">
          <div className="animate-pop-in">
            <h1 className="font-display text-white leading-[1.05] tracking-tight text-display-xl">
              {title || 'Notre Menu'}
            </h1>
            <p className="text-white/60 mt-3 font-heading font-semibold tracking-wide text-subtitle">
              {menu?.tagline || 'Sans frites mais charg&eacute; de viandes'}
            </p>
          </div>
          <div className="animate-fade-in-right flex-shrink-0" style={{ width: 'clamp(150px, 18vw, 240px)', height: 'clamp(150px, 18vw, 240px)' }}>
            <div className="mascot-wrapper w-full h-full animate-float">
              <img src={base + 'mascot.svg'} alt="" className="w-full h-full object-contain drop-shadow-2xl" style={{ filter: 'drop-shadow(0 8px 40px rgba(255,81,0,0.1))' }} />
            </div>
          </div>
        </div>

        <div className="content-inner">
          <div className="flex-1 flex gap-6 xl:gap-8 min-h-0 mt-2 xl:mt-4">
            <div className="flex-[2] min-w-0">
              {categories.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-white/50 text-2xl font-medium">No items yet</p>
                </div>
              ) : (
                <div className="space-y-8 xl:space-y-9">
                  {categories.map((cat, ci) => {
                    const items = cat.items || []
                    return (
                      <div key={ci}>
                        <div className="relative inline-block mb-5 xl:mb-6 animate-fade-in-up">
                          <h2 className="font-heading font-black text-white uppercase tracking-[0.08em] text-category">{cat.name}</h2>
                          <BrushStroke />
                        </div>
                        <div>
                          {items.map((item, j) => (
                            <div key={j} className="menu-item animate-cascade-item" style={{ animationDelay: `${j * 0.1}s` }}>
                              <span className="item-name font-heading font-bold text-white leading-tight text-item">{item.name}</span>
                              <SketchyConnector />
                              <div className="item-price">
                                <span className="font-heading font-black text-brand-honey leading-tight tabular-nums text-price">{item.price}</span>
                                <span className="font-heading font-bold ml-2 text-price-currency" style={{ color: 'rgba(255, 183, 3, 0.6)' }}>D.A</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {allAddons.length > 0 && (
              <div className="flex-[1] flex flex-col min-w-0 animate-fade-in-up-d2" style={{ maxWidth: 'clamp(240px, 30vw, 380px)' }}>
                <div className="flex flex-col items-center text-center mt-2">
                  <div className="w-14 h-0.5 rounded-full bg-brand-honey mb-7 opacity-80 animate-shimmer" />
                  <h3 className="font-heading font-bold text-white uppercase tracking-[0.06em] leading-tight text-addon-header">
                    Barquette<br /><span className="text-brand-honey">de Frites</span>
                  </h3>
                  <div className="my-6 w-20 border-t border-white/10" />
                  <img src={base + 'fries.svg'} alt="" className="w-28 h-28 xl:w-32 xl:h-32 object-contain drop-shadow-lg mb-6 animate-float" style={{ animationDuration: '5s' }} />
                  {allAddons.map((addon, j) => (
                    <p key={j} className="font-heading font-black text-brand-honey text-addon-price animate-cascade-item" style={{ animationDelay: `${(j + 0.5) * 0.1}s` }}>
                      {addon.price}
                      <span className="font-heading font-bold ml-2 text-addon-currency" style={{ color: 'rgba(255, 183, 3, 0.55)' }}>D.A</span>
                    </p>
                  ))}
                  <div className="mt-7 px-6 py-2 bg-white/8 rounded-full border border-white/10">
                    <span className="font-heading font-semibold text-white/60 text-addon-prompt">+ Add to your order</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
