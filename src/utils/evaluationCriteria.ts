export const EVALUATION_CRITERIA = [
  { key: 'requirementUnderstanding', label: 'Requirement Understanding' },
  { key: 'technicalKnowledge', label: 'Technical Knowledge and Approach' },
  { key: 'workQuality', label: 'Work Quality' },
  { key: 'taskCompletion', label: 'Task Completion' },
  { key: 'taskDemonstration', label: 'Task Demonstration' },
] as const

export type CriterionKey = (typeof EVALUATION_CRITERIA)[number]['key']

export type CriteriaRatings = Record<CriterionKey, number>

export const EMPTY_RATINGS: CriteriaRatings = {
  requirementUnderstanding: 0,
  technicalKnowledge: 0,
  workQuality: 0,
  taskCompletion: 0,
  taskDemonstration: 0,
}

export function overallFromRatings(ratings: CriteriaRatings) {
  const total = EVALUATION_CRITERIA.reduce((sum, c) => sum + ratings[c.key], 0)
  return Math.round(total / EVALUATION_CRITERIA.length)
}

export function allRated(ratings: CriteriaRatings) {
  return EVALUATION_CRITERIA.every((c) => ratings[c.key] >= 1)
}
