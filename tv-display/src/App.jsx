import useMenuData from './hooks/useMenuData'
import useDeviceLock from './hooks/useDeviceLock'
import PhoneMenuPage from './pages/PhoneMenuPage'
import LayoutPreviewPage from './pages/LayoutPreviewPage'
import ErrorBoundary from './ErrorBoundary'
import { isTvClassDevice } from './tvGate'
import { Smartphone } from 'lucide-react'
import { DEMO_CATEGORIES, DEMO_ADDONS, DEMO_MENU } from './demo/demoData'
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
          <img src={`${import.meta.env.BASE_URL}svgs/cutlery.png`} alt="" className="w-16 h-16 object-contain opacity-30" />
        </div>
        <h2 className="font-heading font-bold text-white text-4xl">Not Set Up</h2>
        <p className="text-white/50 text-xl mt-3 leading-relaxed">
          This TV hasn't been linked to a restaurant yet.
        </p>
        <p className="text-white/30 text-lg mt-2">
          Add <code className="text-brand-orange bg-white/5 px-2 py-0.5 rounded">?r=YOUR_RESTAURANT_ID</code> to the URL, or copy the TV link from the RestoMenu app.
        </p>
      </div>
    </StateScreen>
  )
}

function DisplayedElsewhereScreen() {
  return (
    <StateScreen>
      <div className="text-center animate-pop-in z-10 max-w-lg px-8">
        <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-white/5 border border-brand-orange/20 flex items-center justify-center">
          <img src={`${import.meta.env.BASE_URL}svgs/cutlery.png`} alt="" className="w-16 h-16 object-contain opacity-30" />
        </div>
        <h2 className="font-heading font-bold text-white text-4xl">Displayed on Another Device</h2>
        <p className="text-white/50 text-xl mt-3 leading-relaxed">
          This menu is currently shown on another screen. It will appear here automatically when that screen disconnects.
        </p>
      </div>
    </StateScreen>
  )
}

function ScanWithPhoneScreen() {
  return (
    <StateScreen>
      <div className="text-center animate-pop-in z-10 max-w-lg px-8">
        <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-white/5 border border-brand-orange/20 flex items-center justify-center">
          <Smartphone className="w-16 h-16 text-brand-orange/40" />
        </div>
        <h2 className="font-heading font-bold text-white text-4xl">Scan with Your Phone</h2>
        <p className="text-white/50 text-xl mt-3 leading-relaxed">
          This menu is designed for phones. Open the QR code with your mobile device.
        </p>
      </div>
    </StateScreen>
  )
}

function ConnectionLostScreen() {
  return (
    <StateScreen>
      <div className="text-center animate-pop-in z-10 max-w-lg px-8">
        <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-white/5 border border-brand-orange/20 flex items-center justify-center">
          <img src={`${import.meta.env.BASE_URL}svgs/cutlery.png`} alt="" className="w-16 h-16 object-contain opacity-30" />
        </div>
        <h2 className="font-heading font-bold text-white text-4xl">Connection Lost</h2>
        <p className="text-white/50 text-xl mt-3 leading-relaxed">
          We can't reach the menu server right now.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-10 py-3 rounded-full bg-brand-orange text-white text-lg font-semibold hover:bg-brand-orange/90 transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    </StateScreen>
  )
}

export default function App() {
  const params = new URLSearchParams(window.location.search)

  // Demo mode: renders a layout with fixture data (no Firebase, no device
  // lock). Used by tools/layout-shots to regenerate the picker thumbnails.
  if (params.get('demo') === '1') {
    const demoLayout = params.get('layout') || 'classic'
    const DemoLayoutComponent = getLayout(demoLayout)
    const demoLimit = getMaxItems(demoLayout, DEMO_CATEGORIES.length)
    const demoCategories = truncateCategories(DEMO_CATEGORIES, demoLimit)
  return (
    <div className="relative h-full w-full">
      {connectionError && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-sm text-amber-300 text-center py-2 text-lg font-medium pointer-events-none">
          Connection lost — showing saved menu
        </div>
      )}
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

  // Phone menu mode: no device lock, no TV subscription guard black screen.
  // Must return before any TV hooks run (useMenuData / useDeviceLock).
  // TV-class devices (TV browsers, large landscape screens) get the
  // "Scan with your phone" gate instead — the QR menu is phone-only.
  if (params.get('phone') === '1') {
    if (isTvClassDevice()) {
      return <ScanWithPhoneScreen />
    }
    return <PhoneMenuPage />
  }
  // Layout preview mode: renders a layout with the generic sample menu
  // (used by the layout-shots generator). Returns before any Firebase hooks.
  if (params.get('layout')) {
    return <LayoutPreviewPage layout={params.get('layout')} />
  }

  const { menu, loading, waiting, offline, needsSetup, subscriptionBlocked, connectionError, restaurantId, categories, allAddons, selectedLayout } = useMenuData()
  const screenId = params.get('s')
  const deviceStatus = useDeviceLock(restaurantId, screenId, !offline)
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

  if (deviceStatus === 'blocked') {
    return <DisplayedElsewhereScreen />
  }

  // Transient connection failure with nothing to show → visible retry path,
  // NOT the misleading "Menu Not Found" (that is reserved for a real
  // connected snapshot that shows no menu).
  if (connectionError && !menu && !loading) {
    return <ConnectionLostScreen />
  }

  if (waiting) {
    return (
      <StateScreen>
        <div className="text-center animate-pop-in z-10">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-white/5 border border-brand-orange/20 flex items-center justify-center">
            <img src={`${import.meta.env.BASE_URL}svgs/cutlery.png`} alt="" className="w-16 h-16 object-contain opacity-30" />
          </div>
          <h2 className="font-heading font-bold text-white text-4xl">Waiting for Menu</h2>
          <p className="text-white/50 text-xl mt-3">Select a menu in the RestoMenu app</p>
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
      <ErrorBoundary>
        <LayoutComponent
          categories={menuCategories}
          allAddons={allAddons}
          offline={offline}
          menu={menu}
          title={title}
        />
      </ErrorBoundary>
    </div>
  )
}
