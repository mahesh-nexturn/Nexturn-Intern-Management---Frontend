import type { Evaluation, Intern } from '../../types'
import type { evaluationApi } from '../../services'

export function toUiEvaluation(
  dto: evaluationApi.EvaluationDto,
  interns: Intern[] = [],
): Evaluation {
  const intern = interns.find((item) => item.id === dto.internId)

  return {
    id: dto.id,
    intern: dto.internName,
    internId: dto.internId,
    mentor: intern?.mentor ?? '',
    mentorId: dto.mentorId ?? intern?.mentorId ?? null,
    taskId: dto.taskId,
    requirementUnderstanding: dto.requirementUnderstanding ?? 0,
    technicalKnowledge: dto.technicalKnowledge ?? 0,
    workQuality: dto.workQuality ?? 0,
    taskCompletion: dto.taskCompletion ?? 0,
    taskDemonstration: dto.taskDemonstration ?? 0,
    overallRating: dto.overallRating,
    feedback: dto.feedback ?? '',
  }
}
