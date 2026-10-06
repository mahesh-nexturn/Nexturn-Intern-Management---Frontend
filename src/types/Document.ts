export type Document = {
  id: number;
  fileName: string;
  fileUrl?: string;
  documentType:
    | "Resume"
    | "Certificate"
    | "Offer Letter"
    | "Report"
    | "Other";
  uploadedBy: string;
  uploadedByUserId?: number | null;
  uploadDate: string;
};