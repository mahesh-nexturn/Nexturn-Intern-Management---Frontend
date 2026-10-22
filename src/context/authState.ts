import { createContext } from 'react'
import { authApi } from '../services'

// UI-facing role: "HR" means a management user (backend "ADMIN" or backend "HR").
// Pages check role === "HR" for manage permissions. The exact backend role is kept
// in AuthUser.backendRole / sessionStorage "backendRole" to tell ADMIN from HR users.
export type UserRole = 'HR' | 'MENTOR' | 'INTERN'

export function backendRoleToUi(role: authApi.BackendRole): UserRole {
  return role === 'ADMIN' || role === 'HR' ? 'HR' : role
}

export function uiRoleToBackend(role: UserRole): authApi.BackendRole {
  return role === 'HR' ? 'ADMIN' : role
}

export type AuthUser = {
  id: number
  role: UserRole
  backendRole: authApi.BackendRole
  email: string
  name: string
}

export type AuthContextType = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType)
