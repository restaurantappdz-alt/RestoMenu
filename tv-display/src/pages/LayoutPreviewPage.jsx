import { getLayout } from '@layouts'
import { sampleMenu } from '../sampleMenu'

function parseTestData(raw) {
  try {
    const json = atob(raw)
    return JSON.parse(json)
  } catch {
    return null
  }
}

// Renders a layout with the generic sample menu — used by the
// layout-shots generator (/?layout=<id>) and as a live preview.
// Optional base64 `data` param overrides categories/addons (manual test shots).
export default function LayoutPreviewPage({ layout = 'classic', params }) {
  const search = params || new URLSearchParams(window.location.search)
  const LayoutComponent = getLayout(layout)
  const testData = parseTestData(search.get('data') || '')
  const categories = testData?.categories || sampleMenu.categories
  const allAddons = testData?.addons || sampleMenu.categories.flatMap((c) => c.addons || [])

  return (
    <div style={{ width: '100vw', height: '56.25vw', maxHeight: '100vh', overflow: 'hidden', background: '#000' }}>
      <LayoutComponent
        categories={categories}
        allAddons={allAddons}
        offline={false}
        menu={sampleMenu}
        title={sampleMenu.name}
      />
    </div>
  )
}
