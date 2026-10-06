import api from "./api";
import type { ApiResponse } from "./api";

export type AnnouncementDto = {
  id: number;
  title: string;
  description: string | null;
  createdByUserId: number | null;
  publishDate: string | null;
  expiryDate: string | null;
  priority: string;
  targetAudience: string;
};

export type AnnouncementPayload = {
  title: string;
  description?: string;
  publishDate?: string;
  expiryDate?: string;
  priority: string;
  targetAudience: string;
};

export async function listAnnouncements() {
  const { data } = await api.get<ApiResponse<AnnouncementDto[]>>("/announcements");
  return data.data;
}

export async function createAnnouncement(payload: AnnouncementPayload) {
  const { data } = await api.post<ApiResponse<AnnouncementDto>>("/announcements", payload);
  return data.data;
}

export async function updateAnnouncement(id: number, payload: AnnouncementPayload) {
  const { data } = await api.put<ApiResponse<AnnouncementDto>>(`/announcements/${id}`, payload);
  return data.data;
}

export async function deleteAnnouncement(id: number) {
  await api.delete(`/announcements/${id}`);
}
