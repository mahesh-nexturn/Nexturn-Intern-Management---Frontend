export type Notification = {
  id: number;
  title: string;
  message: string;
  recipient: "HR" | "Mentor" | "Intern" | "All";
  createdBy: string;
  createdByUserId?: number | null;
  date: string;
  status: "Unread" | "Read";
};