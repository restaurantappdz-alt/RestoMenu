import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import DeliveryOverlay from '../src/components/DeliveryOverlay'

afterEach(() => vi.useRealTimers())

describe('DeliveryOverlay', () => {
  it('keeps its auto-dismiss timer when the dismiss callback changes identity', () => {
    vi.useFakeTimers()
    const firstDismiss = vi.fn()
    const latestDismiss = vi.fn()
    const notification = { id: 'n1', tableLabel: '4' }
    const view = render(<DeliveryOverlay notification={notification} onDismiss={firstDismiss} />)

    view.rerender(<DeliveryOverlay notification={notification} onDismiss={latestDismiss} />)

    act(() => vi.advanceTimersByTime(3500))
    expect(firstDismiss).not.toHaveBeenCalled()
    expect(latestDismiss).toHaveBeenCalledOnce()
  })
})
