import api, { setTokens, clearTokens } from "./api";
import type { ApiResponse } from "./api";

export type BackendRole = "ADMIN" | "MENTOR" | "INTERN";

export type AuthResponseData = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  role: BackendRole;
};

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: BackendRole;
};

export async function login(email: string, password: string) {
  const { data } = await api.post<ApiResponse<AuthResponseData>>("/auth/login", {
    email,
    password,
  });
  setTokens(data.data.accessToken, data.data.refreshToken);
  return data.data;
}

export async function me() {
  const { data } = await api.get<ApiResponse<CurrentUser>>("/auth/me");
  return data.data;
}

export async function logout() {
  const refreshToken = localStorage.getItem("refreshToken");
  try {
    if (refreshToken) {
      await api.post("/auth/logout", { refreshToken });
    }
  } finally {
    clearTokens();
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await api.post("/auth/change-password", { currentPassword, newPassword });
}
