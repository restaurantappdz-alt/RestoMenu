import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock firebase before importing the hook
const unsubscribers = []
vi.mock('../src/firebase', () => ({
  db: { mock: true },
}))

// Mock onSnapshot/collection/doc from firebase/firestore
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
}))

import useAllMenus from '../src/hooks/useAllMenus'

// Bare `act(...)` in the test bodies resolves to React's act (module scope).
const { act } = require('react')

function renderHookOnce(search) {
  let output
  const originalSearch = window.location.search
  delete window.location
  window.location = { search }

  // minimal hook runner
  const React = require('react')
  const { act } = require('react')
  const TestRenderer = require('react-test-renderer')

  function Probe() {
    output = useAllMenus()
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

describe('useAllMenus', () => {
  afterEach(() => {
    Object.keys(snapshots).forEach((k) => delete snapshots[k])
    Object.keys(snapshotErrors).forEach((k) => delete snapshotErrors[k])
    unsubscribers.splice(0).forEach((u) => u.mockClear())
    vi.clearAllMocks()
  })

  it('marks needsSetup when no restaurant id', () => {
    const h = renderHookOnce('?phone=1')
    expect(h.output.needsSetup).toBe(true)
    expect(h.output.loading).toBe(false)
    h.restore()
  })

  it('fails closed: expired defaults to true until config reports', () => {
    const h = renderHookOnce('?r=rest1&phone=1&layout=modern')
    // Neither listener has fired yet — expired must already be true.
    expect(h.output.expired).toBe(true)
    expect(h.output.loading).toBe(true)
    h.unmount()
    h.restore()
  })

  it('keeps loading true until BOTH config and menus have reported', () => {
    const h = renderHookOnce('?r=rest1&phone=1')
    act(() => {
      snapshots['doc:restaurants/rest1/config/display']({ exists: () => true, data: () => ({ expiresAt: Date.now() + 86400000 }) })
    })
    // Menus have not reported yet — still loading.
    expect(h.output.loading).toBe(true)
    act(() => {
      snapshots['collection:restaurants/rest1/menus']({ docs: [] })
    })
    expect(h.output.loading).toBe(false)
    h.unmount()
    h.restore()
  })

  it('loads menus and config for a restaurant', () => {
    const h = renderHookOnce('?r=rest1&phone=1&layout=modern')
    // fire the config snapshot (future expiresAt)
    act(() => {
      snapshots['doc:restaurants/rest1/config/display']({ exists: () => true, data: () => ({ expiresAt: Date.now() + 86400000 }) })
    })
    act(() => {
      snapshots['collection:restaurants/rest1/menus']({
        docs: [
          { id: 'm1', data: () => ({ name: 'Breakfast', categories: [{ name: 'Hot', items: [{ name: 'Eggs', price: 5 }] }] }) },
          { id: 'm2', data: () => ({ name: 'Drinks', categories: [{ name: 'Cold', items: [] }] }) },
        ],
      })
    })
    expect(h.output.restaurantId).toBe('rest1')
    expect(h.output.layout).toBe('modern')
    expect(h.output.loading).toBe(false)
    expect(h.output.expired).toBe(false)
    expect(h.output.menus).toHaveLength(2)
    expect(h.output.menus[0].id).toBe('m1')
    h.unmount()
    h.restore()
  })

  it('sets expired when config expiresAt is past', () => {
    const h = renderHookOnce('?r=rest1&phone=1')
    act(() => {
      snapshots['doc:restaurants/rest1/config/display']({ exists: () => true, data: () => ({ expiresAt: Date.now() - 86400000 }) })
    })
    expect(h.output.expired).toBe(true)
    h.unmount()
    h.restore()
  })

  it('stays expired (fail closed) when the config listener errors', () => {
    const h = renderHookOnce('?r=rest1&phone=1')
    act(() => {
      snapshotErrors['doc:restaurants/rest1/config/display'](new Error('network'))
    })
    expect(h.output.expired).toBe(true)
    h.unmount()
    h.restore()
  })

  it('uses live phoneMenuLayout from config over the URL fallback', () => {
    const h = renderHookOnce('?r=rest1&phone=1&layout=classic')
    act(() => {
      snapshots['doc:restaurants/rest1/config/display']({ exists: () => true, data: () => ({ expiresAt: Date.now() + 86400000, phoneMenuLayout: 'bistro' }) })
    })
    expect(h.output.layout).toBe('bistro')
    h.unmount()
    h.restore()
  })
})
