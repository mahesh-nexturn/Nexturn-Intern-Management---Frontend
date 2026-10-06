export type Evaluation = {
  id: number;
  intern: string;
  internId?: number | null;
  mentor: string;
  mentorId?: number | null;
  technicalRating: number;
  communicationRating: number;
  problemSolvingRating: number;
  overallRating: number;
  feedback: string;
};