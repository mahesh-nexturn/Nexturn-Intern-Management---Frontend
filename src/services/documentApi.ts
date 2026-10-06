import api from "./api";
import type { ApiResponse } from "./api";

export type DocumentDto = {
  id: number;
  fileName: string;
  fileUrl: string;
  documentType: string;
  uploadedByUserId: number;
  uploadedByName: string;
  uploadDate: string;
};

export type DocumentUploadPayload = {
  file: File;
  documentType: string;
};

export async function listDocuments(params?: { userId?: number }) {
  const { data } = await api.get<ApiResponse<DocumentDto[]>>("/documents", { params });
  return data.data;
}

export async function uploadDocument(payload: DocumentUploadPayload) {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("documentType", payload.documentType);

  const { data } = await api.post<ApiResponse<DocumentDto>>("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data.data;
}

export async function downloadDocument(id: number) {
  const response = await api.get<Blob>(`/documents/${id}/download`, {
    responseType: "blob",
  });
  return response.data;
}

export async function deleteDocument(id: number) {
  await api.delete(`/documents/${id}`);
}
