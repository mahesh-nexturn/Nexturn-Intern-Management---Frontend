export type Training = {
  id: number;
  title: string;
  assignedTo: string;
  internId?: number | null;
  mentor: string;
  mentorId?: number | null;
  startDate: string;
  endDate: string;
  status:
    | "Not Started"
    | "In Progress"
    | "Completed";
  progress: number;
};