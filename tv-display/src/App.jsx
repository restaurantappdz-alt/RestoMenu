import useMenuData from './hooks/useMenuData'
import { getLayout, getMaxItems } from '@layouts'
import './index.css'

function truncateCategories(categories, maxItems) {
  if (maxItems == null || !categories.length) return categories

  const totalItems = categories.reduce((sum, c) => sum + (c.items || []).length, 0)
  if (totalItems <= maxItems) return categories

  const result = categories.map((c) => ({ ...c, items: [...(c.items || [])] }))
  let remaining = maxItems

  for (let i = 0; i < result.length; i++) {
    if (remaining <= 0) {
      result[i].items = []
      continue
    }
    const catItems = result[i].items.length
    const share = Math.max(1, Math.round(remaining / (result.length - i)))
    const take = Math.min(catItems, share)
    result[i].items = result[i].items.slice(0, take)
    remaining -= take
  }

  return result
}

function StateScreen({ children, className = '' }) {
  return (
    <div className={`h-full w-full flex items-center justify-center relative overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

function NeedsSetupScreen() {
  return (
    <StateScreen>
      <div className="text-center animate-pop-in z-10 max-w-lg px-8">
        <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-white/5 border border-brand-orange/20 flex items-center justify-center">
          <img src="/svgs/cutlery.png" alt="" className="w-16 h-16 object-contain opacity-30" />
        </div>
        <h2 className="font-heading font-bold text-white text-4xl">Not Set Up</h2>
        <p className="text-white/50 text-xl mt-3 leading-relaxed">
          This TV hasn't been linked to a restaurant yet.
        </p>
        <p className="text-white/30 text-lg mt-2">
          Add <code className="text-brand-orange bg-white/5 px-2 py-0.5 rounded">?r=YOUR_RESTAURANT_ID</code> to the URL, or copy the TV link from your admin dashboard.
        </p>
      </div>
    </StateScreen>
  )
}

export default function App() {
  const { menu, loading, waiting, offline, needsSetup, subscriptionBlocked, categories, allAddons, selectedLayout } = useMenuData()
  const LayoutComponent = getLayout(selectedLayout)

  const capItemLimit = getMaxItems(selectedLayout, categories?.length || 0)
  const menuCategories = truncateCategories(categories, capItemLimit)

  const title = menu?.name || 'Notre Menu'

  if (needsSetup) {
    return <NeedsSetupScreen />
  }

  if (subscriptionBlocked) {
    return <div className="h-full w-full bg-black" />
  }

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
    <div className="relative h-full w-full">
      <LayoutComponent
        categories={menuCategories}
        allAddons={allAddons}
        offline={offline}
        menu={menu}
        title={title}
      />
    </div>
  )
}
