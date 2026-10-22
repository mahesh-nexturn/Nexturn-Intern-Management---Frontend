import type { Intern, Mentor, Training as TrainingType } from '../../types'
import type * as trainingApi from '../../services/trainingApi'
import { statusToUi } from '../../services/trainingApi'

export function toUiTraining(
  dto: trainingApi.TrainingDto,
  interns: Intern[],
  mentors: Mentor[],
): TrainingType {
  return {
    id: dto.id,
    title: dto.title,
    assignedTo: dto.internName,
    internId: dto.internId,
    mentor:
      mentors.find((mentor) => mentor.id === dto.mentorId)?.name ??
      interns.find((intern) => intern.id === dto.internId)?.mentor ??
      '',
    mentorId: dto.mentorId,
    startDate: dto.startDate || '',
    endDate: dto.endDate || '',
    status: statusToUi(dto.status) as TrainingType['status'],
    progress: dto.progress,
  }
}
