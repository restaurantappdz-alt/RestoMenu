import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock firebase before importing the hook (pattern from useAllMenus.test.js)
const unsubscribers = []
vi.mock('../src/firebase', () => ({
  db: { mock: true },
}))

const snapshots = {} // path -> (listener) => unsubscribe
const snapshotErrors = {} // path -> error callback
vi.mock('firebase/firestore', () => ({
  onSnapshot: vi.fn((ref, cb, errCb) => {
    const key = ref._path
    snapshots[key] = cb
    snapshotErrors[key] = errCb
    const unsub = vi.fn()
    unsubscribers.push(unsub)
    return unsub
  }),
  collection: vi.fn((db, ...path) => ({ _path: `collection:${path.join('/')}` })),
  doc: vi.fn((db, ...path) => ({ _path: `doc:${path.join('/')}` })),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
}))

vi.mock('firebase/database', () => ({
  getDatabase: () => ({}),
  ref: () => ({}),
  set: vi.fn(),
  onValue: vi.fn(() => () => {}),
}))

// Keep the hook's own subscription logic real; stub the network edges so
// the M2/M3 connection-state behaviors are tested in isolation.
vi.mock('../src/subscriptionGuard', () => ({
  updateFromServer: vi.fn(),
  checkAccess: vi.fn(() => ({ allowed: true, reason: null })),
  syncServerOffset: vi.fn(() => Promise.resolve()),
  watchServerExpiry: vi.fn(() => () => {}),
}))

import useMenuData from '../src/hooks/useMenuData'

// Bare `act(...)` in the test bodies resolves to React's act (module scope).
const { act } = require('react')

// Firestore snapshot doubles: the hook reads snap.metadata.fromCache on every
// successful config snapshot, so the doubles must carry it or the handler
// throws a TypeError before reaching the state transitions under test.
const liveSnap = (data) => ({
  exists: () => true,
  data: () => data,
  metadata: { fromCache: false },
})

function renderHookOnce(search) {
  let output
  const originalSearch = window.location.search
  delete window.location
  window.location = { search }

  const React = require('react')
  const TestRenderer = require('react-test-renderer')

  function Probe() {
    output = useMenuData()
    return null
  }

  let renderer
  act(() => {
    renderer = TestRenderer.create(React.createElement(Probe))
  })

  return {
    get output() { return output },
    act,
    unmount() { act(() => renderer.unmount()) },
    restore() { window.location.search = originalSearch },
  }
}

describe('useMenuData — connection error states (M2/M3)', () => {
  beforeEach(() => {
    // Polluted cache between tests changes the hook's initial loading state
    // and hides the watchdog paths — start clean every test.
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    Object.keys(snapshots).forEach((k) => delete snapshots[k])
    Object.keys(snapshotErrors).forEach((k) => delete snapshotErrors[k])
    unsubscribers.splice(0).forEach((u) => u.mockClear())
    vi.clearAllMocks()
  })

  it('sets connectionError when the config snapshot errors', () => {
    const h = renderHookOnce('?r=rest1')
    act(() => {
      snapshotErrors['doc:restaurants/rest1/config/display'](new Error('network'))
    })
    expect(h.output.connectionError).toBe(true)
    h.unmount()
    h.restore()
  })

  it('clears connectionError on the next successful snapshot', () => {
    const h = renderHookOnce('?r=rest1')
    act(() => {
      snapshotErrors['doc:restaurants/rest1/config/display'](new Error('network'))
    })
    expect(h.output.connectionError).toBe(true)
    act(() => {
      snapshots['doc:restaurants/rest1/config/display'](liveSnap({}))
    })
    expect(h.output.connectionError).toBe(false)
    h.unmount()
    h.restore()
  })

  it('sets connectionError when the menu snapshot errors', () => {
    localStorage.setItem('restomenu-tv-cache_rest1', JSON.stringify({ id: 'm1', name: 'Cached' }))
    const h = renderHookOnce('?r=rest1')
    act(() => {
      snapshots['doc:restaurants/rest1/config/display'](liveSnap({ activeMenuId: 'm1' }))
    })
    act(() => {
      snapshotErrors['doc:restaurants/rest1/menus/m1'](new Error('network'))
    })
    expect(h.output.connectionError).toBe(true)
    h.unmount()
    h.restore()
  })

  it('watchdog: loading stuck past 20s flips to connectionError', () => {
    vi.useFakeTimers()
    const h = renderHookOnce('?r=rest1')
    expect(h.output.loading).toBe(true)
    act(() => { vi.advanceTimersByTime(20000) })
    expect(h.output.connectionError).toBe(true)
    expect(h.output.loading).toBe(false)
    h.unmount()
    h.restore()
  })

  it('watchdog: waiting past 20s without a config snapshot flips to connectionError', () => {
    vi.useFakeTimers()
    const h = renderHookOnce('?r=rest1')
    act(() => {
      snapshots['doc:restaurants/rest1/config/display'](liveSnap({}))
    })
    expect(h.output.waiting).toBe(true)
    act(() => { vi.advanceTimersByTime(20000) })
    expect(h.output.connectionError).toBe(true)
    expect(h.output.waiting).toBe(false)
    h.unmount()
    h.restore()
  })

  it('ends loading when the menu doc is deleted but a cached copy matches', () => {
    localStorage.setItem('restomenu-tv-cache_rest1', JSON.stringify({ id: 'm1', name: 'Cached' }))
    const h = renderHookOnce('?r=rest1')
    act(() => {
      snapshots['doc:restaurants/rest1/config/display'](liveSnap({ activeMenuId: 'm1' }))
    })
    expect(h.output.loading).toBe(true)
    act(() => {
      snapshots['doc:restaurants/rest1/menus/m1']({ exists: () => false })
    })
    expect(h.output.loading).toBe(false)
    // The whole point of the branch: keep showing the cached copy, never
    // blank the screen or keep spinning.
    expect(h.output.menu).toEqual({ id: 'm1', name: 'Cached' })
    h.unmount()
    h.restore()
  })
})
