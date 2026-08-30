import React, { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function DeliveryOverlay({ notification, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (notification) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        // Wait for animation to complete before removing from queue
        setTimeout(onDismiss, 500)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification, onDismiss])

  if (!notification && !visible) return null

  return (
    <div
      className={`absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 pointer-events-none ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`bg-zinc-900 border-2 border-brand-orange/50 shadow-2xl shadow-brand-orange/20 rounded-3xl p-12 flex flex-col items-center transform transition-transform duration-500 ${
          visible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'
        }`}
      >
        <div className="w-24 h-24 rounded-full bg-brand-orange/10 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-14 h-14 text-brand-orange" />
        </div>
        <h2 className="text-6xl font-heading font-bold text-white mb-4">
          Order Ready
        </h2>
        <div className="text-4xl text-white/80 font-medium text-center">
          {notification?.tableLabel ? (
            <span>Table <strong className="text-brand-orange font-bold text-5xl ml-2">{notification.tableLabel}</strong></span>
          ) : (
            <span>Ticket <strong className="text-brand-orange font-bold text-5xl ml-2">#{notification?.ticketNumber}</strong></span>
          )}
        </div>
      </div>
    </div>
  )
}
