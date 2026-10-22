import { hrApi, internApi, mentorApi } from '../../services'
import { baseApi, run } from '../baseApi'

// Mentor/intern/HR changes ripple into names shown on almost every other resource.
const PEOPLE_TAGS = [
  'Mentor',
  'Intern',
  'Hr',
  'Task',
  'Attendance',
  'Meeting',
  'Training',
  'Evaluation',
  'Certificate',
  'Ppo',
  'Report',
] as const

const peopleApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listMentors: build.query<mentorApi.MentorDto[], void>({
      queryFn: () => run(() => mentorApi.listMentors()),
      providesTags: ['Mentor'],
    }),
    createMentor: build.mutation<mentorApi.MentorDto, mentorApi.MentorPayload>({
      queryFn: (payload) => run(() => mentorApi.createMentor(payload)),
      invalidatesTags: [...PEOPLE_TAGS],
    }),
    updateMentor: build.mutation<
      mentorApi.MentorDto,
      { id: number; payload: mentorApi.MentorPayload }
    >({
      queryFn: ({ id, payload }) => run(() => mentorApi.updateMentor(id, payload)),
      invalidatesTags: [...PEOPLE_TAGS],
    }),
    deleteMentor: build.mutation<void, number>({
      queryFn: (id) => run(() => mentorApi.deleteMentor(id)),
      invalidatesTags: [...PEOPLE_TAGS],
    }),

    listInterns: build.query<internApi.InternDto[], void>({
      queryFn: () => run(() => internApi.listInterns()),
      providesTags: ['Intern'],
    }),
    createIntern: build.mutation<internApi.InternDto, internApi.InternPayload>({
      queryFn: (payload) => run(() => internApi.createIntern(payload)),
      invalidatesTags: [...PEOPLE_TAGS],
    }),
    updateIntern: build.mutation<
      internApi.InternDto,
      { id: number; payload: internApi.InternPayload }
    >({
      queryFn: ({ id, payload }) => run(() => internApi.updateIntern(id, payload)),
      invalidatesTags: [...PEOPLE_TAGS],
    }),
    deleteIntern: build.mutation<void, number>({
      queryFn: (id) => run(() => internApi.deleteIntern(id)),
      invalidatesTags: [...PEOPLE_TAGS],
    }),

    listHrs: build.query<Awaited<ReturnType<typeof hrApi.listHrs>>, void>({
      queryFn: () => run(() => hrApi.listHrs()),
      providesTags: ['Hr'],
    }),
    createHr: build.mutation<
      Awaited<ReturnType<typeof hrApi.createHr>>,
      Parameters<typeof hrApi.createHr>[0]
    >({
      queryFn: (payload) => run(() => hrApi.createHr(payload)),
      invalidatesTags: ['Hr'],
    }),
    updateHr: build.mutation<
      Awaited<ReturnType<typeof hrApi.updateHr>>,
      { id: number; payload: Parameters<typeof hrApi.updateHr>[1] }
    >({
      queryFn: ({ id, payload }) => run(() => hrApi.updateHr(id, payload)),
      invalidatesTags: ['Hr'],
    }),
    deleteHr: build.mutation<void, number>({
      queryFn: (id) => run(() => hrApi.deleteHr(id)),
      invalidatesTags: [...PEOPLE_TAGS],
    }),
    listHrMentors: build.query<mentorApi.MentorDto[], number>({
      queryFn: (id) => run(() => hrApi.listHrMentors(id)),
      providesTags: ['Hr', 'Mentor'],
    }),
    listHrInterns: build.query<internApi.InternDto[], number>({
      queryFn: (id) => run(() => hrApi.listHrInterns(id)),
      providesTags: ['Hr', 'Intern'],
    }),
    assignHrMentors: build.mutation<unknown, { id: number; ids: number[] }>({
      queryFn: ({ id, ids }) => run(() => hrApi.assignMentors(id, ids)),
      invalidatesTags: [...PEOPLE_TAGS],
    }),
    assignHrInterns: build.mutation<unknown, { id: number; ids: number[] }>({
      queryFn: ({ id, ids }) => run(() => hrApi.assignInterns(id, ids)),
      invalidatesTags: [...PEOPLE_TAGS],
    }),
  }),
})

export const {
  useListMentorsQuery,
  useCreateMentorMutation,
  useUpdateMentorMutation,
  useDeleteMentorMutation,
  useListInternsQuery,
  useCreateInternMutation,
  useUpdateInternMutation,
  useDeleteInternMutation,
  useListHrsQuery,
  useCreateHrMutation,
  useUpdateHrMutation,
  useDeleteHrMutation,
  useListHrMentorsQuery,
  useListHrInternsQuery,
  useAssignHrMentorsMutation,
  useAssignHrInternsMutation,
} = peopleApi
