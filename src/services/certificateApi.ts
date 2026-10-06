import api from "./api";
import type { ApiResponse } from "./api";

export type CertificateDto = {
  id: number;
  internId: number;
  internName: string;
  mentorId: number | null;
  certificateName: string;
  issuedBy: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  status: string;
};

export type CertificatePayload = {
  internId: number;
  mentorId?: number | null;
  certificateName: string;
  issuedBy?: string;
  issueDate?: string;
  expiryDate?: string;
  status?: string;
};

export async function listCertificates(params?: { internId?: number; mentorId?: number }) {
  const { data } = await api.get<ApiResponse<CertificateDto[]>>("/certificates", { params });
  return data.data;
}

export async function createCertificate(payload: CertificatePayload) {
  const { data } = await api.post<ApiResponse<CertificateDto>>("/certificates", payload);
  return data.data;
}

export async function updateCertificate(id: number, payload: CertificatePayload) {
  const { data } = await api.put<ApiResponse<CertificateDto>>(`/certificates/${id}`, payload);
  return data.data;
}

export async function deleteCertificate(id: number) {
  await api.delete(`/certificates/${id}`);
}
