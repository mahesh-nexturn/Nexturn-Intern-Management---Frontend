export type Evaluation = {
  id: number
  intern: string
  internId?: number | null
  mentor: string
  mentorId?: number | null
  taskId?: number | null
  requirementUnderstanding: number
  technicalKnowledge: number
  workQuality: number
  taskCompletion: number
  taskDemonstration: number
  overallRating: number
  feedback: string
}
