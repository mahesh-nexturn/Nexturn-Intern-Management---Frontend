import type { Meeting } from '../../types/Meeting'
import type { Intern } from '../../types/Intern'
import type { Mentor } from '../../types/Mentor'
import type * as meetingApi from '../../services/meetingApi'

export function toUiMeeting(
  dto: meetingApi.MeetingDto,
  interns: Intern[],
  mentors: Mentor[],
): Meeting {
  return {
    id: dto.id,
    title: dto.title,
    agenda: dto.agenda || '',
    mentor:
      mentors.find((mentor) => mentor.id === dto.mentorId)?.name ??
      interns.find((intern) => intern.id === dto.internId)?.mentor ??
      '',
    mentorId: dto.mentorId,
    intern: dto.internName || '',
    internId: dto.internId,
    date: dto.meetingDate || '',
    time: dto.meetingTime ? dto.meetingTime.slice(0, 5) : '',
    status: dto.status as Meeting['status'],
  }
}
