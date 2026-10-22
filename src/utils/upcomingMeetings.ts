import type { Meeting } from '../types'

function meetingTimestamp(meeting: Pick<Meeting, 'date' | 'time'>) {
  return new Date(`${meeting.date}T${(meeting.time || '00:00').slice(0, 5)}`).getTime()
}

// Scheduled meetings whose date+time is still in the future, soonest first.
export function getUpcomingMeetings(meetings: Meeting[], now = Date.now()) {
  return meetings
    .filter((m) => m.status === 'Scheduled' && meetingTimestamp(m) > now)
    .sort((a, b) => meetingTimestamp(a) - meetingTimestamp(b))
}
