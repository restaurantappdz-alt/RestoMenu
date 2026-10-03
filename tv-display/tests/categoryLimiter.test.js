import { describe, expect, it } from 'vitest'
import { truncateCategories } from '../src/categoryLimiter'

describe('truncateCategories', () => {
  it('omits categories left empty after the item budget is consumed', () => {
    const categories = [
      { name: 'Starters', items: [{ name: 'Soup' }, { name: 'Salad' }] },
      { name: 'Mains', items: [{ name: 'Pasta' }, { name: 'Steak' }] },
      { name: 'Desserts', items: [{ name: 'Cake' }] },
    ]

    const result = truncateCategories(categories, 1)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Starters')
    expect(result[0].items).toEqual([{ name: 'Soup' }])
  })

  it('preserves categories when no truncation is needed', () => {
    const categories = [{ name: 'Drinks', items: [{ name: 'Tea' }] }]
    expect(truncateCategories(categories, 3)).toBe(categories)
  })
})
