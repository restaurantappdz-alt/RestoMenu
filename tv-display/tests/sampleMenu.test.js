import { describe, it, expect } from 'vitest'
import { sampleMenu } from '../src/sampleMenu'

describe('sampleMenu', () => {
  it('has exactly 5 categories, none empty', () => {
    expect(sampleMenu.categories).toHaveLength(5)
    for (const cat of sampleMenu.categories) {
      expect(cat.name.length).toBeGreaterThan(0)
      expect(cat.items.length).toBeGreaterThan(0)
    }
  })

  it('has at most 5 items per category', () => {
    for (const cat of sampleMenu.categories) {
      expect(cat.items.length).toBeLessThanOrEqual(5)
    }
  })

  it('every item has a non-empty string name and price', () => {
    for (const cat of sampleMenu.categories) {
      for (const item of cat.items) {
        expect(typeof item.name).toBe('string')
        expect(item.name.length).toBeGreaterThan(0)
        expect(typeof item.price).toBe('string')
        expect(item.price.length).toBeGreaterThan(0)
      }
    }
  })

  it('has exactly 4 addons and D.A currency + photo-menu hero fields', () => {
    const addons = sampleMenu.categories.flatMap((c) => c.addons || [])
    expect(addons).toHaveLength(4)
    for (const a of addons) {
      expect(typeof a.name).toBe('string')
      expect(typeof a.price).toBe('string')
    }
    expect(sampleMenu.currency).toBe('D.A')
    expect(sampleMenu.heroName).toBeTruthy()
    expect(sampleMenu.heroPrice).toBeTruthy()
    expect(sampleMenu.heroImageUrl).toMatch(/^https:\/\//)
  })
})
