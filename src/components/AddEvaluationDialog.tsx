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

import type { Evaluation } from "../types/Evaluation";
import type { Intern } from "../types/Intern";

type AddEvaluationDialogProps = {
  open: boolean;
  handleClose: () => void;
  addEvaluation: (evaluation: Evaluation) => void;
  selectedEvaluation: Evaluation;
  interns: Intern[];
};

function AddEvaluationDialog({
  open,
  handleClose,
  addEvaluation,
  selectedEvaluation,
  interns,
}: AddEvaluationDialogProps) {
  const [internId, setInternId] = useState<number | "">("");
  const [technicalRating, setTechnicalRating] = useState(1);
  const [communicationRating, setCommunicationRating] = useState(1);
  const [problemSolvingRating, setProblemSolvingRating] = useState(1);
  const [overallRating, setOverallRating] = useState(1);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setInternId(selectedEvaluation.internId ?? "");
    setTechnicalRating(selectedEvaluation.technicalRating || 1);
    setCommunicationRating(selectedEvaluation.communicationRating || 1);
    setProblemSolvingRating(selectedEvaluation.problemSolvingRating || 1);
    setOverallRating(selectedEvaluation.overallRating || 1);
    setFeedback(selectedEvaluation.feedback || "");
  }, [selectedEvaluation]);

  const selectedIntern = useMemo(
    () => interns.find((intern) => intern.id === internId),
    [internId, interns]
  );

  const handleSave = () => {
    if (!internId) {
      alert("Please select an intern.");
      return;
    }

    addEvaluation({
      id: selectedEvaluation.id,
      intern: selectedIntern?.name || "",
      internId: internId as number,
      mentor: selectedIntern?.mentor || "",
      mentorId: selectedIntern?.mentorId ?? null,
      technicalRating,
      communicationRating,
      problemSolvingRating,
      overallRating,
      feedback,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Evaluation Details</DialogTitle>

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
          label="Technical Rating"
          value={technicalRating}
          onChange={(e) => setTechnicalRating(Number(e.target.value))}
          slotProps={{ htmlInput: { min: 0, max: 10 } }}
        />

        <TextField
          fullWidth
          type="number"
          margin="dense"
          label="Communication Rating"
          value={communicationRating}
          onChange={(e) => setCommunicationRating(Number(e.target.value))}
          slotProps={{ htmlInput: { min: 0, max: 10 } }}
        />

        <TextField
          fullWidth
          type="number"
          margin="dense"
          label="Problem Solving Rating"
          value={problemSolvingRating}
          onChange={(e) => setProblemSolvingRating(Number(e.target.value))}
          slotProps={{ htmlInput: { min: 0, max: 10 } }}
        />

        <TextField
          fullWidth
          type="number"
          margin="dense"
          label="Overall Rating"
          value={overallRating}
          onChange={(e) => setOverallRating(Number(e.target.value))}
          slotProps={{ htmlInput: { min: 0, max: 10 } }}
        />

        <TextField
          fullWidth
          multiline
          rows={4}
          margin="dense"
          label="Feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
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

export default AddEvaluationDialog;
