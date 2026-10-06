export type Mentor = {
  id: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  status: "Active" | "Inactive";
}