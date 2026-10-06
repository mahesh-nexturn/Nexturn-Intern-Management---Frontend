export type Certificate = {
  id: number;
  intern: string;
  internId?: number | null;
  mentor: string;
  mentorId?: number | null;
  certificateName: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string;
  status:
    | "Active"
    | "Expired";
};