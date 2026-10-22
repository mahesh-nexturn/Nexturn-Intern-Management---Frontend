import api from './api'
import type { ApiResponse } from './api'
import type { Hr } from '../types'
import type { MentorDto } from './mentorApi'
import type { InternDto } from './internApi'

export type HrPayload = {
  name: string
  email: string
  password?: string
}

export async function listHrs() {
  const { data } = await api.get<ApiResponse<Hr[]>>('/hr')
  return data.data
}

export async function getHr(id: number) {
  const { data } = await api.get<ApiResponse<Hr>>(`/hr/${id}`)
  return data.data
}

export async function createHr(payload: HrPayload) {
  const { data } = await api.post<ApiResponse<Hr>>('/hr', payload)
  return data.data
}

export async function updateHr(id: number, payload: HrPayload) {
  const { data } = await api.put<ApiResponse<Hr>>(`/hr/${id}`, payload)
  return data.data
}

export async function deleteHr(id: number) {
  await api.delete(`/hr/${id}`)
}

export async function listHrMentors(id: number) {
  const { data } = await api.get<ApiResponse<MentorDto[]>>(`/hr/${id}/mentors`)
  return data.data
}

export async function listHrInterns(id: number) {
  const { data } = await api.get<ApiResponse<InternDto[]>>(`/hr/${id}/interns`)
  return data.data
}

export async function assignMentors(id: number, ids: number[]) {
  const { data } = await api.put<ApiResponse<Hr>>(`/hr/${id}/mentors`, { ids })
  return data.data
}

export async function assignInterns(id: number, ids: number[]) {
  const { data } = await api.put<ApiResponse<Hr>>(`/hr/${id}/interns`, { ids })
  return data.data
}
