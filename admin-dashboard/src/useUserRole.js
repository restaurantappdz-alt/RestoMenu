import { useState, useEffect } from 'react'

const ADMIN_EMAILS = ['admin@restomenu.com']

export default function useUserRole(user) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
    } else {
      setIsAdmin(ADMIN_EMAILS.includes(user.email))
    }
    setLoading(false)
  }, [user])

  return { isAdmin, loading }
}
