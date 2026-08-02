import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const lock = vi.hoisted(() => ({
  getDeviceId: vi.fn(() => 'devMINE'),
  claimLease: vi.fn().mockResolvedValue(),
  renewLease: vi.fn().mockResolvedValue(),
  takeoverLease: vi.fn().mockResolvedValue(),
  watchLease: vi.fn(),
  loadCachedLease: vi.fn(() => null),
  saveCachedLease: vi.fn(),
  isStale: vi.fn(() => false),
}))

vi.mock('../src/deviceLock', () => lock)

import useDeviceLock, { RENEW_INTERVAL_MS, STALE_SCAN_MS } from '../src/hooks/useDeviceLock'

const { act } = require('react')
const React = require('react')
const TestRenderer = require('react-test-renderer')

const listeners = []

function renderHook(restaurantId, online) {
  let output
  function Probe() {
    output = useDeviceLock(restaurantId, 'screenA', online)
    return null
  }
  let renderer
  act(() => { renderer = TestRenderer.create(React.createElement(Probe)) })
  return {
    get output() { return output },
    unmount() { act(() => renderer.unmount()) },
  }
}

describe('useDeviceLock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    listeners.splice(0)
    lock.watchLease.mockImplementation((_restaurantId, _screenId, cb) => {
      listeners.push(cb)
      return () => {}
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    lock.getDeviceId.mockReturnValue('devMine')
    lock.isStale.mockReturnValue(false)
  })

  it('is active without any lock while offline', () => {
    const h = renderHook('rest1', false)
    expect(h.output).toBe('active')
    expect(lock.watchLease).not.toHaveBeenCalled()
    h.unmount()
  })

  it('claims when no lease exists anywhere', () => {
    const h = renderHook('rest1', true)
    act(() => { listeners[0](null) })
    expect(lock.claimLease).toHaveBeenCalledWith('rest1', 'screenA')
    h.unmount()
  })

  it('is blocked while another device holds a fresh lease', () => {
    const h = renderHook('rest1', true)
    act(() => {
      listeners[0]({ deviceId: 'devOther', claimedAt: Date.now(), renewedAt: Date.now() })
    })
    expect(h.output).toBe('blocked')
    expect(lock.takeoverLease).not.toHaveBeenCalled()
    h.unmount()
  })

  it('takes over a stale foreign lease so the new connection wins', () => {
    lock.isStale.mockReturnValue(true)
    const h = renderHook('rest1', true)
    act(() => {
      listeners[0]({ deviceId: 'devOld', claimedAt: 0, renewedAt: 0 })
    })
    expect(h.output).toBe('blocked')
    expect(lock.takeoverLease).toHaveBeenCalledWith('rest1', 'screenA')
    act(() => {
      listeners[0]({ deviceId: 'devMine', claimedAt: Date.now(), renewedAt: Date.now() })
    })
    expect(h.output).toBe('active')
    h.unmount()
  })

  it('is active and heartbeats while holding the lease', () => {
    const h = renderHook('rest1', true)
    act(() => {
      listeners[0]({ deviceId: 'devMine', claimedAt: Date.now(), renewedAt: Date.now() })
    })
    expect(h.output).toBe('active')
    act(() => { vi.advanceTimersByTime(RENEW_INTERVAL_MS * 2) })
    expect(lock.renewLease).toHaveBeenCalledTimes(2)
    expect(lock.renewLease).toHaveBeenCalledWith('rest1', 'screenA')
    h.unmount()
  })

  it('re-scans for a stale foreign lease without waiting for a server event', () => {
    const h = renderHook('rest1', true)
    act(() => {
      listeners[0]({ deviceId: 'devOther', claimedAt: Date.now(), renewedAt: Date.now() })
    })
    lock.isStale.mockReturnValue(true)
    act(() => { vi.advanceTimersByTime(STALE_SCAN_MS) })
    expect(lock.takeoverLease).toHaveBeenCalledWith('rest1', 'screenA')
    h.unmount()
  })

  it('stops re-scanning and heartbeat on unmount', () => {
    const h = renderHook('rest1', true)
    act(() => {
      listeners[0]({ deviceId: 'devMine', claimedAt: Date.now(), renewedAt: Date.now() })
    })
    act(() => { vi.advanceTimersByTime(RENEW_INTERVAL_MS) })
    expect(lock.renewLease).toHaveBeenCalledTimes(1)
    h.unmount()
    act(() => { vi.advanceTimersByTime(RENEW_INTERVAL_MS * 3) })
    expect(lock.renewLease).toHaveBeenCalledTimes(1)
  })
})