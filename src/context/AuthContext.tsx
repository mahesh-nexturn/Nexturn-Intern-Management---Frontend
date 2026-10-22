import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import type { ReactNode } from 'react'
import { clearTokens, getAccessToken } from '../services'
import {
  baseApi,
  getCurrentUserEndpoint,
  loginEndpoint,
  logoutEndpoint,
  type AppDispatch,
} from '../store'
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
  const dispatch = useDispatch<AppDispatch>()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(() => !!getAccessToken())

  useEffect(() => {
    // On app load, if we still hold an access token, re-hydrate the session
    // from the backend (/auth/user) instead of trusting stale sessionStorage values.
    const token = getAccessToken()
    if (!token) return

    const request = dispatch(getCurrentUserEndpoint.initiate(undefined, { forceRefetch: true }))
    request
      .unwrap()
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
        dispatch(baseApi.util.resetApiState())
        setUser(null)
      })
      .finally(() => setLoading(false))

    return () => request.unsubscribe()
  }, [dispatch])

  const login = async (email: string, password: string) => {
    const result = await dispatch(loginEndpoint.initiate({ email, password })).unwrap()
    const authUser: AuthUser = {
      id: result.userId,
      role: backendRoleToUi(result.role),
      backendRole: result.role,
      email: result.email,
      name: result.name,
    }
    persistUser(authUser)
    // Drop anything cached for a previous session before the new user's pages mount.
    dispatch(baseApi.util.resetApiState())
    setUser(authUser)
    return authUser
  }

  const logout = async () => {
    try {
      await dispatch(logoutEndpoint.initiate()).unwrap()
    } finally {
      clearUser()
      dispatch(baseApi.util.resetApiState())
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  )
}
