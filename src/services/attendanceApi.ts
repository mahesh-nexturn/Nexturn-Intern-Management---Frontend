import api from './api'
import type { ApiResponse } from './api'

export type AttendanceDto = {
  id: number
  internId: number
  internName: string
  mentorId: number | null
  date: string
  status: string
  checkInTime?: string | null
  checkOutTime?: string | null
  workedSeconds?: number
}

export type TodayAttendanceDto = {
  record: AttendanceDto | null
  serverTime: string
  requiredSeconds: number
}

export type AttendancePayload = {
  internId: number
  mentorId?: number | null
  attendanceDate: string
  status: string
}

export async function listAttendance(params?: {
  internId?: number
  from?: string
  to?: string
  status?: string
}) {
  const { data } = await api.get<ApiResponse<AttendanceDto[]>>('/attendance', { params })
  return data.data
}

export async function createAttendance(payload: AttendancePayload) {
  const { data } = await api.post<ApiResponse<AttendanceDto>>('/attendance', payload)
  return data.data
}

export async function updateAttendance(id: number, payload: AttendancePayload) {
  const { data } = await api.put<ApiResponse<AttendanceDto>>(`/attendance/${id}`, payload)
  return data.data
}

export async function deleteAttendance(id: number) {
  await api.delete(`/attendance/${id}`)
}

export async function getToday() {
  const { data } = await api.get<ApiResponse<TodayAttendanceDto>>('/attendance/today')
  return data.data
}

export async function checkIn() {
  const { data } = await api.post<ApiResponse<TodayAttendanceDto>>('/attendance/check-in')
  return data.data
}

export async function checkOut() {
  const { data } = await api.post<ApiResponse<TodayAttendanceDto>>('/attendance/check-out')
  return data.data
}
