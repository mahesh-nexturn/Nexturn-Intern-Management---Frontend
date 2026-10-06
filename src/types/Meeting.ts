export type Meeting = {
  id: number;
  title: string;
  agenda: string;
  mentor: string;
  mentorId?: number | null;
  intern: string;
  internId?: number | null;
  date: string;
  time: string;
  status:
    | "Scheduled"
    | "Completed"
    | "Cancelled";
};