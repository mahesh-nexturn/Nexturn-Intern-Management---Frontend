export type Attendance = {
  id: number;
  intern: string;
  internId?: number | null;
  mentor: string;
  mentorId?: number | null;
  date: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  workedSeconds?: number;
  status:
    | "Present"
    | "Absent"
    | "Leave"
    | "Holiday"
    | "WFH";
};