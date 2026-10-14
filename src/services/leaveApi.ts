import api from "./api";
import type { ApiResponse } from "./api";

export type LeaveDto = {
  id: number;
  internId: number;
  internName: string;
  hrId: number | null;
  hrName: string | null;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  teamEmail: string | null;
  reason: string | null;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  decidedAt: string | null;
};

export type LeavePayload = {
  leaveType: string;
  fromDate: string;
  toDate: string;
  teamEmail?: string;
  reason?: string;
};

export async function listLeaves() {
  const { data } = await api.get<ApiResponse<LeaveDto[]>>("/leaves");
  return data.data;
}

export async function applyLeave(payload: LeavePayload) {
  const { data } = await api.post<ApiResponse<LeaveDto>>("/leaves", payload);
  return data.data;
}

export async function approveLeave(id: number) {
  const { data } = await api.put<ApiResponse<LeaveDto>>(`/leaves/${id}/approve`);
  return data.data;
}

export async function rejectLeave(id: number) {
  const { data } = await api.put<ApiResponse<LeaveDto>>(`/leaves/${id}/reject`);
  return data.data;
}
