import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import LayoutClassic from '../../shared/layouts/LayoutClassic'
import LayoutBistro from '../../shared/layouts/LayoutBistro'
import LayoutBrasserie from '../../shared/layouts/LayoutBrasserie'
import LayoutCoffeeShop from '../../shared/layouts/LayoutCoffeeShop'
import LayoutMinimal from '../../shared/layouts/LayoutMinimal'
import LayoutModern from '../../shared/layouts/LayoutModern'
import LayoutMoroccan from '../../shared/layouts/LayoutMoroccan'
import LayoutNatureBistro from '../../shared/layouts/LayoutNatureBistro'
import LayoutPro from '../../shared/layouts/LayoutPro'
import LayoutPhotoMenu from '../../shared/layouts/LayoutPhotoMenu'

// One item + one addon so price/currency lines actually render.
const categories = [
  { name: 'Test Catégorie', items: [{ name: 'Test Plat', price: '500' }], addons: [{ name: 'Frites', price: '150' }] },
]
const allAddons = [{ name: 'Frites', price: '150' }]
const noCurrencyMenu = {} // missing menu.currency → fallback path

const ALL = [
  ['classic', LayoutClassic],
  ['bistro', LayoutBistro],
  ['brasserie', LayoutBrasserie],
  ['coffeeShop', LayoutCoffeeShop],
  ['minimal', LayoutMinimal],
  ['modern', LayoutModern],
  ['moroccan', LayoutMoroccan],
  ['natureBistro', LayoutNatureBistro],
  ['pro', LayoutPro],
  ['photoMenu', LayoutPhotoMenu],
]

// Layouts known to render a currency suffix/prefix next to prices.
const CURRENCY_RENDERING = new Set([
  'classic', 'brasserie', 'coffeeShop', 'modern',
  'moroccan', 'natureBistro', 'pro', 'photoMenu',
])

describe.each(ALL)('currency %s', (key, Layout) => {
  it('never renders $ or MAD', () => {
    const { container } = render(
      <Layout categories={categories} allAddons={allAddons} offline={false} menu={noCurrencyMenu} title="Test" />
    )
    const text = container.textContent
    expect(text).not.toContain('$')
    expect(text).not.toContain('MAD')
  })

  if (CURRENCY_RENDERING.has(key)) {
    it('renders DA (or D.A) when menu.currency is missing', () => {
      const { container } = render(
        <Layout categories={categories} allAddons={allAddons} offline={false} menu={noCurrencyMenu} title="Test" />
      )
      expect(container.textContent).toMatch(/D\.?A/)
    })
  }
})
