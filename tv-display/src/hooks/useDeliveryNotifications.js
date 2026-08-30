import { useState, useEffect, useRef } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export default function useDeliveryNotifications(restaurantId, enabled = true) {
  const [queue, setQueue] = useState([])
  const isFirstLoad = useRef(true)

  useEffect(() => {
    if (!restaurantId || !enabled) {
      setQueue([])
      return
    }

    isFirstLoad.current = true

    const q = query(
      collection(db, 'restaurants', restaurantId, 'delivery_notifications'),
      orderBy('deliveredAt', 'desc'),
      limit(5)
    )

    const unsub = onSnapshot(q, (snap) => {
      // On first load, just record existing docs — don't show them as new
      if (isFirstLoad.current) {
        isFirstLoad.current = false
        return
      }

      // Only look at docs that were newly added since we started listening
      const added = snap.docChanges().filter((c) => c.type === 'added')
      if (added.length === 0) return

      const newNotifs = added.map((c) => ({ id: c.doc.id, ...c.doc.data() }))
      setQueue((prev) => [...prev, ...newNotifs])
    }, (error) => {
      console.error('[DeliveryNotifications] Firestore error:', error)
    })

    return () => unsub()
  }, [restaurantId, enabled])

  const popNotification = () => {
    setQueue((prev) => prev.slice(1))
  }

  return { current: queue[0] || null, popNotification }
}
