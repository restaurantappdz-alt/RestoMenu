import LayoutClassic from './LayoutClassic'
import LayoutBistro from './LayoutBistro'
import LayoutBrasserie from './LayoutBrasserie'
import LayoutCoffeeShop from './LayoutCoffeeShop'
import LayoutMinimal from './LayoutMinimal'
import LayoutModern from './LayoutModern'
import LayoutMoroccan from './LayoutMoroccan'
import LayoutNatureBistro from './LayoutNatureBistro'
import LayoutPro from './LayoutPro'
import LayoutPhotoMenu from './LayoutPhotoMenu'

export const layouts = {
  classic:      { name: 'Classic Gold', component: LayoutClassic },
  bistro:       { name: 'Bistro Chalkboard', component: LayoutBistro },
  brasserie:    { name: 'Brasserie', component: LayoutBrasserie },
  coffeeShop:   { name: 'Coffee Shop', component: LayoutCoffeeShop },
  minimal:      { name: 'Minimal', component: LayoutMinimal },
  modern:       { name: 'Modern', component: LayoutModern },
  moroccan:     { name: 'Moroccan', component: LayoutMoroccan },
  natureBistro: { name: 'Nature Bistro', component: LayoutNatureBistro },
  pro:          { name: 'Pro Premium', component: LayoutPro },
  photoMenu:    { name: 'Photo Menu', component: LayoutPhotoMenu },
}

export const layoutOptions = Object.entries(layouts).map(([value, { name }]) => ({
  value,
  label: name,
}))

export function getLayout(layoutKey) {
  const entry = layouts[layoutKey]
  if (entry) return entry.component
  return LayoutClassic
}

export {
  LAYOUT_CAPABILITIES,
  getLayoutCapabilities,
  getLayoutOptionalFields,
  getMaxItems,
  getMaxCategories,
} from './capabilities'
