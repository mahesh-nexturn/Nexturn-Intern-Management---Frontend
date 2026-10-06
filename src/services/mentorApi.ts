import api from "./api";
import type { ApiResponse } from "./api";

export type MentorDto = {
  id: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  status: string;
  userId: number | null;
};

export type MentorPayload = {
  name: string;
  email: string;
  department: string;
  designation: string;
  status: string;
  userId?: number | null;
};

export async function listMentors() {
  const { data } = await api.get<ApiResponse<MentorDto[]>>("/mentors");
  return data.data;
}

export async function createMentor(payload: MentorPayload) {
  const { data } = await api.post<ApiResponse<MentorDto>>("/mentors", payload);
  return data.data;
}

export async function updateMentor(id: number, payload: MentorPayload) {
  const { data } = await api.put<ApiResponse<MentorDto>>(`/mentors/${id}`, payload);
  return data.data;
}

export async function deleteMentor(id: number) {
  await api.delete(`/mentors/${id}`);
}
