import { describe, it, expect, vi, afterEach } from 'vitest'
import { parsePhoneParams, combineMenus, mergeCategories, isSubscriptionExpired } from '../src/menuCombiner'

// Guard: day-granularity tests use vi.setSystemTime — restore real timers
// even if an assertion fails, so fake timers can't leak into other tests.
afterEach(() => {
  vi.useRealTimers()
})

describe('parsePhoneParams', () => {
  it('extracts restaurant id and layout', () => {
    expect(parsePhoneParams('?r=abc&phone=1&layout=bistro'))
      .toEqual({ restaurantId: 'abc', layout: 'bistro', menuIds: [] })
  })

  it('defaults layout to classic when missing', () => {
    expect(parsePhoneParams('?r=abc&phone=1'))
      .toEqual({ restaurantId: 'abc', layout: 'classic', menuIds: [] })
  })

  it('handles empty search', () => {
    expect(parsePhoneParams('')).toEqual({ restaurantId: null, layout: 'classic', menuIds: [] })
  })

  it('parses m into a menu id list', () => {
    expect(parsePhoneParams('?r=abc&phone=1&m=menu1,menu2'))
      .toEqual({ restaurantId: 'abc', layout: 'classic', menuIds: ['menu1', 'menu2'] })
  })

  it('returns empty menuIds when m is absent', () => {
    expect(parsePhoneParams('?r=abc&phone=1').menuIds).toEqual([])
  })

  it('cleans whitespace and trailing commas in m', () => {
    expect(parsePhoneParams('?r=abc&phone=1&m=menu1, ,menu2,').menuIds)
      .toEqual(['menu1', 'menu2'])
  })
})

describe('combineMenus', () => {
  it('preserves all menus including those with empty categories and filters out null/undefined', () => {
    const menus = [
      { id: 'a', name: 'Breakfast', categories: [{ name: 'Hot', items: [{ name: 'Eggs', price: 5 }] }] },
      null,
      { id: 'b', name: 'Drinks', categories: [{ name: 'Cold', items: [] }] },
      undefined,
      { id: 'c', name: 'Desserts', categories: [] },
    ]
    expect(combineMenus(menus)).toEqual([menus[0], menus[2], menus[4]])
  })

  it('returns empty array for null/undefined input', () => {
    expect(combineMenus(null)).toEqual([])
    expect(combineMenus(undefined)).toEqual([])
  })
})

describe('mergeCategories', () => {
  it('merges categories with case-insensitive and trimmed name matching', () => {
    const categories = [
      { name: 'Desserts', items: [{ name: 'Cake', price: 6 }] },
      { name: '  desserts  ', items: [{ name: 'Ice Cream', price: 4 }] },
      { name: 'DESSERTS', items: [{ name: 'Pie', price: 5 }] },
    ]
    const merged = mergeCategories(categories)
    expect(merged).toHaveLength(1)
    expect(merged[0].name).toBe('Desserts')
    expect(merged[0].items.map((i) => i.name)).toEqual(['Cake', 'Ice Cream', 'Pie'])
  })

  it('preserves the original casing and order of the first encountered category', () => {
    const categories = [
      { name: 'Starters & Salads', items: [{ name: 'Caesar Salad', price: 8 }] },
      { name: 'Main Dishes', items: [{ name: 'Steak', price: 20 }] },
      { name: 'starters & salads', items: [{ name: 'Soup', price: 6 }] },
    ]
    const merged = mergeCategories(categories)
    expect(merged.map((c) => c.name)).toEqual(['Starters & Salads', 'Main Dishes'])
    expect(merged[0].items.map((i) => i.name)).toEqual(['Caesar Salad', 'Soup'])
    expect(merged[1].items.map((i) => i.name)).toEqual(['Steak'])
  })

  it('concatenates category items and addons', () => {
    const categories = [
      {
        name: 'Burgers',
        items: [{ name: 'Classic Burger', price: 10 }],
        addons: [{ name: 'Cheese', price: 1 }],
      },
      {
        name: 'burgers',
        items: [{ name: 'Bacon Burger', price: 12 }],
        addons: [{ name: 'Extra Patty', price: 3 }],
      },
    ]
    const merged = mergeCategories(categories)
    expect(merged).toHaveLength(1)
    expect(merged[0].items).toEqual([
      { name: 'Classic Burger', price: 10 },
      { name: 'Bacon Burger', price: 12 },
    ])
    expect(merged[0].addons).toEqual([
      { name: 'Cheese', price: 1 },
      { name: 'Extra Patty', price: 3 },
    ])
  })

  it('filters out categories that have 0 items', () => {
    const categories = [
      { name: 'Empty Category', items: [] },
      { name: 'Another Empty', items: null },
      { name: 'Valid Category', items: [{ name: 'Coffee', price: 3 }] },
    ]
    const merged = mergeCategories(categories)
    expect(merged).toHaveLength(1)
    expect(merged[0].name).toBe('Valid Category')
  })

  it('handles null, undefined, empty lists and malformed items safely', () => {
    expect(mergeCategories(null)).toEqual([])
    expect(mergeCategories(undefined)).toEqual([])
    expect(mergeCategories([])).toEqual([])
    expect(mergeCategories([null, undefined, {}])).toEqual([])
  })
})

describe('isSubscriptionExpired', () => {
  it('fails closed when config is null or expiresAt missing', () => {
    expect(isSubscriptionExpired(null)).toBe(true)
    expect(isSubscriptionExpired({})).toBe(true)
  })

  it('returns false when expiresAt is in the future', () => {
    const future = Date.now() + 86400000
    expect(isSubscriptionExpired({ expiresAt: future })).toBe(false)
  })

  it('returns true when expiresAt is past', () => {
    const past = Date.now() - 86400000
    expect(isSubscriptionExpired({ expiresAt: past })).toBe(true)
  })

  it('accepts a Firestore Timestamp-like object (toMillis)', () => {
    const future = Date.now() + 86400000
    expect(isSubscriptionExpired({ expiresAt: { toMillis: () => future } })).toBe(false)
  })

  it('compares at UTC day granularity (expiry later today is already expired)', () => {
    // TV semantics: checkAccess() uses `toDayStart(now) >= toDayStart(expiry)`,
    // so a subscription is blocked from the START of its expiry day. The phone
    // page must agree — no partial-day mismatch between TV and phone.
    const laterToday = Date.UTC(2026, 6, 29, 23, 59, 59) // expiry today 23:59:59 UTC
    const now = Date.UTC(2026, 6, 29, 10, 0, 0) // today at 10:00 UTC
    vi.setSystemTime(now)
    expect(isSubscriptionExpired({ expiresAt: laterToday })).toBe(true)
    vi.useRealTimers()
  })

  it('remains valid until the expiry day (expiring tomorrow is NOT expired)', () => {
    const tomorrow = Date.UTC(2026, 6, 30, 0, 0, 1) // 1s past tomorrow's day start
    const now = Date.UTC(2026, 6, 29, 23, 59, 59) // today at 23:59:59 UTC
    vi.setSystemTime(now)
    expect(isSubscriptionExpired({ expiresAt: tomorrow })).toBe(false)
    vi.useRealTimers()
  })

  it('expires at the start of the expiry day (same as TV)', () => {
    const expiryDay = Date.UTC(2026, 6, 29, 0, 0, 0)
    const now = Date.UTC(2026, 6, 29, 10, 0, 0) // today, after day start
    vi.setSystemTime(now)
    expect(isSubscriptionExpired({ expiresAt: expiryDay })).toBe(true)
    vi.useRealTimers()
  })
})
