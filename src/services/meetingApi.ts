import api from "./api";
import type { ApiResponse } from "./api";

export type MeetingDto = {
  id: number;
  title: string;
  agenda: string | null;
  mentorId: number | null;
  internId: number | null;
  internName: string | null;
  meetingDate: string;
  meetingTime: string;
  status: string;
};

export type MeetingPayload = {
  title: string;
  agenda?: string;
  mentorId?: number | null;
  internId: number;
  meetingDate: string;
  meetingTime: string;
  status?: string;
};

export async function listMeetings(params?: { internId?: number; mentorId?: number }) {
  const { data } = await api.get<ApiResponse<MeetingDto[]>>("/meetings", { params });
  return data.data;
}

export async function createMeeting(payload: MeetingPayload) {
  const { data } = await api.post<ApiResponse<MeetingDto>>("/meetings", payload);
  return data.data;
}

export async function updateMeeting(id: number, payload: MeetingPayload) {
  const { data } = await api.put<ApiResponse<MeetingDto>>(`/meetings/${id}`, payload);
  return data.data;
}

export async function deleteMeeting(id: number) {
  await api.delete(`/meetings/${id}`);
}
