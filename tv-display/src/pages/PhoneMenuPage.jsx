import { useMemo } from 'react'
import useAllMenus from '../hooks/useAllMenus'
import { getLayout } from '@layouts'
import { combineMenus } from '../menuCombiner'

function StateScreen({ children }) {
  return (
    <div className="h-full w-full flex items-center justify-center relative overflow-hidden">
      {children}
    </div>
  )
}

export default function PhoneMenuPage() {
  const { restaurantName, layout, menus, loading, expired, needsSetup, menuIds } = useAllMenus()
  const LayoutComponent = getLayout(layout)
  const combined = useMemo(() => combineMenus(menus), [menus])

  // Merge every menu's categories into a single list so the page renders
  // ONE layout containing all items — no duplicated chrome per menu.
  const allCategories = useMemo(
    () => combined.flatMap((menu) => menu.categories || []),
    [combined],
  )
  const allAddons = useMemo(
    () => allCategories.flatMap((c) => c.addons || []),
    [allCategories],
  )

  if (needsSetup) {
    return (
      <StateScreen>
        <div className="text-center max-w-lg px-8">
          <h2 className="font-heading font-bold text-white text-4xl">Not Set Up</h2>
          <p className="text-white/50 text-xl mt-3">This restaurant isn't linked yet.</p>
        </div>
      </StateScreen>
    )
  }

  // loading BEFORE expired: useAllMenus fails closed (expired=true) until the
  // config snapshot reports, so checking expired first would show the
  // "unavailable" page during every normal load.
  if (loading) {
    return (
      <StateScreen>
        <div className="flex flex-col items-center gap-5">
          <div className="w-16 h-16 border-[3px] border-brand-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-xl font-medium">Loading menu...</p>
        </div>
      </StateScreen>
    )
  }

  if (expired) {
    return (
      <StateScreen>
        <div className="text-center max-w-lg px-8">
          <h2 className="font-heading font-bold text-white text-4xl">Menu Temporarily Unavailable</h2>
          <p className="text-white/50 text-xl mt-3">Please check back soon.</p>
        </div>
      </StateScreen>
    )
  }

  if (combined.length === 0) {
    // Distinguish "owner filtered to menus that no longer exist" from
    // "restaurant has no menus at all" — different copy for each.
    const filteredEmpty = menuIds.length > 0
    return (
      <StateScreen>
        <div className="text-center max-w-lg px-8">
          <h2 className="font-heading font-bold text-white text-4xl">
            {filteredEmpty ? 'No Menu Available' : 'No Menu Yet'}
          </h2>
          <p className="text-white/50 text-xl mt-3">
            {filteredEmpty
              ? 'This menu is no longer available. Please check back soon.'
              : "This restaurant hasn't published a menu."}
          </p>
        </div>
      </StateScreen>
    )
  }

  return (
    <div className="phone-menu-page">
      <div className="phone-menu-restaurant">
        <h1>{restaurantName || 'Menu'}</h1>
      </div>
      <LayoutComponent
        categories={allCategories}
        allAddons={allAddons}
        offline={false}
        menu={{}}
        title={restaurantName || 'Menu'}
      />
    </div>
  )
}
