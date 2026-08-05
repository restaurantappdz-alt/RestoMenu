import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import LayoutPreviewPage from '../src/pages/LayoutPreviewPage'

vi.mock('@layouts', () => ({
  getLayout: (key) => ({ categories, allAddons }) => (
    <div data-testid="layout">
      <span data-testid="layout-key">{key}</span>
      {categories.map((c) => (
        <span key={c.name}>{c.name}</span>
      ))}
      {allAddons.map((a) => (
        <span key={a.name}>{a.name}</span>
      ))}
    </div>
  ),
}))

describe('LayoutPreviewPage', () => {
  it('renders the requested layout with all sample categories and addons', () => {
    render(<LayoutPreviewPage layout="moroccan" />)
    expect(screen.getByTestId('layout-key').textContent).toBe('moroccan')
    expect(screen.getByText('Plats Traditionnels')).toBeTruthy()
    expect(screen.getByText('Entrées')).toBeTruthy()
    expect(screen.getByText('Grillades')).toBeTruthy()
    expect(screen.getByText('Sandwichs & Pizzas')).toBeTruthy()
    expect(screen.getByText('Desserts & Boissons')).toBeTruthy()
    expect(screen.getByText('Frites')).toBeTruthy()
  })

  it('defaults to the classic layout', () => {
    render(<LayoutPreviewPage />)
    expect(screen.getByTestId('layout-key').textContent).toBe('classic')
  })

  it('overrides categories and addons via the base64 data param', () => {
    const data = btoa(JSON.stringify({ categories: [{ name: 'Custom', items: [] }], addons: [{ name: 'Sauce', price: '50' }] }))
    const params = new URLSearchParams({ layout: 'classic', data })
    render(<LayoutPreviewPage layout="classic" params={params} />)
    expect(screen.getByText('Custom')).toBeTruthy()
    expect(screen.getByText('Sauce')).toBeTruthy()
    expect(screen.queryByText('Entrées')).toBeNull()
  })
})
