import type { Intern } from '../../types'
import type { internApi } from '../../services'

export function toUiIntern(dto: internApi.InternDto): Intern {
  const expired =
    !!dto.endDate &&
    dto.endDate.slice(0, 10) < new Date().toLocaleDateString('sv-SE') &&
    (dto.status ?? 'Active') === 'Active'

  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    department: dto.department ?? '',
    mentor: dto.mentorName ?? '',
    mentorId: dto.mentorId,
    status: expired ? 'Completed' : (dto.status ?? 'Active'),
    endDate: dto.endDate ? dto.endDate.slice(0, 10) : null,
    userId: dto.userId,
    createTime: dto.createTime,
    updateTime: dto.updateTime,
  }
}
