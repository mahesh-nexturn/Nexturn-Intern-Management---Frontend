import api from "./api";
import type { ApiResponse } from "./api";

export type FeedbackDto = {
  id: number;
  fromUserId: number;
  fromUserName: string;
  subject: string | null;
  message: string;
  createdAt: string;
};

export type FeedbackPayload = {
  subject?: string;
  message: string;
};

export async function listAllFeedback() {
  const { data } = await api.get<ApiResponse<FeedbackDto[]>>("/feedback");
  return data.data;
}

export async function listMyFeedback() {
  const { data } = await api.get<ApiResponse<FeedbackDto[]>>("/feedback/my");
  return data.data;
}

export async function createFeedback(payload: FeedbackPayload) {
  const { data } = await api.post<ApiResponse<FeedbackDto>>("/feedback", payload);
  return data.data;
}

export async function deleteFeedback(id: number) {
  await api.delete(`/feedback/${id}`);
}
