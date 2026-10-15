import type { Task } from '../../types/Task'
import type { Intern } from '../../types/Intern'
import type * as taskApi from '../../services/taskApi'
import { statusToUi } from '../../services/taskApi'

export function toUiTask(dto: taskApi.TaskDto, interns: Intern[] = []): Task {
  const intern = interns.find((item) => item.id === dto.internId)

  return {
    id: dto.id,
    title: dto.title,
    description: dto.description || '',
    assignedTo: dto.internName || '',
    internId: dto.internId,
    mentor: intern?.mentor ?? '',
    mentorId: dto.mentorId ?? intern?.mentorId ?? null,
    priority: dto.priority as Task['priority'],
    dueDate: dto.dueDate || '',
    status: statusToUi(dto.status) as Task['status'],
    progress: dto.progress,
  }
}
