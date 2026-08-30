import { useState, useEffect, useRef } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export default function useDeliveryNotifications(restaurantId, enabled = true) {
  const [queue, setQueue] = useState([])
  const isFirstLoad = useRef(true)
  const lastDocId = useRef(null)

  useEffect(() => {
    if (!restaurantId || !enabled) {
      setQueue([])
      return
    }

    const q = query(
      collection(db, 'restaurants', restaurantId, 'delivery_notifications'),
      orderBy('deliveredAt', 'desc'),
      limit(1)
    )

    const unsub = onSnapshot(q, (snap) => {
      if (snap.empty) {
        isFirstLoad.current = false
        return
      }

      const doc = snap.docs[0]
      const data = { id: doc.id, ...doc.data() }

      if (isFirstLoad.current) {
        lastDocId.current = doc.id
        isFirstLoad.current = false
        return
      }

      if (doc.id === lastDocId.current) return
      lastDocId.current = doc.id

      // Queue the notification directly since it arrived dynamically after the initial load.
      setQueue((prev) => [...prev, data])
    })

    return () => unsub()
  }, [restaurantId, enabled])

  const popNotification = () => {
    setQueue((prev) => prev.slice(1))
  }

  return { current: queue[0] || null, popNotification }
}
