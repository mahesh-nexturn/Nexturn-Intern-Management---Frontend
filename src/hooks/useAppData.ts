import { useMemo } from 'react'

import {
  useListAttendanceQuery,
  useListDocumentsQuery,
  useListEvaluationsQuery,
  useListInternsQuery,
  useListMeetingsQuery,
  useListMentorsQuery,
  useListNotificationsQuery,
  useListTasksQuery,
  useListTrainingsQuery,
} from '../store'
import {
  toUiAttendance,
  toUiDocument,
  toUiEvaluation,
  toUiIntern,
  toUiMeeting,
  toUiMentor,
  toUiNotification,
  toUiTask,
  toUiTraining,
} from '../utils'

// Each hook subscribes to its RTK Query endpoint (fetched on first use, then served
// from cache) and maps the DTOs to UI models. Cross-resource names come from the
// interns/mentors caches, so mutations that invalidate those refresh these too.

const EMPTY: never[] = []

export function useMentors() {
  const { data, isLoading } = useListMentorsQuery()
  const mentors = useMemo(() => data?.map(toUiMentor) ?? EMPTY, [data])
  return { mentors, isLoading }
}

export function useInterns() {
  const { data, isLoading } = useListInternsQuery()
  const interns = useMemo(() => data?.map(toUiIntern) ?? EMPTY, [data])
  return { interns, isLoading }
}

export function useTasks() {
  const { interns } = useInterns()
  const { data, isLoading } = useListTasksQuery()
  const tasks = useMemo(() => data?.map((dto) => toUiTask(dto, interns)) ?? EMPTY, [data, interns])
  return { tasks, isLoading }
}

export function useAttendance() {
  const { interns } = useInterns()
  const { mentors } = useMentors()
  const { data, isLoading } = useListAttendanceQuery()
  const attendance = useMemo(
    () => data?.map((dto) => toUiAttendance(dto, interns, mentors)) ?? EMPTY,
    [data, interns, mentors],
  )
  return { attendance, isLoading }
}

export function useMeetings() {
  const { interns } = useInterns()
  const { mentors } = useMentors()
  const { data, isLoading } = useListMeetingsQuery()
  const meetings = useMemo(
    () => data?.map((dto) => toUiMeeting(dto, interns, mentors)) ?? EMPTY,
    [data, interns, mentors],
  )
  return { meetings, isLoading }
}

export function useTrainings() {
  const { interns } = useInterns()
  const { mentors } = useMentors()
  const { data, isLoading } = useListTrainingsQuery()
  const trainings = useMemo(
    () => data?.map((dto) => toUiTraining(dto, interns, mentors)) ?? EMPTY,
    [data, interns, mentors],
  )
  return { trainings, isLoading }
}

export function useEvaluations() {
  const { interns } = useInterns()
  const { data, isLoading } = useListEvaluationsQuery()
  const evaluations = useMemo(
    () => data?.map((dto) => toUiEvaluation(dto, interns)) ?? EMPTY,
    [data, interns],
  )
  return { evaluations, isLoading }
}

export function useDocuments() {
  const { data, isLoading } = useListDocumentsQuery()
  const documents = useMemo(() => data?.map(toUiDocument) ?? EMPTY, [data])
  return { documents, isLoading }
}

export function useNotifications() {
  const { data, isLoading } = useListNotificationsQuery()
  const notifications = useMemo(() => data?.map(toUiNotification) ?? EMPTY, [data])
  return { notifications, isLoading }
}
