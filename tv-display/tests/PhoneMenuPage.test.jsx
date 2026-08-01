import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import PhoneMenuPage from '../src/pages/PhoneMenuPage'

// Default mock state; each test can call setHookState() before rendering.
let hookState
vi.mock('../src/hooks/useAllMenus', () => ({
  default: () => hookState,
}))

vi.mock('@layouts', () => ({
  getLayout: () => ({ categories }) => (
    <div data-testid="layout">
      {categories.map((c) => c.items.map((it) => <span key={it.name}>{it.name}</span>))}
    </div>
  ),
}))

describe('PhoneMenuPage', () => {
  beforeEach(() => {
    hookState = {
      restaurantId: 'rest1',
      layout: 'classic',
      restaurantName: 'Le Café',
      menus: [
        { id: 'm1', name: 'Breakfast', categories: [{ name: 'Hot', items: [{ name: 'Eggs', price: 5 }] }] },
      ],
      loading: false,
      expired: false,
      needsSetup: false,
    }
  })

  it('renders restaurant name, menu section headers, and items', () => {
    render(<PhoneMenuPage />)
    expect(screen.getByText('Le Café')).toBeTruthy()
    expect(screen.getByText('Breakfast')).toBeTruthy()
    expect(screen.getByText('Eggs')).toBeTruthy()
  })

  it('shows the spinner while loading even if expired (fail-closed default)', () => {
    // useAllMenus fails closed (expired=true) until the config snapshot
    // reports — the page must show "Loading" in that window, not the
    // unavailable page.
    hookState = { ...hookState, loading: true, expired: true }
    render(<PhoneMenuPage />)
    expect(screen.getByText('Loading menu...')).toBeTruthy()
    expect(screen.queryByText('Menu Temporarily Unavailable')).toBeNull()
  })

  it('shows the unavailable page once loading finishes on an expired subscription', () => {
    hookState = { ...hookState, loading: false, expired: true }
    render(<PhoneMenuPage />)
    expect(screen.getByText('Menu Temporarily Unavailable')).toBeTruthy()
    expect(screen.queryByText('Eggs')).toBeNull()
  })

  it('shows the not-set-up page when the restaurant is not linked', () => {
    hookState = { ...hookState, needsSetup: true }
    render(<PhoneMenuPage />)
    expect(screen.getByText('Not Set Up')).toBeTruthy()
  })

  it('shows the "No Menu Yet" page when the combined menu list is empty', () => {
    hookState = { ...hookState, menus: [] }
    render(<PhoneMenuPage />)
    expect(screen.getByText('No Menu Yet')).toBeTruthy()
    expect(screen.queryByText('Eggs')).toBeNull()
  })
})
