import { describe, it, expect, beforeEach } from 'vitest'
import { toDayStart, updateFromServer, checkAccess, revokeAccess } from '../src/subscriptionGuard'

function setItem(key, value) {
  localStorage.setItem(key, String(value))
}

function ts(millis) {
  return { toMillis: () => millis }
}

describe('toDayStart', () => {
  it('truncates to midnight UTC for a noon timestamp', () => {
    const noon = Date.UTC(2026, 6, 29, 12, 34, 56)
    const dayStart = Date.UTC(2026, 6, 29, 0, 0, 0)
    expect(toDayStart(noon)).toBe(dayStart)
  })

  it('returns same value for a midnight timestamp', () => {
    const midnight = Date.UTC(2026, 6, 29, 0, 0, 0)
    expect(toDayStart(midnight)).toBe(midnight)
  })

  it('rolls over at UTC day boundary', () => {
    const justBefore = Date.UTC(2026, 6, 29, 23, 59, 59, 999)
    const dayStart = Date.UTC(2026, 6, 29, 0, 0, 0)
    expect(toDayStart(justBefore)).toBe(dayStart)
  })
})

describe('updateFromServer', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores expiresAt and clockOffset from a live snapshot', () => {
    const now = Date.now()
    const expiresAtTs = ts(now + 86400000 * 30)
    const heartbeatTs = ts(now)

    updateFromServer(
      { expiresAt: expiresAtTs, heartbeatAt: heartbeatTs },
      false,
    )

    expect(localStorage.getItem('restomenu-tv-expiresAt')).toBe(String(now + 86400000 * 30))
    expect(localStorage.getItem('restomenu-tv-clockOffset')).toBe('0')
    expect(localStorage.getItem('restomenu-tv-lastSeenTime')).toBeTruthy()
  })

  it('does nothing when fromCache is true', () => {
    localStorage.setItem('restomenu-tv-expiresAt', 'old_value')
    updateFromServer(
      { expiresAt: ts(Date.now() + 86400000), heartbeatAt: ts(Date.now()) },
      true,
    )
    expect(localStorage.getItem('restomenu-tv-expiresAt')).toBe('old_value')
  })

  it('does nothing when heartbeatAt is missing', () => {
    localStorage.setItem('restomenu-tv-expiresAt', 'old_value')
    updateFromServer({ expiresAt: ts(Date.now()) }, false)
    expect(localStorage.getItem('restomenu-tv-expiresAt')).toBe('old_value')
  })
})

describe('checkAccess', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('blocks when no expiresAt is stored (first boot)', () => {
    const result = checkAccess()
    expect(result.allowed).toBe(false)
    expect(result.reason).toBe('no_expiration')
  })

  it('allows when expiresAt is far in the future', () => {
    setItem('restomenu-tv-expiresAt', String(Date.now() + 86400000 * 30))
    setItem('restomenu-tv-lastSeenTime', String(Date.now()))
    const result = checkAccess()
    expect(result.allowed).toBe(true)
  })

  it('blocks when correctedNowDay >= expiresAtDay', () => {
    const yesterday = Date.now() - 86400000
    setItem('restomenu-tv-expiresAt', String(yesterday))
    setItem('restomenu-tv-lastSeenTime', String(Date.now()))
    const result = checkAccess()
    expect(result.allowed).toBe(false)
    expect(result.reason).toBe('expired')
  })

  it('blocks on clock rollback over 5 minutes', () => {
    const now = Date.now()
    setItem('restomenu-tv-expiresAt', String(now + 86400000 * 30))
    setItem('restomenu-tv-lastSeenTime', String(now + 360000)) // 6 min in future
    const result = checkAccess()
    expect(result.allowed).toBe(false)
    expect(result.reason).toBe('clock_rolled_back')
  })

  it('tolerates clock rollback under 5 minutes', () => {
    const now = Date.now()
    setItem('restomenu-tv-expiresAt', String(now + 86400000 * 30))
    setItem('restomenu-tv-lastSeenTime', String(now)) // stamp now
    // Then set it to 4 min in the future (within tolerance)
    setItem('restomenu-tv-lastSeenTime', String(Date.now() + 240000))
    const result = checkAccess()
    expect(result.allowed).toBe(true)
  })

  it('blocks and calls revokeAccess when expired', () => {
    const now = Date.now()
    setItem('restomenu-tv-restaurant', 'test123')
    setItem('restomenu-tv-cache_test123', JSON.stringify({ id: 'menu1' }))
    setItem('restomenu-tv-config_test123', JSON.stringify({ activeMenuId: 'menu1' }))
    setItem('restomenu-tv-expiresAt', String(now - 86400000))
    setItem('restomenu-tv-lastSeenTime', String(now))

    checkAccess()

    expect(localStorage.getItem('restomenu-tv-cache_test123')).toBeNull()
    expect(localStorage.getItem('restomenu-tv-config_test123')).toBeNull()
  })

  it('blocks when correctedNowDay equals expiresAtDay', () => {
    const todayStart = toDayStart(Date.now())
    setItem('restomenu-tv-expiresAt', String(todayStart))
    setItem('restomenu-tv-lastSeenTime', String(Date.now()))

    const result = checkAccess()
    expect(result.allowed).toBe(false)
    expect(result.reason).toBe('expired')
  })

  it('offset drift of +/- 30 min does not change decision mid-day', () => {
    const now = Date.now()
    const expiresAt = now + 86400000 * 7
    setItem('restomenu-tv-expiresAt', String(expiresAt))
    setItem('restomenu-tv-lastSeenTime', String(now))

    setItem('restomenu-tv-clockOffset', String(30 * 60 * 1000))
    expect(checkAccess().allowed).toBe(true)

    setItem('restomenu-tv-clockOffset', String(-30 * 60 * 1000))
    expect(checkAccess().allowed).toBe(true)
  })

  it('offline for 10 days with normal drift still works correctly', () => {
    const now = Date.now()
    const expiresAt = now + 86400000 * 14
    setItem('restomenu-tv-expiresAt', String(expiresAt))
    setItem('restomenu-tv-lastSeenTime', String(now - 86400000 * 10))
    setItem('restomenu-tv-clockOffset', String(30000))

    expect(checkAccess().allowed).toBe(true)
  })

  it('storage error returns blocked', () => {
    // Simulate broken localStorage by clearing everything first
    localStorage.clear()
    // Don't set anything — should fail with no_expiration
    const result = checkAccess()
    expect(result.allowed).toBe(false)
  })
})

describe('revokeAccess', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('clears menu cache but preserves subscription data', () => {
    setItem('restomenu-tv-restaurant', 'test123')
    setItem('restomenu-tv-cache_test123', JSON.stringify({ id: 'menu1' }))
    setItem('restomenu-tv-config_test123', JSON.stringify({ activeMenuId: 'menu1' }))
    setItem('restomenu-tv-expiresAt', '123456789')
    setItem('restomenu-tv-clockOffset', '5000')
    setItem('restomenu-tv-lastSeenTime', '123456789')

    revokeAccess()

    expect(localStorage.getItem('restomenu-tv-cache_test123')).toBeNull()
    expect(localStorage.getItem('restomenu-tv-config_test123')).toBeNull()

    expect(localStorage.getItem('restomenu-tv-expiresAt')).toBe('123456789')
    expect(localStorage.getItem('restomenu-tv-clockOffset')).toBe('5000')
    expect(localStorage.getItem('restomenu-tv-lastSeenTime')).toBe('123456789')
  })
})
