import { describe, it, expect, vi, afterEach } from 'vitest'
import { parsePhoneParams, combineMenus, isSubscriptionExpired } from '../src/menuCombiner'

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
  it('keeps menus that have at least one item, drops empty ones, preserves order', () => {
    const menus = [
      { id: 'a', name: 'Breakfast', categories: [{ name: 'Hot', items: [{ name: 'Eggs', price: 5 }] }] },
      { id: 'b', name: 'Drinks', categories: [{ name: 'Cold', items: [] }] },
      { id: 'c', name: 'Desserts', categories: [] },
    ]
    expect(combineMenus(menus)).toEqual([menus[0]])
  })

  it('returns empty array for null/undefined input', () => {
    expect(combineMenus(null)).toEqual([])
    expect(combineMenus(undefined)).toEqual([])
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
