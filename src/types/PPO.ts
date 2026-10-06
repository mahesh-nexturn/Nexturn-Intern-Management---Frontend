export type PPO = {
  id: number;
  intern: string;
  internId?: number | null;
  mentor: string;
  mentorId?: number | null;
  attendance: number;
  trainingCompletion: number;
  technicalScore: number;
  communicationScore: number;
  overallScore: number;
  mentorRecommendation: "Yes" | "No";
  hrRecommendation: "Yes" | "No";
  status:
    | "Eligible"
    | "Not Eligible"
    | "Offered";
};