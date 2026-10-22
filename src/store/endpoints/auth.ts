import { authApi } from '../../services'
import { baseApi, run } from '../baseApi'

const authEndpoints = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<authApi.AuthResponseData, { email: string; password: string }>({
      queryFn: ({ email, password }) => run(() => authApi.login(email, password)),
    }),
    getCurrentUser: build.query<authApi.CurrentUser, void>({
      queryFn: () => run(() => authApi.me()),
    }),
    logout: build.mutation<void, void>({
      queryFn: () => run(() => authApi.logout()),
    }),
    changePassword: build.mutation<void, { currentPassword: string; newPassword: string }>({
      queryFn: ({ currentPassword, newPassword }) =>
        run(() => authApi.changePassword(currentPassword, newPassword)),
    }),
  }),
})

export const { useChangePasswordMutation } = authEndpoints
export const {
  login: loginEndpoint,
  getCurrentUser: getCurrentUserEndpoint,
  logout: logoutEndpoint,
} = authEndpoints.endpoints
