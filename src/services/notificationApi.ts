import api from "./api";
import type { ApiResponse } from "./api";

export type NotificationDto = {
  id: number;
  title: string;
  message: string;
  recipient: string;
  createdByUserId: number | null;
  notificationDate: string;
  status: string;
};

export type NotificationPayload = {
  title: string;
  message: string;
  recipient: string;
};

export async function listNotifications() {
  const { data } = await api.get<ApiResponse<NotificationDto[]>>("/notifications");
  return data.data;
}

export async function createNotification(payload: NotificationPayload) {
  const { data } = await api.post<ApiResponse<NotificationDto>>("/notifications", payload);
  return data.data;
}

export async function updateNotification(id: number, payload: NotificationPayload) {
  const { data } = await api.put<ApiResponse<NotificationDto>>(`/notifications/${id}`, payload);
  return data.data;
}

export async function markNotificationRead(id: number) {
  const { data } = await api.put<ApiResponse<NotificationDto>>(`/notifications/${id}/mark-read`);
  return data.data;
}

export async function deleteNotification(id: number) {
  await api.delete(`/notifications/${id}`);
}
