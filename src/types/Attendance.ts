export type Attendance = {
  id: number;
  intern: string;
  internId?: number | null;
  mentor: string;
  mentorId?: number | null;
  date: string;
  status:
    | "Present"
    | "Absent"
    | "Leave"
    | "Holiday"
    | "WFH";
};