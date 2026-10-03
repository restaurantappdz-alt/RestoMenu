import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const firestoreMocks = vi.hoisted(() => ({
  onSnapshot: vi.fn(),
  listener: null,
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  onSnapshot: (...args) => {
    firestoreMocks.listener = args[1]
    return vi.fn()
  },
}))

vi.mock('../src/firebase', () => ({ db: {} }))

import useDeliveryNotifications from '../src/hooks/useDeliveryNotifications'

afterEach(() => vi.clearAllMocks())

describe('useDeliveryNotifications', () => {
  it('keeps popNotification stable when notifications arrive and the queue changes', () => {
    const { result } = renderHook(() => useDeliveryNotifications('restaurant-1'))
    const initialPop = result.current.popNotification

    act(() => firestoreMocks.listener({ docChanges: () => [] })) // initial snapshot is ignored
    act(() => firestoreMocks.listener({
      docChanges: () => [{ type: 'added', doc: { id: 'ready-1', data: () => ({ tableLabel: '4' }) } }],
    }))
    expect(result.current.popNotification).toBe(initialPop)
    expect(result.current.current.id).toBe('ready-1')

    act(() => result.current.popNotification())
    expect(result.current.popNotification).toBe(initialPop)
    expect(result.current.current).toBeNull()
  })
})
