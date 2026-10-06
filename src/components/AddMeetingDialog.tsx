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

import type { Meeting } from "../types/Meeting";
import type { Intern } from "../types/Intern";

type AddMeetingDialogProps = {
  open: boolean;
  handleClose: () => void;
  addMeeting: (meeting: Meeting) => void;
  selectedMeeting: Meeting;
  interns: Intern[];
};

function AddMeetingDialog({
  open,
  handleClose,
  addMeeting,
  selectedMeeting,
  interns,
}: AddMeetingDialogProps) {
  const [title, setTitle] = useState("");
  const [agenda, setAgenda] = useState("");
  const [internId, setInternId] = useState<number | "">("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState<Meeting["status"]>("Scheduled");

  useEffect(() => {
    setTitle(selectedMeeting.title || "");
    setAgenda(selectedMeeting.agenda || "");
    setInternId(selectedMeeting.internId ?? "");
    setDate(selectedMeeting.date || "");
    setTime(selectedMeeting.time || "");
    setStatus(selectedMeeting.status || "Scheduled");
  }, [selectedMeeting]);

  const selectedIntern = interns.find((intern) => intern.id === internId);

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a meeting title.");
      return;
    }

    if (!internId) {
      alert("Please select an intern.");
      return;
    }

    if (!date || !time) {
      alert("Please select both date and time.");
      return;
    }

    addMeeting({
      id: selectedMeeting.id,
      title,
      agenda,
      mentor: selectedIntern?.mentor || "",
      mentorId: selectedIntern?.mentorId ?? null,
      intern: selectedIntern?.name || "",
      internId: internId as number,
      date,
      time,
      status,
    });

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Meeting Details</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          fullWidth
          margin="dense"
          multiline
          rows={3}
          label="Agenda"
          value={agenda}
          onChange={(e) => setAgenda(e.target.value)}
        />

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
          value={date}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => setDate(e.target.value)}
        />

        <TextField
          fullWidth
          margin="dense"
          type="time"
          value={time}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => setTime(e.target.value)}
        />

        <TextField
          select
          fullWidth
          margin="dense"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Meeting["status"])}
        >
          <MenuItem value="Scheduled">Scheduled</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Cancelled">Cancelled</MenuItem>
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

export default AddMeetingDialog;
