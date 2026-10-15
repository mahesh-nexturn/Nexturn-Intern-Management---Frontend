import type { Notification } from '../../types/Notification'
import type * as notificationApi from '../../services/notificationApi'

function formatDate(value?: string | null) {
  return value ? value.split('T')[0] : ''
}

function userLabelForId(userId?: number | null) {
  const currentUserId = Number(sessionStorage.getItem('userId') || '0')
  const currentUserName = sessionStorage.getItem('name') || ''

  if (userId && userId === currentUserId && currentUserName) {
    return currentUserName
  }

  return userId ? `User #${userId}` : ''
}

export function toUiNotification(dto: notificationApi.NotificationDto): Notification {
  return {
    id: dto.id,
    title: dto.title,
    message: dto.message,
    recipient: dto.recipient as Notification['recipient'],
    createdBy: dto.createdByName || userLabelForId(dto.createdByUserId),
    createdByUserId: dto.createdByUserId,
    date: formatDate(dto.notificationDate),
    status: dto.status as Notification['status'],
    link: dto.link ?? null,
  }
}
