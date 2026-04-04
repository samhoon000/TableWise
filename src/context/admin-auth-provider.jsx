import { useCallback, useMemo, useState } from 'react'
import adminData from '../data/admin-users.json'
import { AdminAuthContext } from './admin-auth-context.js'

const SESSION_KEY = 'tablewise-admin-session'

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession())

  const login = useCallback((email, password) => {
    const normalized = email.trim().toLowerCase()
    const user = adminData.users.find((u) => u.email.toLowerCase() === normalized && u.password === password)
    if (!user) return { ok: false, error: 'Invalid email or password.' }
    if (!user.verified) {
      return { ok: false, error: 'Your account is not verified yet. Please wait for approval.' }
    }
    const payload = {
      email: user.email,
      displayName: user.displayName,
      restaurantId: user.restaurantId,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload))
    setSession(payload)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
