import { useEffect, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";

import type { Training } from "../types/Training";
import type { Intern } from "../types/Intern";

type AddTrainingDialogProps = {
  open: boolean;
  handleClose: () => void;
  addTraining: (training: Training) => void;
  selectedTraining: Training;
  interns: Intern[];
};

function AddTrainingDialog({
  open,
  handleClose,
  addTraining,
  selectedTraining,
  interns,
}: AddTrainingDialogProps) {
  const [title, setTitle] = useState("");
  const [internId, setInternId] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<Training["status"]>("Not Started");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setTitle(selectedTraining.title || "");
    setInternId(selectedTraining.internId ?? "");
    setStartDate(selectedTraining.startDate || "");
    setEndDate(selectedTraining.endDate || "");
    setStatus(selectedTraining.status || "Not Started");
    setProgress(selectedTraining.progress || 0);
  }, [selectedTraining]);

  const selectedIntern = interns.find((intern) => intern.id === internId);

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    if (!internId) {
      alert("Please select an intern.");
      return;
    }

    addTraining({
      id: selectedTraining.id,
      title,
      assignedTo: selectedIntern?.name || "",
      internId: internId as number,
      mentor: selectedIntern?.mentor || "",
      mentorId: selectedIntern?.mentorId ?? null,
      startDate,
      endDate,
      status,
      progress,
    });

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Training Details</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          select
          fullWidth
          margin="dense"
          label="Assigned To"
          value={internId}
          onChange={(e) => setInternId(e.target.value === "" ? "" : Number(e.target.value))}
        >
          {interns.map((intern) => (
            <MenuItem key={intern.id} value={intern.id}>
              {intern.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          margin="dense"
          label="Mentor"
          value={selectedIntern?.mentor || ""}
          disabled
        />

        <TextField
          fullWidth
          margin="dense"
          type="date"
          value={startDate}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <TextField
          fullWidth
          margin="dense"
          type="date"
          value={endDate}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <TextField
          select
          fullWidth
          margin="dense"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Training["status"])}
        >
          <MenuItem value="Not Started">Not Started</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </TextField>

        <TextField
          fullWidth
          margin="dense"
          type="number"
          label="Progress (%)"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
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

export default AddTrainingDialog;
