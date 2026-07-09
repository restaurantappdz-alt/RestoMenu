import useMenuData from './hooks/useMenuData'
import { getLayout } from './layouts'
import './index.css'

function StateScreen({ children, className = '' }) {
  return (
    <div className={`h-full w-full flex items-center justify-center relative overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

export default function App() {
  const { menu, loading, waiting, offline, categories, allAddons, selectedLayout } = useMenuData()
  const LayoutComponent = getLayout(selectedLayout)
  const title = menu?.name || 'Notre Menu'

  if (waiting) {
    return (
      <StateScreen>
        <div className="text-center animate-pop-in z-10">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-white/5 border border-brand-orange/20 flex items-center justify-center">
            <img src="/svgs/cutlery.png" alt="" className="w-16 h-16 object-contain opacity-30" />
          </div>
          <h2 className="font-heading font-bold text-white text-4xl">Waiting for Menu</h2>
          <p className="text-white/50 text-xl mt-3">Select a menu from the admin dashboard</p>
        </div>
      </StateScreen>
    )
  }

  if (loading && !menu) {
    return (
      <StateScreen>
        <div className="flex flex-col items-center gap-5 animate-pop-in z-10">
          <div className="w-16 h-16 border-[3px] border-brand-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-xl font-medium">Loading menu...</p>
        </div>
      </StateScreen>
    )
  }

  if (!menu) {
    return (
      <StateScreen>
        <div className="text-center animate-pop-in z-10">
          <h2 className="font-heading font-bold text-white/60 text-4xl">Menu Not Found</h2>
          <p className="text-white/40 text-xl mt-3">Please select a different menu</p>
        </div>
      </StateScreen>
    )
  }

  return (
    <LayoutComponent
      categories={categories}
      allAddons={allAddons}
      offline={offline}
      menu={menu}
      title={title}
    />
  )
}
