import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const lock = vi.hoisted(() => ({
  getDeviceId: vi.fn(() => 'devMINE'),
  claimLease: vi.fn().mockResolvedValue(),
  renewLease: vi.fn().mockResolvedValue(),
  takeoverLease: vi.fn().mockResolvedValue(),
  watchLease: vi.fn(),
  loadCachedLease: vi.fn(() => null),
  saveCachedLease: vi.fn(),
  clearCachedLease: vi.fn(),
  isStale: vi.fn(() => false),
  reportEvent: vi.fn(() => Promise.resolve()),
}))

vi.mock('../src/deviceLock', () => lock)

import useDeviceLock, { RENEW_INTERVAL_MS, STALE_SCAN_MS } from '../src/hooks/useDeviceLock'

const { act } = require('react')
const React = require('react')
const TestRenderer = require('react-test-renderer')

// List of watched leases: [{ restaurantId, screenId, cb, errCb }]
const watchers = []

function renderHook(restaurantId, screenId, online) {
  let output
  function Probe() {
    output = useDeviceLock(restaurantId, screenId, online)
    return null
  }
  let renderer
  act(() => { renderer = TestRenderer.create(React.createElement(Probe)) })
  return {
    get output() { return output },
    unmount() { act(() => renderer.unmount()) },
  }
}

function watchFor(restaurantId, screenId) {
  const entry = watchers.find((w) => w.restaurantId === restaurantId && w.screenId === screenId)
  if (!entry) throw new Error(`no watcher registered for ${restaurantId}/${screenId}`)
  return entry
}

describe('useDeviceLock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    watchers.splice(0)
    lock.watchLease.mockImplementation((restaurantId, screenId, cb, errCb) => {
      watchers.push({ restaurantId, screenId, cb, errCb })
      return () => {}
    })
    lock.getDeviceId.mockReturnValue('devMINE')
    lock.isStale.mockReturnValue(false)
    lock.claimLease.mockResolvedValue()
    lock.loadCachedLease.mockReturnValue(null)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    lock.getDeviceId.mockReturnValue('devMINE')
    lock.isStale.mockReturnValue(false)
  })

  it('is active without any lock while offline', () => {
    const h = renderHook('rest1', 'tv1', false)
    expect(h.output).toBe('active')
    expect(lock.watchLease).not.toHaveBeenCalled()
    expect(lock.reportEvent).not.toHaveBeenCalled()
    h.unmount()
  })

  it('claims when no lease exists anywhere for the screen', async () => {
    const h = renderHook('rest1', 'tv1', true)
    await act(async () => { watchFor('rest1', 'tv1').cb(null) })
    expect(lock.claimLease).toHaveBeenCalledWith('rest1', 'tv1')
    expect(lock.reportEvent).toHaveBeenCalledWith('rest1', 'tv1', 'claim')
    h.unmount()
  })

  it('reports a blocked event exactly once while another device holds the lease', () => {
    const h = renderHook('rest1', 'tv1', true)
    act(() => {
      watchFor('rest1', 'tv1').cb({ deviceId: 'devOther', claimedAt: Date.now(), renewedAt: Date.now() })
    })
    expect(lock.reportEvent).toHaveBeenCalledTimes(1)
    expect(lock.reportEvent).toHaveBeenCalledWith('rest1', 'tv1', 'blocked')
    // The watcher re-fires on every foreign heartbeat — no spam.
    act(() => {
      watchFor('rest1', 'tv1').cb({ deviceId: 'devOther', claimedAt: Date.now(), renewedAt: Date.now() })
    })
    expect(lock.reportEvent).toHaveBeenCalledTimes(1)
    h.unmount()
  })

  it('reports a takeover event when it reclaims a stale foreign lease', async () => {
    lock.isStale.mockReturnValue(true)
    const h = renderHook('rest1', 'tv1', true)
    await act(async () => {
      watchFor('rest1', 'tv1').cb({ deviceId: 'devOld', claimedAt: 0, renewedAt: 0 })
    })
    expect(lock.takeoverLease).toHaveBeenCalledWith('rest1', 'tv1')
    expect(lock.reportEvent).toHaveBeenCalledWith('rest1', 'tv1', 'takeover')
    h.unmount()
  })

  it('is blocked while another device holds a fresh lease on the same screen', () => {
    const h = renderHook('rest1', 'tv1', true)
    act(() => {
      watchFor('rest1', 'tv1').cb({ deviceId: 'devOther', claimedAt: Date.now(), renewedAt: Date.now() })
    })
    expect(h.output).toBe('blocked')
    expect(lock.takeoverLease).not.toHaveBeenCalled()
    h.unmount()
  })

  it('takes over a stale foreign lease so the new connection wins', () => {
    lock.isStale.mockReturnValue(true)
    const h = renderHook('rest1', 'tv1', true)
    act(() => {
      watchFor('rest1', 'tv1').cb({ deviceId: 'devOld', claimedAt: 0, renewedAt: 0 })
    })
    expect(h.output).toBe('blocked')
    expect(lock.takeoverLease).toHaveBeenCalledWith('rest1', 'tv1')
    act(() => {
      watchFor('rest1', 'tv1').cb({ deviceId: 'devMINE', claimedAt: Date.now(), renewedAt: Date.now() })
    })
    expect(h.output).toBe('active')
    h.unmount()
  })

  it('is active and heartbeats while holding the lease', () => {
    const h = renderHook('rest1', 'tv1', true)
    act(() => {
      watchFor('rest1', 'tv1').cb({ deviceId: 'devMINE', claimedAt: Date.now(), renewedAt: Date.now() })
    })
    expect(h.output).toBe('active')
    act(() => { vi.advanceTimersByTime(RENEW_INTERVAL_MS * 2) })
    expect(lock.renewLease).toHaveBeenCalledTimes(2)
    expect(lock.renewLease).toHaveBeenCalledWith('rest1', 'tv1')
    h.unmount()
  })

  it('re-scans for a stale foreign lease without waiting for a server event', () => {
    const h = renderHook('rest1', 'tv1', true)
    act(() => {
      watchFor('rest1', 'tv1').cb({ deviceId: 'devOther', claimedAt: Date.now(), renewedAt: Date.now() })
    })
    lock.isStale.mockReturnValue(true)
    act(() => { vi.advanceTimersByTime(STALE_SCAN_MS) })
    expect(lock.takeoverLease).toHaveBeenCalledWith('rest1', 'tv1')
    h.unmount()
  })

  it('stops re-scanning and heartbeat on unmount', () => {
    const h = renderHook('rest1', 'tv1', true)
    act(() => {
      watchFor('rest1', 'tv1').cb({ deviceId: 'devMINE', claimedAt: Date.now(), renewedAt: Date.now() })
    })
    act(() => { vi.advanceTimersByTime(RENEW_INTERVAL_MS) })
    expect(lock.renewLease).toHaveBeenCalledTimes(1)
    h.unmount()
    act(() => { vi.advanceTimersByTime(RENEW_INTERVAL_MS * 3) })
    expect(lock.renewLease).toHaveBeenCalledTimes(1)
  })

  it('allows two different screens of the same restaurant to both be active', () => {
    const h1 = renderHook('rest1', 'tv1', true)
    const h2 = renderHook('rest1', 'tv2', true)

    // tv1 owned by this device; tv2 owned by this device too.
    act(() => {
      watchFor('rest1', 'tv1').cb({ deviceId: 'devMINE', claimedAt: Date.now(), renewedAt: Date.now() })
      watchFor('rest1', 'tv2').cb({ deviceId: 'devMINE', claimedAt: Date.now(), renewedAt: Date.now() })
    })
    expect(h1.output).toBe('active')
    expect(h2.output).toBe('active')

    // Two separate leases, one per screen.
    expect(lock.watchLease).toHaveBeenCalledWith('rest1', 'tv1', expect.any(Function), expect.any(Function))
    expect(lock.watchLease).toHaveBeenCalledWith('rest1', 'tv2', expect.any(Function), expect.any(Function))

    h1.unmount()
    h2.unmount()
  })

  it('keeps screens independent: a foreign lease on tv2 does not block tv1', () => {
    const h1 = renderHook('rest1', 'tv1', true)
    const h2 = renderHook('rest1', 'tv2', true)

    act(() => {
      watchFor('rest1', 'tv1').cb({ deviceId: 'devMINE', claimedAt: Date.now(), renewedAt: Date.now() })
      watchFor('rest1', 'tv2').cb({ deviceId: 'devOther', claimedAt: Date.now(), renewedAt: Date.now() })
    })

    expect(h1.output).toBe('active')
    expect(h2.output).toBe('blocked')
    h1.unmount()
    h2.unmount()
  })

  it('retries a failed claim with backoff and fails open to active', async () => {
    lock.claimLease.mockRejectedValue(new Error('permission-denied'))
    const h = renderHook('rest1', 'tv1', true)
    act(() => { watchFor('rest1', 'tv1').cb(null) })
    expect(h.output).toBe('checking')
    // Each rejection is delivered on a microtask, so flush between advances
    // so the next backoff timer gets scheduled (5s → 10s → 20s → 20s → 20s).
    await act(async () => { await Promise.resolve() })
    act(() => { vi.advanceTimersByTime(5000) })
    await act(async () => { await Promise.resolve() })
    act(() => { vi.advanceTimersByTime(10000) })
    await act(async () => { await Promise.resolve() })
    act(() => { vi.advanceTimersByTime(20000) })
    await act(async () => { await Promise.resolve() })
    act(() => { vi.advanceTimersByTime(20000) })
    await act(async () => { await Promise.resolve() })
    act(() => { vi.advanceTimersByTime(20000) })
    await act(async () => { await Promise.resolve() })
    expect(lock.claimLease).toHaveBeenCalledTimes(6)
    expect(h.output).toBe('active')
    h.unmount()
  })

  it('invalidates the cached lease and fails open when the watcher errors', async () => {
    lock.loadCachedLease.mockReturnValue({ deviceId: 'devOther', claimedAt: Date.now(), renewedAt: Date.now() })
    lock.claimLease.mockRejectedValue(new Error('network down'))
    const h = renderHook('rest1', 'tv1', true)
    // Cached foreign lease keeps the TV blocked until the watcher reports —
    // but a watcher error must invalidate it so the block cannot persist.
    expect(h.output).toBe('blocked')
    act(() => { watchFor('rest1', 'tv1').errCb(new Error('network down')) })
    expect(lock.clearCachedLease).toHaveBeenCalledWith('rest1', 'tv1')
    expect(h.output).toBe('checking')
    await act(async () => { await Promise.resolve() })
    act(() => { vi.advanceTimersByTime(5000) })
    await act(async () => { await Promise.resolve() })
    act(() => { vi.advanceTimersByTime(10000) })
    await act(async () => { await Promise.resolve() })
    act(() => { vi.advanceTimersByTime(20000) })
    await act(async () => { await Promise.resolve() })
    act(() => { vi.advanceTimersByTime(20000) })
    await act(async () => { await Promise.resolve() })
    act(() => { vi.advanceTimersByTime(20000) })
    await act(async () => { await Promise.resolve() })
    expect(h.output).toBe('active')
    h.unmount()
  })
})
