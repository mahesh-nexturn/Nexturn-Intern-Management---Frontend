export type Intern = {
  id: number;
  name: string;
  department: string;
  mentor: string;
  mentorId?: number | null;
  status: string;
  email?: string;
  userId?: number | null;
};