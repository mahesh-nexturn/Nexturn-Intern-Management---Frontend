import { useState, useEffect } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";

type Intern = {
  name: string;
  department: string;
  mentor: string;
  status: string;
};

type AddInternDialogProps = {
  open: boolean;
  handleClose: () => void;
  addIntern: (intern: Intern) => void;
  selectedIntern: Intern;
};

function AddInternDialog({
  open,
  handleClose,
  addIntern,
  selectedIntern,
}: AddInternDialogProps) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [mentor, setMentor] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    setName(selectedIntern.name || "");
    setDepartment(selectedIntern.department || "");
    setMentor(selectedIntern.mentor || "");
    setStatus(selectedIntern.status || "");
  }, [selectedIntern]);

  const handleSave = () => {
    addIntern({
      name,
      department,
      mentor,
      status,
    });

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {selectedIntern.name ? "Edit Intern" : "Add Intern"}
      </DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          label="Name"
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          fullWidth
          label="Department"
          margin="normal"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />

        <TextField
          fullWidth
          label="Mentor"
          margin="normal"
          value={mentor}
          onChange={(e) => setMentor(e.target.value)}
        />

        <TextField
          fullWidth
          label="Status"
          margin="normal"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddInternDialog;