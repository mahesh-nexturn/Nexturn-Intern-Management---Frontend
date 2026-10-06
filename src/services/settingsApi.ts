import api from "./api";
import type { ApiResponse } from "./api";

export type SettingsDto = {
  userId: number;
  name: string;
  email: string;
  role: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: string;
  phone: string | null;
};

export type SettingsPayload = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: string;
  phone: string;
};

export async function getMySettings() {
  const { data } = await api.get<ApiResponse<SettingsDto>>("/settings/me");
  return data.data;
}

export async function updateMySettings(payload: SettingsPayload) {
  const { data } = await api.put<ApiResponse<SettingsDto>>("/settings/me", payload);
  return data.data;
}
