export type Task = {
  id: number;
  title: string;
  description: string;
  assignedTo: string;
  internId?: number | null;
  mentor: string;
  mentorId?: number | null;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  status:
    | "Pending"
    | "In Progress"
    | "Completed";
  progress: number;
};