export type Report = {
  intern: string;
  mentor: string;
  attendance: number;
  completedTasks: number;
  pendingTasks: number;
  trainingProgress: number;
  evaluationScore: number;
  ppoStatus:
    | "Eligible"
    | "Not Eligible"
    | "Offered";
};