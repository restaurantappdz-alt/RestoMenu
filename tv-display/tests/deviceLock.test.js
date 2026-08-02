import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock firebase/database BEFORE importing the module under test.
// Regression under test: claimLease must call the modular onDisconnect(ref)
// FUNCTION, not a (non-existent) r.onDisconnect() method — the method call
// throws a TypeError that silently disables the whole device lock.
const handlers = vi.hoisted(() => ({
  refFn: vi.fn(),
  setFn: vi.fn(),
  onValueFn: vi.fn(),
  onDisconnectFn: vi.fn(),
  removeFn: vi.fn(),
}))

vi.mock('firebase/database', () => ({
  getDatabase: () => ({}),
  ref: handlers.refFn,
  set: handlers.setFn,
  onValue: handlers.onValueFn,
  serverTimestamp: () => ({ '.sv': 'timestamp' }),
  onDisconnect: handlers.onDisconnectFn,
  remove: handlers.removeFn,
}))

import { claimLease, watchLease, getDeviceId, renewLease, takeoverLease, isStale, LEASE_TTL_MS } from '../src/deviceLock'

function mockRef() {
  const r = {}
  handlers.refFn.mockReturnValue(r)
  return r
}

function mockPending() {
  const pending = { remove: vi.fn().mockResolvedValue(), cancel: vi.fn() }
  handlers.onDisconnectFn.mockReturnValue(pending)
  return pending
}

describe('claimLease', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('registers disconnect cleanup via the modular onDisconnect(ref) function', async () => {
    const r = mockRef()
    const pending = mockPending()
    handlers.setFn.mockResolvedValue()

    await expect(claimLease('rest123')).resolves.toBeUndefined()

    expect(handlers.onDisconnectFn).toHaveBeenCalledWith(r)
    expect(pending.remove).toHaveBeenCalledTimes(1)
    expect(handlers.setFn).toHaveBeenCalledWith(
      r,
      expect.objectContaining({ deviceId: expect.any(String), claimedAt: { '.sv': 'timestamp' } }),
    )
  })

  it('registers the disconnect cleanup BEFORE writing the lease', async () => {
    const r = mockRef()
    const pending = mockPending()
    handlers.setFn.mockResolvedValue()

    await claimLease('rest123')

    const removeCallOrder = pending.remove.mock.invocationCallOrder[0]
    const setCallOrder = handlers.setFn.mock.invocationCallOrder[0]
    expect(removeCallOrder).toBeLessThan(setCallOrder)
  })

  it('cancels the cleanup when the claim write is rejected', async () => {
    const r = mockRef()
    const pending = mockPending()
    handlers.setFn.mockRejectedValue(new Error('permission-denied'))

    await expect(claimLease('rest123')).rejects.toThrow('permission-denied')
    expect(pending.cancel).toHaveBeenCalledTimes(1)
  })
})

describe('watchLease', () => {
  beforeEach(() => vi.clearAllMocks())

  it('subscribes to the lease path and forwards the snapshot value', () => {
    const r = mockRef()
    let cb
    handlers.onValueFn.mockImplementation((_ref, callback) => {
      cb = callback
      return () => {}
    })

    const onLease = vi.fn()
    const unsub = watchLease('rest123', onLease)

    expect(handlers.onValueFn).toHaveBeenCalledWith(r, expect.any(Function))
    cb({ val: () => ({ deviceId: 'devA', claimedAt: 123 }) })
    expect(onLease).toHaveBeenCalledWith({ deviceId: 'devA', claimedAt: 123 })

    cb({ val: () => null })
    expect(onLease).toHaveBeenCalledWith(null)
    expect(unsub).toBeInstanceOf(Function)
  })
})

describe('getDeviceId', () => {
  it('generates a persistent id stored in localStorage', () => {
    localStorage.clear()
    const first = getDeviceId()
    expect(first).toBeTruthy()
    expect(getDeviceId()).toBe(first)
  })
})

describe('renewLease', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('re-writes the same-device lease with a fresh renewedAt timestamp', async () => {
    const r = mockRef()
    handlers.setFn.mockResolvedValue()

    await expect(renewLease('rest123')).resolves.toBeUndefined()

    expect(handlers.setFn).toHaveBeenCalledWith(
      r,
      expect.objectContaining({
        deviceId: expect.any(String),
        claimedAt: { '.sv': 'timestamp' },
        renewedAt: { '.sv': 'timestamp' },
      }),
    )
    expect(handlers.onDisconnectFn).not.toHaveBeenCalled()
  })
})

describe('takeoverLease', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('removes the stale foreign lease, then claims it for this device', async () => {
    const r = mockRef()
    const pending = mockPending()
    handlers.removeFn.mockResolvedValue()
    handlers.setFn.mockResolvedValue()

    await expect(takeoverLease('rest123')).resolves.toBeUndefined()

    expect(handlers.removeFn).toHaveBeenCalledWith(r)
    expect(handlers.onDisconnectFn).toHaveBeenCalledWith(r)
    expect(pending.remove).toHaveBeenCalledTimes(1)
    expect(pending.remove.mock.invocationCallOrder[0])
      .toBeLessThan(handlers.setFn.mock.invocationCallOrder[0])
  })
})

describe('isStale', () => {
  it('considers a lease with a fresh renewedAt as alive', () => {
    const now = Date.now()
    expect(isStale({ deviceId: 'a', claimedAt: now - 5000, renewedAt: now - 5000 }, now)).toBe(false)
  })

  it('considers a lease with renewedAt older than the TTL as stale', () => {
    const now = Date.now()
    expect(isStale({ deviceId: 'a', claimedAt: now, renewedAt: now - LEASE_TTL_MS - 1000 }, now)).toBe(true)
  })

  it('falls back to claimedAt for legacy leases that have no renewedAt', () => {
    const now = Date.now()
    expect(isStale({ deviceId: 'a', claimedAt: now - LEASE_TTL_MS - 1000 }, now)).toBe(true)
    expect(isStale({ deviceId: 'a', claimedAt: now - 5000 }, now)).toBe(false)
  })

  it('returns false for null/empty payloads', () => {
    expect(isStale(null, Date.now())).toBe(false)
    expect(isStale({}, Date.now())).toBe(false)
  })
})
