import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LayoutDigitalBoard, { capabilities } from '../../shared/layouts/LayoutDigitalBoard'

describe('LayoutDigitalBoard', () => {
  it('exports valid capabilities object', () => {
    expect(capabilities.id).toBe('digitalBoard')
    expect(capabilities.name).toBe('Digital Board Grid')
    expect(capabilities.maxItems).toBe(8)
    expect(capabilities.supportsItemImages).toBe(true)
    expect(capabilities.supportsDescriptions).toBe(true)
    expect(capabilities.supportsTags).toBe(true)
    expect(capabilities.supportsHeroPhoto).toBe(false)
    expect(capabilities.supportsCategoryHeaders).toBe(false)
    expect(capabilities.displayMode).toBe('full-menu')
    expect(capabilities.hasHeader).toBe(false)
    expect(capabilities.hasFooter).toBe(false)
  })

  it('renders configured slots from menu.boardConfig.slots', () => {
    const menu = {
      currency: 'DA',
      boardConfig: {
        slots: [
          { title: 'شاورما دجاج', subtitle: 'Shawarma Poulet', price: '450', imageUrl: 'https://example.com/shawarma.jpg' },
          { title: 'برغر لحم', subtitle: 'Burger Boeuf', price: '620' },
          { title: 'طاكوس مشكل', subtitle: 'Tacos Mixte', price: '700' },
          { title: 'بيتزا مارغريتا', subtitle: 'Pizza Margherita', price: '800' },
          {
            title: 'بيتزا فورماج',
            subtitle: 'Pizza 4 Fromages',
            priceType: 'multiple',
            priceRows: [
              { label: 'Petite', price: '600' },
              { label: 'Moyenne', price: '900' },
              { label: 'Familiale', price: '1200' },
            ],
          },
          { title: 'سلطة سيزر', subtitle: 'Salade César', price: '500' },
          { title: 'أجنحة دجاج', subtitle: 'Ailes de poulet', price: '650' },
          { title: 'بطاطا مقلية', subtitle: 'Frites Maison', price: '200' },
        ],
      },
    }

    const { container } = render(<LayoutDigitalBoard menu={menu} />)
    expect(screen.getByText('شاورما دجاج')).toBeTruthy()
    expect(screen.getByText('Shawarma Poulet')).toBeTruthy()
    expect(screen.getByText('450 DA')).toBeTruthy()

    // Multiple price rows
    expect(screen.getByText('Petite')).toBeTruthy()
    expect(screen.getByText('600 DA')).toBeTruthy()
    expect(screen.getByText('Moyenne')).toBeTruthy()
    expect(screen.getByText('900 DA')).toBeTruthy()
    expect(screen.getByText('Familiale')).toBeTruthy()
    expect(screen.getByText('1200 DA')).toBeTruthy()

    // Single price in bottom row
    expect(screen.getByText('سلطة سيزر')).toBeTruthy()
    expect(screen.getByText('Salade César')).toBeTruthy()
    expect(screen.getByText('500 DA')).toBeTruthy()
  })

  it('falls back dynamically to categories items when boardConfig.slots has fewer than 8 slots', () => {
    const categories = [
      {
        name: 'Plats',
        items: [
          { name: 'Couscous Poulet', price: '800', description: 'Plat traditionnel', imageUrl: 'https://example.com/couscous.jpg' },
          { name: 'Tajine Agneau', price: '1200', description: 'Mijoté aux pruneaux' },
          { name: 'Rechta', price: '750', description: 'Pâtes traditionnelles' },
          { name: 'Chorba Frik', price: '350', description: 'Soupe au blé vert' },
        ],
      },
    ]

    const menu = {
      currency: 'D.A',
      boardConfig: {
        slots: [
          { title: 'شاورما', subtitle: 'Shawarma', price: '500' },
        ],
      },
    }

    render(<LayoutDigitalBoard categories={categories} menu={menu} />)

    // First slot from boardConfig
    expect(screen.getByText('شاورما')).toBeTruthy()
    expect(screen.getByText('500 D.A')).toBeTruthy()

    // Remaining slots populated from category items
    expect(screen.getByText('Couscous Poulet')).toBeTruthy()
    expect(screen.getByText('Plat traditionnel')).toBeTruthy()
    expect(screen.getByText('800 D.A')).toBeTruthy()
    expect(screen.getByText('Tajine Agneau')).toBeTruthy()
    expect(screen.getByText('1200 D.A')).toBeTruthy()
    expect(screen.getByText('Rechta')).toBeTruthy()
    expect(screen.getByText('750 D.A')).toBeTruthy()
    expect(screen.getByText('Chorba Frik')).toBeTruthy()
    expect(screen.getByText('350 D.A')).toBeTruthy()
  })

  it('shows offline overlay when offline is true', () => {
    render(<LayoutDigitalBoard offline={true} />)
    expect(screen.getByText(/Offline/)).toBeTruthy()
  })

  it('contains portrait media query and pixelShift animation', () => {
    const { container } = render(<LayoutDigitalBoard />)
    const styleTag = container.querySelector('style')
    expect(styleTag).toBeTruthy()
    expect(styleTag.textContent).toContain('@media (orientation: portrait)')
    expect(styleTag.textContent).toContain('pixelShift')
  })
})
