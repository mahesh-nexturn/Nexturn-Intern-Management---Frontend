import api from "./api";
import type { ApiResponse } from "./api";

export type TaskDto = {
  id: number;
  title: string;
  description: string;
  internId: number | null;
  internName: string | null;
  mentorId: number | null;
  priority: string;
  dueDate: string;
  status: string; // "Pending" | "In Progress" | "Completed"
  progress: number;
};

export type TaskPayload = {
  title: string;
  description?: string;
  internId: number;
  mentorId?: number | null;
  priority: string;
  dueDate?: string;
  status?: string; // send with underscore, e.g. "In_Progress"
  progress?: number;
};

export type TaskStatsDto = {
  pending: number;
  inProgress: number;
  completed: number;
};

/** UI displays "In Progress" (space); backend enum is "In_Progress" (underscore). */
export function statusToBackend(status: string) {
  return status.replace(/ /g, "_");
}

export function statusToUi(status: string) {
  return status.replace(/_/g, " ");
}

export async function listTasks(params?: { internId?: number; mentorId?: number }) {
  const { data } = await api.get<ApiResponse<TaskDto[]>>("/tasks", { params });
  return data.data;
}

export async function taskStats() {
  const { data } = await api.get<ApiResponse<TaskStatsDto>>("/tasks/stats");
  return data.data;
}

export async function createTask(payload: TaskPayload) {
  const { data } = await api.post<ApiResponse<TaskDto>>("/tasks", payload);
  return data.data;
}

export async function updateTask(id: number, payload: TaskPayload) {
  const { data } = await api.put<ApiResponse<TaskDto>>(`/tasks/${id}`, payload);
  return data.data;
}

export async function deleteTask(id: number) {
  await api.delete(`/tasks/${id}`);
}

export type TaskCommentDto = {
  id: number;
  authorId: number;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
};

export async function getTask(id: number) {
  const { data } = await api.get<ApiResponse<TaskDto>>(`/tasks/${id}`);
  return data.data;
}

export async function listComments(taskId: number) {
  const { data } = await api.get<ApiResponse<TaskCommentDto[]>>(`/tasks/${taskId}/comments`);
  return data.data;
}

export async function addComment(taskId: number, content: string) {
  const { data } = await api.post<ApiResponse<TaskCommentDto>>(`/tasks/${taskId}/comments`, { content });
  return data.data;
}

export async function editComment(taskId: number, commentId: number, content: string) {
  const { data } = await api.put<ApiResponse<TaskCommentDto>>(`/tasks/${taskId}/comments/${commentId}`, { content });
  return data.data;
}

export async function updateTaskWork(
  id: number,
  payload: { status?: string; progress?: number; description?: string; title?: string }
) {
  const { data } = await api.patch<ApiResponse<TaskDto>>(`/tasks/${id}/work`, payload);
  return data.data;
}
