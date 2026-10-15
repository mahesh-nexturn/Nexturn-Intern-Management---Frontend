import type { Document } from '../../types/Document'
import type * as documentApi from '../../services/documentApi'

export function toUiDocument(dto: documentApi.DocumentDto): Document {
  return {
    id: dto.id,
    fileName: dto.fileName,
    fileUrl: dto.fileUrl,
    documentType: dto.documentType as Document['documentType'],
    uploadedBy: dto.uploadedByName,
    uploadedByUserId: dto.uploadedByUserId,
    uploadDate: dto.uploadDate ? dto.uploadDate.replace('T', ' ').slice(0, 16) : '',
  }
}
