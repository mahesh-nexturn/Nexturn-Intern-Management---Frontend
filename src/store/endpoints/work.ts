import {
  attendanceApi,
  evaluationApi,
  leaveApi,
  meetingApi,
  taskApi,
  trainingApi,
} from '../../services'
import { baseApi, run } from '../baseApi'

type InternMentorFilter = { internId?: number; mentorId?: number } | void
type AttendanceFilter = Parameters<typeof attendanceApi.listAttendance>[0] | void

const workApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Tasks
    listTasks: build.query<taskApi.TaskDto[], InternMentorFilter>({
      queryFn: (params) => run(() => taskApi.listTasks(params ?? undefined)),
      providesTags: ['Task'],
    }),
    getTask: build.query<taskApi.TaskDto, number>({
      queryFn: (id) => run(() => taskApi.getTask(id)),
      providesTags: ['Task'],
    }),
    createTask: build.mutation<taskApi.TaskDto, taskApi.TaskPayload>({
      queryFn: (payload) => run(() => taskApi.createTask(payload)),
      invalidatesTags: ['Task', 'Report'],
    }),
    updateTask: build.mutation<taskApi.TaskDto, { id: number; payload: taskApi.TaskPayload }>({
      queryFn: ({ id, payload }) => run(() => taskApi.updateTask(id, payload)),
      invalidatesTags: ['Task', 'Report'],
    }),
    updateTaskWork: build.mutation<
      taskApi.TaskDto,
      { id: number; payload: Parameters<typeof taskApi.updateTaskWork>[1] }
    >({
      queryFn: ({ id, payload }) => run(() => taskApi.updateTaskWork(id, payload)),
      invalidatesTags: ['Task', 'Report'],
    }),
    deleteTask: build.mutation<void, number>({
      queryFn: (id) => run(() => taskApi.deleteTask(id)),
      invalidatesTags: ['Task', 'Report'],
    }),
    listTaskComments: build.query<taskApi.TaskCommentDto[], number>({
      queryFn: (taskId) => run(() => taskApi.listComments(taskId)),
      providesTags: ['Task'],
    }),
    addTaskComment: build.mutation<taskApi.TaskCommentDto, { taskId: number; content: string }>({
      queryFn: ({ taskId, content }) => run(() => taskApi.addComment(taskId, content)),
      invalidatesTags: ['Task'],
    }),
    editTaskComment: build.mutation<
      taskApi.TaskCommentDto,
      { taskId: number; commentId: number; content: string }
    >({
      queryFn: ({ taskId, commentId, content }) =>
        run(() => taskApi.editComment(taskId, commentId, content)),
      invalidatesTags: ['Task'],
    }),

    // Evaluations
    listEvaluations: build.query<evaluationApi.EvaluationDto[], InternMentorFilter>({
      queryFn: (params) => run(() => evaluationApi.listEvaluations(params ?? undefined)),
      providesTags: ['Evaluation'],
    }),
    createEvaluation: build.mutation<evaluationApi.EvaluationDto, evaluationApi.EvaluationPayload>({
      queryFn: (payload) => run(() => evaluationApi.createEvaluation(payload)),
      invalidatesTags: ['Evaluation', 'Report'],
    }),
    updateEvaluation: build.mutation<
      evaluationApi.EvaluationDto,
      { id: number; payload: evaluationApi.EvaluationPayload }
    >({
      queryFn: ({ id, payload }) => run(() => evaluationApi.updateEvaluation(id, payload)),
      invalidatesTags: ['Evaluation', 'Report'],
    }),
    deleteEvaluation: build.mutation<void, number>({
      queryFn: (id) => run(() => evaluationApi.deleteEvaluation(id)),
      invalidatesTags: ['Evaluation', 'Report'],
    }),

    // Trainings
    listTrainings: build.query<trainingApi.TrainingDto[], InternMentorFilter>({
      queryFn: (params) => run(() => trainingApi.listTrainings(params ?? undefined)),
      providesTags: ['Training'],
    }),
    createTraining: build.mutation<trainingApi.TrainingDto, trainingApi.TrainingPayload>({
      queryFn: (payload) => run(() => trainingApi.createTraining(payload)),
      invalidatesTags: ['Training', 'Report'],
    }),
    updateTraining: build.mutation<
      trainingApi.TrainingDto,
      { id: number; payload: trainingApi.TrainingPayload }
    >({
      queryFn: ({ id, payload }) => run(() => trainingApi.updateTraining(id, payload)),
      invalidatesTags: ['Training', 'Report'],
    }),
    deleteTraining: build.mutation<void, number>({
      queryFn: (id) => run(() => trainingApi.deleteTraining(id)),
      invalidatesTags: ['Training', 'Report'],
    }),

    // Meetings
    listMeetings: build.query<meetingApi.MeetingDto[], InternMentorFilter>({
      queryFn: (params) => run(() => meetingApi.listMeetings(params ?? undefined)),
      providesTags: ['Meeting'],
    }),
    createMeeting: build.mutation<meetingApi.MeetingDto, meetingApi.MeetingPayload>({
      queryFn: (payload) => run(() => meetingApi.createMeeting(payload)),
      invalidatesTags: ['Meeting'],
    }),
    updateMeeting: build.mutation<
      meetingApi.MeetingDto,
      { id: number; payload: meetingApi.MeetingPayload }
    >({
      queryFn: ({ id, payload }) => run(() => meetingApi.updateMeeting(id, payload)),
      invalidatesTags: ['Meeting'],
    }),
    deleteMeeting: build.mutation<void, number>({
      queryFn: (id) => run(() => meetingApi.deleteMeeting(id)),
      invalidatesTags: ['Meeting'],
    }),

    // Attendance
    listAttendance: build.query<attendanceApi.AttendanceDto[], AttendanceFilter>({
      queryFn: (params) => run(() => attendanceApi.listAttendance(params ?? undefined)),
      providesTags: ['Attendance'],
    }),
    createAttendance: build.mutation<attendanceApi.AttendanceDto, attendanceApi.AttendancePayload>({
      queryFn: (payload) => run(() => attendanceApi.createAttendance(payload)),
      invalidatesTags: ['Attendance', 'TodayAttendance', 'Report'],
    }),
    updateAttendance: build.mutation<
      attendanceApi.AttendanceDto,
      { id: number; payload: attendanceApi.AttendancePayload }
    >({
      queryFn: ({ id, payload }) => run(() => attendanceApi.updateAttendance(id, payload)),
      invalidatesTags: ['Attendance', 'TodayAttendance', 'Report'],
    }),
    deleteAttendance: build.mutation<void, number>({
      queryFn: (id) => run(() => attendanceApi.deleteAttendance(id)),
      invalidatesTags: ['Attendance', 'TodayAttendance', 'Report'],
    }),
    getTodayAttendance: build.query<attendanceApi.TodayAttendanceDto, void>({
      queryFn: () => run(() => attendanceApi.getToday()),
      providesTags: ['TodayAttendance'],
    }),
    checkIn: build.mutation<attendanceApi.TodayAttendanceDto, void>({
      queryFn: () => run(() => attendanceApi.checkIn()),
      invalidatesTags: ['Attendance', 'TodayAttendance', 'Report'],
    }),
    checkOut: build.mutation<attendanceApi.TodayAttendanceDto, void>({
      queryFn: () => run(() => attendanceApi.checkOut()),
      invalidatesTags: ['Attendance', 'TodayAttendance', 'Report'],
    }),

    // Leaves
    listLeaves: build.query<leaveApi.LeaveDto[], void>({
      queryFn: () => run(() => leaveApi.listLeaves()),
      providesTags: ['Leave'],
    }),
    applyLeave: build.mutation<leaveApi.LeaveDto, leaveApi.LeavePayload>({
      queryFn: (payload) => run(() => leaveApi.applyLeave(payload)),
      invalidatesTags: ['Leave'],
    }),
    approveLeave: build.mutation<leaveApi.LeaveDto, number>({
      queryFn: (id) => run(() => leaveApi.approveLeave(id)),
      invalidatesTags: ['Leave', 'Attendance'],
    }),
    rejectLeave: build.mutation<leaveApi.LeaveDto, number>({
      queryFn: (id) => run(() => leaveApi.rejectLeave(id)),
      invalidatesTags: ['Leave'],
    }),
  }),
})

export const {
  useListTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskWorkMutation,
  useDeleteTaskMutation,
  useListTaskCommentsQuery,
  useAddTaskCommentMutation,
  useEditTaskCommentMutation,
  useListEvaluationsQuery,
  useCreateEvaluationMutation,
  useUpdateEvaluationMutation,
  useDeleteEvaluationMutation,
  useListTrainingsQuery,
  useCreateTrainingMutation,
  useUpdateTrainingMutation,
  useDeleteTrainingMutation,
  useListMeetingsQuery,
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useDeleteMeetingMutation,
  useListAttendanceQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetTodayAttendanceQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useListLeavesQuery,
  useApplyLeaveMutation,
  useApproveLeaveMutation,
  useRejectLeaveMutation,
} = workApi
