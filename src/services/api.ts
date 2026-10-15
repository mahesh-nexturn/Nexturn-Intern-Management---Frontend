import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Generic envelope returned by every backend endpoint: { success, data, message }
export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function getAccessToken() {
  return sessionStorage.getItem('accessToken')
}

export function getRefreshToken() {
  return sessionStorage.getItem('refreshToken')
}

export function setTokens(accessToken: string, refreshToken: string) {
  sessionStorage.setItem('accessToken', accessToken)
  sessionStorage.setItem('refreshToken', refreshToken)
}

export function clearTokens() {
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<void> | null = null

// Single shared refresh so concurrent requests don't each rotate the token.
function refreshTokens(): Promise<void> {
  if (!refreshPromise) {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return Promise.reject(new Error('No refresh token'))

    refreshPromise = axios
      .post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
      )
      .then(({ data }) => setTokens(data.data.accessToken, data.data.refreshToken))
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

function isAuthUrl(url?: string) {
  return !!url && (url.includes('/auth/login') || url.includes('/auth/refresh'))
}

function logoutToLogin() {
  clearTokens()
  window.location.href = '/'
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    // The backend answers 403 (not 401) for a missing/expired token, so refresh on both.
    const status = error.response?.status
    if (
      (status === 401 || status === 403) &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthUrl(originalRequest.url)
    ) {
      if (!getRefreshToken()) {
        logoutToLogin()
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        await refreshTokens()
      } catch (refreshError) {
        logoutToLogin()
        return Promise.reject(refreshError)
      }
      return api(originalRequest)
    }

    return Promise.reject(error)
  },
)

export default api
