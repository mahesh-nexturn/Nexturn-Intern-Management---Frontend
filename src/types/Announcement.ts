export type Announcement = {
  id: number;
  title: string;
  description: string;
  createdBy: string;
  createdByUserId?: number | null;
  publishDate: string;
  expiryDate: string;
  priority:
    | "High"
    | "Medium"
    | "Low";
  targetAudience:
    | "All"
    | "HR"
    | "Mentor"
    | "Intern";
};