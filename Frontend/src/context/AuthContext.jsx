import { createContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    api.get('/auth/me')
      .then(({ data }) => {
        if (active) setUser(data.user)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload)
    setUser(data.user)
    return data.user
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {})
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
