import { useEffect, useMemo, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";

import type { PPO } from "../types/PPO";
import type { Intern } from "../types/Intern";

type AddPPODialogProps = {
  open: boolean;
  handleClose: () => void;
  addPPO: (ppo: PPO) => void;
  selectedPPO: PPO;
  interns: Intern[];
};

function AddPPODialog({
  open,
  handleClose,
  addPPO,
  selectedPPO,
  interns,
}: AddPPODialogProps) {
  const [internId, setInternId] = useState<number | "">("");
  const [attendance, setAttendance] = useState(0);
  const [trainingCompletion, setTrainingCompletion] = useState(0);
  const [technicalScore, setTechnicalScore] = useState(0);
  const [communicationScore, setCommunicationScore] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [mentorRecommendation, setMentorRecommendation] = useState<PPO["mentorRecommendation"]>("Yes");
  const [hrRecommendation, setHrRecommendation] = useState<PPO["hrRecommendation"]>("Yes");
  const [status, setStatus] = useState<PPO["status"]>("Eligible");

  useEffect(() => {
    setInternId(selectedPPO.internId ?? "");
    setAttendance(selectedPPO.attendance || 0);
    setTrainingCompletion(selectedPPO.trainingCompletion || 0);
    setTechnicalScore(selectedPPO.technicalScore || 0);
    setCommunicationScore(selectedPPO.communicationScore || 0);
    setOverallScore(selectedPPO.overallScore || 0);
    setMentorRecommendation(selectedPPO.mentorRecommendation || "Yes");
    setHrRecommendation(selectedPPO.hrRecommendation || "Yes");
    setStatus(selectedPPO.status || "Eligible");
  }, [selectedPPO]);

  const selectedIntern = useMemo(
    () => interns.find((intern) => intern.id === internId),
    [internId, interns]
  );

  const handleSave = () => {
    if (!internId) {
      alert("Please select an intern.");
      return;
    }

    addPPO({
      id: selectedPPO.id,
      intern: selectedIntern?.name || "",
      internId: internId as number,
      mentor: selectedIntern?.mentor || "",
      mentorId: selectedIntern?.mentorId ?? null,
      attendance,
      trainingCompletion,
      technicalScore,
      communicationScore,
      overallScore,
      mentorRecommendation,
      hrRecommendation,
      status,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>PPO Details</DialogTitle>

      <DialogContent>
        <TextField
          select
          fullWidth
          margin="dense"
          label="Intern"
          value={internId}
          onChange={(e) => setInternId(e.target.value === "" ? "" : Number(e.target.value))}
        >
          {interns.map((intern) => (
            <MenuItem key={intern.id} value={intern.id}>
              {intern.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField fullWidth margin="dense" label="Mentor" value={selectedIntern?.mentor || ""} disabled />

        <TextField
          fullWidth
          type="number"
          margin="dense"
          label="Attendance (%)"
          value={attendance}
          onChange={(e) => setAttendance(Number(e.target.value))}
        />

        <TextField
          fullWidth
          type="number"
          margin="dense"
          label="Training Completion (%)"
          value={trainingCompletion}
          onChange={(e) => setTrainingCompletion(Number(e.target.value))}
        />

        <TextField
          fullWidth
          type="number"
          margin="dense"
          label="Technical Score"
          value={technicalScore}
          onChange={(e) => setTechnicalScore(Number(e.target.value))}
        />

        <TextField
          fullWidth
          type="number"
          margin="dense"
          label="Communication Score"
          value={communicationScore}
          onChange={(e) => setCommunicationScore(Number(e.target.value))}
        />

        <TextField
          fullWidth
          type="number"
          margin="dense"
          label="Overall Score"
          value={overallScore}
          onChange={(e) => setOverallScore(Number(e.target.value))}
        />

        <TextField
          select
          fullWidth
          margin="dense"
          label="Mentor Recommendation"
          value={mentorRecommendation}
          onChange={(e) => setMentorRecommendation(e.target.value as PPO["mentorRecommendation"])}
        >
          <MenuItem value="Yes">Yes</MenuItem>
          <MenuItem value="No">No</MenuItem>
        </TextField>

        <TextField
          select
          fullWidth
          margin="dense"
          label="HR Recommendation"
          value={hrRecommendation}
          onChange={(e) => setHrRecommendation(e.target.value as PPO["hrRecommendation"])}
        >
          <MenuItem value="Yes">Yes</MenuItem>
          <MenuItem value="No">No</MenuItem>
        </TextField>

        <TextField
          select
          fullWidth
          margin="dense"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as PPO["status"])}
        >
          <MenuItem value="Eligible">Eligible</MenuItem>
          <MenuItem value="Not Eligible">Not Eligible</MenuItem>
          <MenuItem value="Offered">Offered</MenuItem>
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddPPODialog;
