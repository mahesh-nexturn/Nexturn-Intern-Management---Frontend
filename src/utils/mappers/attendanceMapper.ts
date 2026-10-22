import type { Attendance as AttendanceType, Intern, Mentor } from '../../types'
import type { attendanceApi } from '../../services'

export function toUiAttendance(
  dto: attendanceApi.AttendanceDto,
  interns: Intern[],
  mentors: Mentor[],
): AttendanceType {
  return {
    id: dto.id,
    intern: dto.internName,
    internId: dto.internId,
    mentor:
      mentors.find((mentor) => mentor.id === dto.mentorId)?.name ??
      interns.find((intern) => intern.id === dto.internId)?.mentor ??
      '',
    mentorId: dto.mentorId,
    date: dto.date,
    checkInTime: dto.checkInTime ?? null,
    checkOutTime: dto.checkOutTime ?? null,
    workedSeconds: dto.workedSeconds ?? 0,
    status: dto.status as AttendanceType['status'],
  }
}
