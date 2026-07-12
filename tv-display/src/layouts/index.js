import LayoutClassic from './LayoutClassic'
import LayoutBistro from './LayoutBistro'
import LayoutMoroccan from './LayoutMoroccan'
import LayoutPro from './LayoutPro'
import LayoutNatureBistro from './LayoutNatureBistro'

export const layouts = {
  classic:      { name: 'Classic Gold', component: LayoutClassic },
  bistro:       { name: 'Bistro Chalkboard', component: LayoutBistro },
  moroccan:     { name: 'Moroccan', component: LayoutMoroccan },
  pro:          { name: 'Pro Premium', component: LayoutPro },
  natureBistro: { name: 'Nature Bistro', component: LayoutNatureBistro },
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
