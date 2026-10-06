import api from "./api";
import type { ApiResponse } from "./api";

export type TrainingDto = {
  id: number;
  title: string;
  internId: number;
  internName: string;
  mentorId: number | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  progress: number;
};

export type TrainingPayload = {
  title: string;
  internId: number;
  mentorId?: number | null;
  startDate?: string;
  endDate?: string;
  status?: string;
  progress?: number;
};

export function statusToBackend(status: string) {
  return status.replace(/ /g, "_");
}

export function statusToUi(status: string) {
  return status.replace(/_/g, " ");
}

export async function listTrainings(params?: { internId?: number; mentorId?: number }) {
  const { data } = await api.get<ApiResponse<TrainingDto[]>>("/training", { params });
  return data.data;
}

export async function createTraining(payload: TrainingPayload) {
  const { data } = await api.post<ApiResponse<TrainingDto>>("/training", payload);
  return data.data;
}

export async function updateTraining(id: number, payload: TrainingPayload) {
  const { data } = await api.put<ApiResponse<TrainingDto>>(`/training/${id}`, payload);
  return data.data;
}

export async function deleteTraining(id: number) {
  await api.delete(`/training/${id}`);
}
