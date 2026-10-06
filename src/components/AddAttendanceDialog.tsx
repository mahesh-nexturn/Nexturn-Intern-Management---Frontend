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

import type { Attendance } from "../types/Attendance";
import type { Intern } from "../types/Intern";

type AddAttendanceDialogProps = {
  open: boolean;
  handleClose: () => void;
  addAttendance: (attendance: Attendance) => void;
  selectedAttendance: Attendance;
  interns: Intern[];
};

function AddAttendanceDialog({
  open,
  handleClose,
  addAttendance,
  selectedAttendance,
  interns,
}: AddAttendanceDialogProps) {
  const [internId, setInternId] = useState<number | "">("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<Attendance["status"]>("Present");

  useEffect(() => {
    setInternId(selectedAttendance.internId ?? "");
    setDate(selectedAttendance.date || "");
    setStatus(selectedAttendance.status || "Present");
  }, [selectedAttendance]);

  const selectedIntern = interns.find((intern) => intern.id === internId);

  const handleSave = () => {
    if (!internId) {
      alert("Please select an intern.");
      return;
    }

    if (!date) {
      alert("Please select a date.");
      return;
    }

    addAttendance({
      id: selectedAttendance.id,
      intern: selectedIntern?.name || "",
      internId: internId as number,
      mentor: selectedIntern?.mentor || "",
      mentorId: selectedIntern?.mentorId ?? null,
      date,
      status,
    });

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Attendance Details</DialogTitle>

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

        <TextField
          fullWidth
          margin="dense"
          label="Mentor"
          value={selectedIntern?.mentor || ""}
          disabled
        />

        <TextField
          fullWidth
          type="date"
          margin="dense"
          value={date}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => setDate(e.target.value)}
        />

        <TextField
          select
          fullWidth
          margin="dense"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Attendance["status"])}
        >
          <MenuItem value="Present">Present</MenuItem>
          <MenuItem value="Absent">Absent</MenuItem>
          <MenuItem value="Leave">Leave</MenuItem>
          <MenuItem value="Holiday">Holiday</MenuItem>
          <MenuItem value="WFH">WFH</MenuItem>
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

export default AddAttendanceDialog;
