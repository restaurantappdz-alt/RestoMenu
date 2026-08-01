import { useState, useEffect } from 'react'
import { onSnapshot, collection, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { parsePhoneParams, isSubscriptionExpired } from '../menuCombiner'

/**
 * Data hook for the phone menu page.
 * Loads the restaurant's config (soft subscription gate) and ALL its menus
 * in real time. Deliberately does NOT use useDeviceLock or the TV
 * subscriptionGuard — the phone page must never be device-locked.
 */
export default function useAllMenus() {
  const [restaurantId, setRestaurantId] = useState(null)
  const [layout, setLayout] = useState('classic')
  const [restaurantName, setRestaurantName] = useState('')
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  // Fail closed: until the config snapshot actually reports, treat the
  // subscription as expired (matches isSubscriptionExpired's fail-closed
  // behavior, so a failed/never-firing config listener cannot open the gate).
  const [expired, setExpired] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)

  useEffect(() => {
    const { restaurantId: rid, layout: lyt } = parsePhoneParams(window.location.search)
    setRestaurantId(rid)
    // The URL layout is only the first-paint fallback; the live config's
    // phoneMenuLayout (owner's current pick) wins once it arrives, so old
    // printed QRs always show the owner's current layout.
    setLayout(lyt)
    if (!rid) {
      setNeedsSetup(true)
      setLoading(false)
      return
    }
    setNeedsSetup(false)

    // loading must stay true until BOTH listeners have reported at least
    // once — otherwise a fast menus snapshot would render the menu before
    // the config snapshot has had a chance to mark the restaurant expired.
    let configReported = false
    let menusReported = false
    const maybeDone = () => {
      if (configReported && menusReported) setLoading(false)
    }

    const unsubConfig = onSnapshot(
      doc(db, 'restaurants', rid, 'config', 'display'),
      (snap) => {
        const data = snap.exists() ? snap.data() : null
        setExpired(isSubscriptionExpired(data))
        if (data && typeof data.phoneMenuLayout === 'string') {
          setLayout(data.phoneMenuLayout)
        }
        configReported = true
        maybeDone()
      },
      (error) => {
        // Config read failed → keep expired=true (fail closed) and stop
        // waiting: the gate is shut, but the page should not spin forever.
        configReported = true
        maybeDone()
      },
    )

    const unsubRestaurant = onSnapshot(doc(db, 'restaurants', rid), (snap) => {
      setRestaurantName(snap.exists() ? (snap.data().name || '') : '')
    })

    const unsubMenus = onSnapshot(
      collection(db, 'restaurants', rid, 'menus'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setMenus(list)
        menusReported = true
        maybeDone()
      },
      (error) => {
        menusReported = true
        maybeDone()
      },
    )

    return () => {
      unsubConfig()
      unsubRestaurant()
      unsubMenus()
    }
  }, [])

  return { restaurantId, layout, restaurantName, menus, loading, expired, needsSetup }
}
