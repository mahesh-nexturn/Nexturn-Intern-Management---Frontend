import type { Evaluation } from '../../types/Evaluation'
import type { Intern } from '../../types/Intern'
import type * as evaluationApi from '../../services/evaluationApi'

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
    technicalRating: dto.technicalRating,
    communicationRating: dto.communicationRating,
    problemSolvingRating: dto.problemSolvingRating,
    overallRating: dto.overallRating,
    feedback: dto.feedback ?? '',
  }
}
