import { getLayout } from '../layouts'

export default function LayoutShotsPage() {
  const params = new URLSearchParams(window.location.search)
  const layoutKey = params.get('layout') || 'classic'
  const LayoutComponent = getLayout(layoutKey)

  return (
    <div style={{ width: '100vw', height: '56.25vw', maxHeight: '100vh', overflow: 'hidden', background: '#000' }}>
      <LayoutComponent
        categories={[]}
        allAddons={[]}
        offline={false}
        menu={{ name: 'Menu Name' }}
        title="Menu Name"
      />
    </div>
  )
}
