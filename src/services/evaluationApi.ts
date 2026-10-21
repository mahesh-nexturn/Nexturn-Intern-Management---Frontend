import api from './api'
import type { ApiResponse } from './api'

export type EvaluationDto = {
  id: number
  internId: number
  internName: string
  mentorId: number | null
  taskId: number | null
  requirementUnderstanding: number | null
  technicalKnowledge: number | null
  workQuality: number | null
  taskCompletion: number | null
  taskDemonstration: number | null
  overallRating: number
  feedback: string | null
}

export type EvaluationPayload = {
  internId: number
  mentorId?: number | null
  taskId?: number | null
  requirementUnderstanding: number
  technicalKnowledge: number
  workQuality: number
  taskCompletion: number
  taskDemonstration: number
  feedback?: string
}

export async function listEvaluations(params?: { internId?: number; mentorId?: number }) {
  const { data } = await api.get<ApiResponse<EvaluationDto[]>>('/evaluations', { params })
  return data.data
}

export async function createEvaluation(payload: EvaluationPayload) {
  const { data } = await api.post<ApiResponse<EvaluationDto>>('/evaluations', payload)
  return data.data
}

export async function updateEvaluation(id: number, payload: EvaluationPayload) {
  const { data } = await api.put<ApiResponse<EvaluationDto>>(`/evaluations/${id}`, payload)
  return data.data
}

export async function deleteEvaluation(id: number) {
  await api.delete(`/evaluations/${id}`)
}
