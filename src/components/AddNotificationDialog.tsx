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

import type { Notification } from "../types/Notification";

type AddNotificationDialogProps = {
  open: boolean;
  handleClose: () => void;
  addNotification: (notification: Notification) => void;
  selectedNotification: Notification;
};

function AddNotificationDialog({
  open,
  handleClose,
  addNotification,
  selectedNotification,
}: AddNotificationDialogProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState<Notification["recipient"]>("All");

  useEffect(() => {
    setTitle(selectedNotification.title || "");
    setMessage(selectedNotification.message || "");
    setRecipient(selectedNotification.recipient || "All");
  }, [selectedNotification]);

  const handleSave = () => {
    addNotification({
      id: selectedNotification.id,
      title,
      message,
      recipient,
      createdBy: selectedNotification.createdBy,
      createdByUserId: selectedNotification.createdByUserId ?? null,
      date: selectedNotification.date,
      status: selectedNotification.status,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Notification</DialogTitle>

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
          multiline
          rows={4}
          margin="dense"
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <TextField
          select
          fullWidth
          margin="dense"
          label="Recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value as Notification["recipient"])}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="HR">HR</MenuItem>
          <MenuItem value="Mentor">Mentor</MenuItem>
          <MenuItem value="Intern">Intern</MenuItem>
        </TextField>

        <TextField
          fullWidth
          margin="dense"
          label="Created By"
          value={selectedNotification.createdBy}
          disabled
        />

        <TextField
          fullWidth
          margin="dense"
          label="Notification Date"
          value={selectedNotification.date}
          disabled
        />

        <TextField fullWidth margin="dense" label="Status" value={selectedNotification.status} disabled />
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

export default AddNotificationDialog;
