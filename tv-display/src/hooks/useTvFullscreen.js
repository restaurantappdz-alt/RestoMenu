import { useEffect, useState, useCallback } from 'react'

export default function useTvFullscreen(enabled = true) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const checkFullscreen = useCallback(() => {
    return Boolean(
      (typeof document !== 'undefined') && (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      )
    )
  }, [])

  const requestFullscreen = useCallback(() => {
    if (!enabled) return
    try {
      if (!checkFullscreen()) {
        const docEl = document.documentElement
        const rfs =
          docEl.requestFullscreen ||
          docEl.webkitRequestFullscreen ||
          docEl.mozRequestFullScreen ||
          docEl.msRequestFullscreen

        if (rfs) {
          const promise = rfs.call(docEl)
          if (promise && typeof promise.catch === 'function') {
            promise.catch(() => {
              // Browser may defer until user gesture
            })
          }
        }
      }
    } catch {
      // Fail safe
    }
  }, [enabled, checkFullscreen])

  useEffect(() => {
    if (!enabled) return

    const onFsChange = () => {
      setIsFullscreen(checkFullscreen())
    }

    document.addEventListener('fullscreenchange', onFsChange)
    document.addEventListener('webkitfullscreenchange', onFsChange)
    document.addEventListener('mozfullscreenchange', onFsChange)
    document.addEventListener('MSFullscreenChange', onFsChange)

    // Check initial state
    setIsFullscreen(checkFullscreen())

    // Attempt fullscreen on mount
    requestFullscreen()

    // Smart TV remote press, D-pad, or any click fulfills browser user gesture requirements
    const handleInteraction = () => {
      if (!checkFullscreen()) {
        requestFullscreen()
      }
    }

    window.addEventListener('click', handleInteraction, { passive: true })
    window.addEventListener('keydown', handleInteraction, { passive: true })
    window.addEventListener('touchstart', handleInteraction, { passive: true })

    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
      document.removeEventListener('webkitfullscreenchange', onFsChange)
      document.removeEventListener('mozfullscreenchange', onFsChange)
      document.removeEventListener('MSFullscreenChange', onFsChange)

      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
    }
  }, [enabled, checkFullscreen, requestFullscreen])

  return { isFullscreen, requestFullscreen }
}
