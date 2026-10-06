import api from "./api";
import type { ApiResponse } from "./api";

export type PpoDto = {
  id: number;
  internId: number;
  internName: string;
  mentorId: number | null;
  mentorName: string | null;
  attendancePct: number;
  trainingCompletionPct: number;
  technicalScore: number;
  communicationScore: number;
  overallScore: number;
  mentorRecommendation: string | null;
  hrRecommendation: string | null;
  status: string;
};

export type PpoPayload = {
  internId: number;
  mentorId?: number | null;
  attendancePct: number;
  trainingCompletionPct: number;
  technicalScore: number;
  communicationScore: number;
  overallScore: number;
  mentorRecommendation?: string | null;
  hrRecommendation?: string | null;
  status?: string;
};

export async function listPpo(params?: { mentorId?: number }) {
  const { data } = await api.get<ApiResponse<PpoDto[]>>("/ppo", { params });
  return data.data;
}

export async function getMyPpo() {
  const { data } = await api.get<ApiResponse<PpoDto>>("/ppo/my");
  return data.data;
}

export async function createPpo(payload: PpoPayload) {
  const { data } = await api.post<ApiResponse<PpoDto>>("/ppo", payload);
  return data.data;
}

export async function updatePpo(id: number, payload: PpoPayload) {
  const { data } = await api.put<ApiResponse<PpoDto>>(`/ppo/${id}`, payload);
  return data.data;
}

export async function deletePpo(id: number) {
  await api.delete(`/ppo/${id}`);
}
