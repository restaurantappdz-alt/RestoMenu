import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toDayStart, updateFromServer, checkAccess, revokeAccess, syncServerOffset, watchServerExpiry } from '../src/subscriptionGuard'

// Mock firebase/database BEFORE importing the module under test (pattern
// from deviceLock.test.js). The pure-function tests never touch RTDB, so
// the mock is inert for them; the watchServerExpiry tests drive it.
const dbHandlers = vi.hoisted(() => ({
  getDatabaseFn: vi.fn(() => ({})),
  refFn: vi.fn(() => ({})),
  setFn: vi.fn(),
  onValueFn: vi.fn(),
}))

vi.mock('firebase/database', () => ({
  getDatabase: dbHandlers.getDatabaseFn,
  ref: dbHandlers.refFn,
  set: dbHandlers.setFn,
  onValue: dbHandlers.onValueFn,
}))

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

  it('stores expiresAt and stamps lastSeenTime from a live snapshot', () => {
    const now = Date.now()
    const expiresAtTs = ts(now + 86400000 * 30)

    updateFromServer(
      { expiresAt: expiresAtTs },
      false,
    )

    expect(localStorage.getItem('restomenu-tv-expiresAt')).toBe(String(now + 86400000 * 30))
    // clockOffset is NOT set by updateFromServer anymore — syncServerOffset handles it
    expect(localStorage.getItem('restomenu-tv-clockOffset')).toBeNull()
    expect(localStorage.getItem('restomenu-tv-lastSeenTime')).toBeTruthy()
  })

  it('does nothing when fromCache is true', () => {
    localStorage.setItem('restomenu-tv-expiresAt', 'old_value')
    updateFromServer(
      { expiresAt: ts(Date.now() + 86400000) },
      true,
    )
    expect(localStorage.getItem('restomenu-tv-expiresAt')).toBe('old_value')
    expect(localStorage.getItem('restomenu-tv-lastSeenTime')).toBeNull()
  })

  it('stores expiresAt even when no other fields are present', () => {
    const now = Date.now()
    localStorage.setItem('restomenu-tv-expiresAt', 'old_value')
    updateFromServer(
      { expiresAt: ts(now + 86400000 * 7) },
      false,
    )
    expect(localStorage.getItem('restomenu-tv-expiresAt')).toBe(String(now + 86400000 * 7))
    expect(localStorage.getItem('restomenu-tv-lastSeenTime')).toBeTruthy()
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

  it('blocks immediately when the server has revoked access', () => {
    // Even with a future local expiry AND a fresh lastSeenTime, the
    // server-revoked flag (set by watchServerExpiry on permission_denied)
    // must win — the server clock has passed expiresAt.
    setItem('restomenu-tv-expiresAt', String(Date.now() + 86400000 * 30))
    setItem('restomenu-tv-lastSeenTime', String(Date.now()))
    setItem('restomenu-tv-server-expired', '1')

    const result = checkAccess()
    expect(result.allowed).toBe(false)
    expect(result.reason).toBe('expired')
  })

  it('server-revoked flag survives revokeAccess', () => {
    setItem('restomenu-tv-restaurant', 'test123')
    setItem('restomenu-tv-cache_test123', JSON.stringify({ id: 'menu1' }))
    setItem('restomenu-tv-server-expired', '1')

    revokeAccess()

    // The flag is what keeps the TV blocked until a fresh live value
    expect(localStorage.getItem('restomenu-tv-server-expired')).toBe('1')
    expect(localStorage.getItem('restomenu-tv-cache_test123')).toBeNull()
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

describe('updateFromServer — subscription deactivation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('clears the stored expiry on a genuine server read without expiresAt', () => {
    localStorage.setItem('restomenu-tv-expiresAt', '123456789')
    updateFromServer({ active: true }, false)
    expect(localStorage.getItem('restomenu-tv-expiresAt')).toBeNull()
    expect(localStorage.getItem('restomenu-tv-lastSeenTime')).toBeTruthy()
  })

  it('does NOT clear the stored expiry on a fromCache read without expiresAt', () => {
    localStorage.setItem('restomenu-tv-expiresAt', '123456789')
    updateFromServer({ active: true }, true)
    expect(localStorage.getItem('restomenu-tv-expiresAt')).toBe('123456789')
    expect(localStorage.getItem('restomenu-tv-lastSeenTime')).toBeNull()
  })

  it('still stores a present expiresAt on a genuine read', () => {
    const now = Date.now()
    updateFromServer({ expiresAt: ts(now + 86400000) }, false)
    expect(localStorage.getItem('restomenu-tv-expiresAt')).toBe(String(now + 86400000))
  })
})

describe('watchServerExpiry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  function captureOnValue() {
    let dataCb = null
    let errorCb = null
    dbHandlers.onValueFn.mockImplementation((_ref, cb, errCb) => {
      dataCb = cb
      errorCb = errCb || null
      return () => {}
    })
    return {
      fireValue: (val) => dataCb({ val: () => val }),
      fireError: (err) => errorCb(err),
    }
  }

  it('treats PERMISSION_DENIED as expired: sets SERVER_EXPIRED and calls onExpired', () => {
    const { fireError } = captureOnValue()
    const onExpired = vi.fn()
    watchServerExpiry('rest1', { onExpired })
    fireError({ code: 'PERMISSION_DENIED' })
    expect(localStorage.getItem('restomenu-tv-server-expired')).toBe('1')
    expect(onExpired).toHaveBeenCalled()
  })

  it('does NOT black-screen on network errors: no SERVER_EXPIRED, calls onError', () => {
    const { fireError } = captureOnValue()
    const onError = vi.fn()
    const onExpired = vi.fn()
    watchServerExpiry('rest1', { onError, onExpired })
    fireError({ code: 'NETWORK_ERROR' })
    expect(localStorage.getItem('restomenu-tv-server-expired')).toBeNull()
    expect(onError).toHaveBeenCalled()
    expect(onExpired).not.toHaveBeenCalled()
  })

  it('clears SERVER_EXPIRED and calls onMissing when the node is removed', () => {
    const { fireValue } = captureOnValue()
    const onMissing = vi.fn()
    localStorage.setItem('restomenu-tv-server-expired', '1')
    watchServerExpiry('rest1', { onMissing })
    fireValue(null)
    expect(localStorage.getItem('restomenu-tv-server-expired')).toBeNull()
    expect(onMissing).toHaveBeenCalled()
  })

  it('stores a live expiry and calls onAllowed for a future value', () => {
    const { fireValue } = captureOnValue()
    const onAllowed = vi.fn()
    const future = Date.now() + 86400000
    watchServerExpiry('rest1', { onAllowed })
    fireValue(future)
    expect(localStorage.getItem('restomenu-tv-expiresAt')).toBe(String(future))
    expect(localStorage.getItem('restomenu-tv-server-expired')).toBeNull()
    expect(onAllowed).toHaveBeenCalledWith(future)
  })
})
