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

import type { Announcement } from "../types/Announcement";

type AddAnnouncementDialogProps = {
  open: boolean;
  handleClose: () => void;
  addAnnouncement: (announcement: Announcement) => void;
  selectedAnnouncement: Announcement;
};

function AddAnnouncementDialog({
  open,
  handleClose,
  addAnnouncement,
  selectedAnnouncement,
}: AddAnnouncementDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [priority, setPriority] = useState<Announcement["priority"]>("Medium");
  const [targetAudience, setTargetAudience] = useState<Announcement["targetAudience"]>("All");

  useEffect(() => {
    setTitle(selectedAnnouncement.title || "");
    setDescription(selectedAnnouncement.description || "");
    setPublishDate(selectedAnnouncement.publishDate || "");
    setExpiryDate(selectedAnnouncement.expiryDate || "");
    setPriority(selectedAnnouncement.priority || "Medium");
    setTargetAudience(selectedAnnouncement.targetAudience || "All");
  }, [selectedAnnouncement]);

  const handleSave = () => {
    addAnnouncement({
      id: selectedAnnouncement.id,
      title,
      description,
      createdBy: selectedAnnouncement.createdBy,
      createdByUserId: selectedAnnouncement.createdByUserId ?? null,
      publishDate,
      expiryDate,
      priority,
      targetAudience,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Announcement Details</DialogTitle>

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
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <TextField
          fullWidth
          margin="dense"
          label="Created By"
          value={selectedAnnouncement.createdBy}
          disabled
        />

        <TextField
          fullWidth
          type="date"
          margin="dense"
          label="Publish Date"
          value={publishDate}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => setPublishDate(e.target.value)}
        />

        <TextField
          fullWidth
          type="date"
          margin="dense"
          label="Expiry Date"
          value={expiryDate}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => setExpiryDate(e.target.value)}
        />

        <TextField
          select
          fullWidth
          margin="dense"
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Announcement["priority"])}
        >
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </TextField>

        <TextField
          select
          fullWidth
          margin="dense"
          label="Target Audience"
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value as Announcement["targetAudience"])}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="HR">HR</MenuItem>
          <MenuItem value="Mentor">Mentor</MenuItem>
          <MenuItem value="Intern">Intern</MenuItem>
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

export default AddAnnouncementDialog;
