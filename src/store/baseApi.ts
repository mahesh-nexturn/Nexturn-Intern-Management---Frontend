import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { isAxiosError } from 'axios'

export type ApiError = {
  status?: number
  message: string
}

type RunResult<T> = { data: T; error?: undefined } | { error: ApiError; data?: undefined }

export function toApiError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    const body = error.response?.data as { message?: string } | undefined
    return { status: error.response?.status, message: body?.message ?? error.message }
  }
  return { message: error instanceof Error ? error.message : 'Unexpected error' }
}

// Endpoints delegate to the existing axios services so token refresh, the global
// loader and multipart handling keep working; RTK Query owns caching and invalidation.
export async function run<T>(request: () => Promise<T>): Promise<RunResult<T>> {
  try {
    return { data: await request() }
  } catch (error) {
    return { error: toApiError(error) }
  }
}

export const tagTypes = [
  'Announcement',
  'Attendance',
  'Certificate',
  'Document',
  'Evaluation',
  'Feedback',
  'Hr',
  'Intern',
  'Leave',
  'Meeting',
  'Mentor',
  'Notification',
  'Ppo',
  'Report',
  'Settings',
  'Task',
  'Training',
  'TodayAttendance',
] as const

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes,
  endpoints: () => ({}),
})
