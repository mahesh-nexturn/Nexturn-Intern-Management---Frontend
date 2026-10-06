import api from "./api";
import type { ApiResponse } from "./api";

export type InternDto = {
  id: number;
  name: string;
  email: string;
  department: string;
  status: string;
  mentorId: number | null;
  mentorName: string | null;
  userId: number | null;
};

export type InternPayload = {
  name: string;
  email: string;
  department: string;
  status: string;
  mentorId?: number | null;
  userId?: number | null;
};

export async function listInterns() {
  const { data } = await api.get<ApiResponse<InternDto[]>>("/interns");
  return data.data;
}

export async function getInternDashboard(id: number) {
  const { data } = await api.get<ApiResponse<unknown>>(`/interns/${id}/dashboard`);
  return data.data;
}

export async function createIntern(payload: InternPayload) {
  const { data } = await api.post<ApiResponse<InternDto>>("/interns", payload);
  return data.data;
}

export async function updateIntern(id: number, payload: InternPayload) {
  const { data } = await api.put<ApiResponse<InternDto>>(`/interns/${id}`, payload);
  return data.data;
}

export async function deleteIntern(id: number) {
  await api.delete(`/interns/${id}`);
}
