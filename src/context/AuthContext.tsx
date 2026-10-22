import { useEffect, useState } from 'react'

import type { ReactNode } from 'react'
import * as authApi from '../services/authApi'
import { clearTokens, getAccessToken } from '../services/api'
import { AuthContext, backendRoleToUi, type AuthUser } from './authState'

type Props = {
  children: ReactNode
}

function persistUser(user: AuthUser) {
  sessionStorage.setItem('role', user.role)
  sessionStorage.setItem('backendRole', user.backendRole)
  sessionStorage.setItem('email', user.email)
  sessionStorage.setItem('name', user.name)
  sessionStorage.setItem('userId', String(user.id))
}

function clearUser() {
  sessionStorage.removeItem('role')
  sessionStorage.removeItem('backendRole')
  sessionStorage.removeItem('email')
  sessionStorage.removeItem('name')
  sessionStorage.removeItem('userId')
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(() => !!getAccessToken())

  useEffect(() => {
    // On app load, if we still hold an access token, re-hydrate the session
    // from the backend (/auth/user) instead of trusting stale sessionStorage values.
    const token = getAccessToken()
    if (!token) return

    authApi
      .me()
      .then((current) => {
        const authUser: AuthUser = {
          id: current.id,
          role: backendRoleToUi(current.role),
          backendRole: current.role,
          email: current.email,
          name: current.name,
        }
        persistUser(authUser)
        setUser(authUser)
      })
      .catch(() => {
        clearTokens()
        clearUser()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const result = await authApi.login(email, password)
    const authUser: AuthUser = {
      id: result.userId,
      role: backendRoleToUi(result.role),
      backendRole: result.role,
      email: result.email,
      name: result.name,
    }
    persistUser(authUser)
    setUser(authUser)
    return authUser
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } finally {
      clearUser()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  )
}
