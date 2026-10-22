import {
  announcementApi,
  certificateApi,
  documentApi,
  feedbackApi,
  notificationApi,
  ppoApi,
  reportApi,
  settingsApi,
} from '../../services'
import { baseApi, run } from '../baseApi'

type InternMentorFilter = { internId?: number; mentorId?: number } | void

const contentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Announcements
    listAnnouncements: build.query<announcementApi.AnnouncementDto[], void>({
      queryFn: () => run(() => announcementApi.listAnnouncements()),
      providesTags: ['Announcement'],
    }),
    createAnnouncement: build.mutation<
      announcementApi.AnnouncementDto,
      announcementApi.AnnouncementPayload
    >({
      queryFn: (payload) => run(() => announcementApi.createAnnouncement(payload)),
      invalidatesTags: ['Announcement'],
    }),
    updateAnnouncement: build.mutation<
      announcementApi.AnnouncementDto,
      { id: number; payload: announcementApi.AnnouncementPayload }
    >({
      queryFn: ({ id, payload }) => run(() => announcementApi.updateAnnouncement(id, payload)),
      invalidatesTags: ['Announcement'],
    }),
    deleteAnnouncement: build.mutation<void, number>({
      queryFn: (id) => run(() => announcementApi.deleteAnnouncement(id)),
      invalidatesTags: ['Announcement'],
    }),

    // Certificates
    listCertificates: build.query<certificateApi.CertificateDto[], InternMentorFilter>({
      queryFn: (params) => run(() => certificateApi.listCertificates(params ?? undefined)),
      providesTags: ['Certificate'],
    }),
    createCertificate: build.mutation<
      certificateApi.CertificateDto,
      certificateApi.CertificatePayload
    >({
      queryFn: (payload) => run(() => certificateApi.createCertificate(payload)),
      invalidatesTags: ['Certificate'],
    }),
    updateCertificate: build.mutation<
      certificateApi.CertificateDto,
      { id: number; payload: certificateApi.CertificatePayload }
    >({
      queryFn: ({ id, payload }) => run(() => certificateApi.updateCertificate(id, payload)),
      invalidatesTags: ['Certificate'],
    }),
    deleteCertificate: build.mutation<void, number>({
      queryFn: (id) => run(() => certificateApi.deleteCertificate(id)),
      invalidatesTags: ['Certificate'],
    }),

    // Documents (downloads stay on documentApi: binary blobs don't belong in the store)
    listDocuments: build.query<documentApi.DocumentDto[], { userId?: number } | void>({
      queryFn: (params) => run(() => documentApi.listDocuments(params ?? undefined)),
      providesTags: ['Document'],
    }),
    uploadDocument: build.mutation<documentApi.DocumentDto, documentApi.DocumentUploadPayload>({
      queryFn: (payload) => run(() => documentApi.uploadDocument(payload)),
      invalidatesTags: ['Document'],
    }),
    deleteDocument: build.mutation<void, number>({
      queryFn: (id) => run(() => documentApi.deleteDocument(id)),
      invalidatesTags: ['Document'],
    }),

    // Notifications
    listNotifications: build.query<notificationApi.NotificationDto[], void>({
      queryFn: () => run(() => notificationApi.listNotifications()),
      providesTags: ['Notification'],
    }),
    createNotification: build.mutation<
      notificationApi.NotificationDto,
      notificationApi.NotificationPayload
    >({
      queryFn: (payload) => run(() => notificationApi.createNotification(payload)),
      invalidatesTags: ['Notification'],
    }),
    updateNotification: build.mutation<
      notificationApi.NotificationDto,
      { id: number; payload: notificationApi.NotificationPayload }
    >({
      queryFn: ({ id, payload }) => run(() => notificationApi.updateNotification(id, payload)),
      invalidatesTags: ['Notification'],
    }),
    markNotificationRead: build.mutation<notificationApi.NotificationDto, number>({
      queryFn: (id) => run(() => notificationApi.markNotificationRead(id)),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: build.mutation<void, number>({
      queryFn: (id) => run(() => notificationApi.deleteNotification(id)),
      invalidatesTags: ['Notification'],
    }),

    // PPO
    listPpo: build.query<ppoApi.PpoDto[], { mentorId?: number } | void>({
      queryFn: (params) => run(() => ppoApi.listPpo(params ?? undefined)),
      providesTags: ['Ppo'],
    }),
    getMyPpo: build.query<ppoApi.PpoDto, void>({
      queryFn: () => run(() => ppoApi.getMyPpo()),
      providesTags: ['Ppo'],
    }),
    createPpo: build.mutation<ppoApi.PpoDto, ppoApi.PpoPayload>({
      queryFn: (payload) => run(() => ppoApi.createPpo(payload)),
      invalidatesTags: ['Ppo'],
    }),
    updatePpo: build.mutation<ppoApi.PpoDto, { id: number; payload: ppoApi.PpoPayload }>({
      queryFn: ({ id, payload }) => run(() => ppoApi.updatePpo(id, payload)),
      invalidatesTags: ['Ppo'],
    }),
    deletePpo: build.mutation<void, number>({
      queryFn: (id) => run(() => ppoApi.deletePpo(id)),
      invalidatesTags: ['Ppo'],
    }),

    // Reports
    listReports: build.query<reportApi.InternReportDto[], void>({
      queryFn: () => run(() => reportApi.listReports()),
      providesTags: ['Report'],
    }),
    exportReportsExcel: build.mutation<void, void>({
      queryFn: () => run(() => reportApi.exportReportsExcel()),
    }),

    // Feedback
    listAllFeedback: build.query<feedbackApi.FeedbackDto[], void>({
      queryFn: () => run(() => feedbackApi.listAllFeedback()),
      providesTags: ['Feedback'],
    }),
    listMyFeedback: build.query<feedbackApi.FeedbackDto[], void>({
      queryFn: () => run(() => feedbackApi.listMyFeedback()),
      providesTags: ['Feedback'],
    }),
    createFeedback: build.mutation<feedbackApi.FeedbackDto, feedbackApi.FeedbackPayload>({
      queryFn: (payload) => run(() => feedbackApi.createFeedback(payload)),
      invalidatesTags: ['Feedback'],
    }),
    deleteFeedback: build.mutation<void, number>({
      queryFn: (id) => run(() => feedbackApi.deleteFeedback(id)),
      invalidatesTags: ['Feedback'],
    }),

    // Settings
    getMySettings: build.query<settingsApi.SettingsDto, void>({
      queryFn: () => run(() => settingsApi.getMySettings()),
      providesTags: ['Settings'],
    }),
    updateMySettings: build.mutation<settingsApi.SettingsDto, settingsApi.SettingsPayload>({
      queryFn: (payload) => run(() => settingsApi.updateMySettings(payload)),
      invalidatesTags: ['Settings'],
    }),
  }),
})

export const {
  useListAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useListCertificatesQuery,
  useCreateCertificateMutation,
  useUpdateCertificateMutation,
  useDeleteCertificateMutation,
  useListDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
  useListNotificationsQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useMarkNotificationReadMutation,
  useDeleteNotificationMutation,
  useListPpoQuery,
  useGetMyPpoQuery,
  useCreatePpoMutation,
  useUpdatePpoMutation,
  useDeletePpoMutation,
  useListReportsQuery,
  useExportReportsExcelMutation,
  useListAllFeedbackQuery,
  useListMyFeedbackQuery,
  useCreateFeedbackMutation,
  useDeleteFeedbackMutation,
  useGetMySettingsQuery,
  useUpdateMySettingsMutation,
} = contentApi
