import type { Mentor } from '../../types'
import type { mentorApi } from '../../services'

export function toUiMentor(dto: mentorApi.MentorDto): Mentor {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    department: dto.department ?? '',
    designation: dto.designation ?? '',
    status: (dto.status as 'Active' | 'Inactive') ?? 'Active',
  }
}
