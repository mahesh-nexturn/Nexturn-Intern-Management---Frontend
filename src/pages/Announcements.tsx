import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import AddAnnouncementDialog from "../components/AddAnnouncementDialog";
import AnnouncementChart from "../components/AnnouncementChart";
import type { Announcement } from "../types/Announcement";
import * as announcementApi from "../services/announcementApi";

type AnnouncementsProps = {
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
};

type Role = "HR" | "MENTOR" | "INTERN" | null;

function userLabelForId(userId?: number | null) {
  const currentUserId = Number(localStorage.getItem("userId") || "0");
  const currentUserName = localStorage.getItem("name") || "";

  if (userId && userId === currentUserId && currentUserName) {
    return currentUserName;
  }

  return userId ? `User #${userId}` : "";
}

function toUiAnnouncement(dto: announcementApi.AnnouncementDto): Announcement {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description ?? "",
    createdBy: userLabelForId(dto.createdByUserId),
    createdByUserId: dto.createdByUserId,
    publishDate: dto.publishDate ?? "",
    expiryDate: dto.expiryDate ?? "",
    priority: dto.priority as Announcement["priority"],
    targetAudience: dto.targetAudience as Announcement["targetAudience"],
  };
}

function todayString() {
  return new Date().toISOString().split("T")[0];
}

function Announcements({ announcements, setAnnouncements }: AnnouncementsProps) {
  const role = localStorage.getItem("role") as Role;
  const userName = localStorage.getItem("name") || "";
  const currentUserId = Number(localStorage.getItem("userId") || "0");
  const isHr = role === "HR";

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement>({
    id: 0,
    title: "",
    description: "",
    createdBy: userName,
    createdByUserId: currentUserId || null,
    publishDate: todayString(),
    expiryDate: "",
    priority: "Medium",
    targetAudience: "All",
  });

  useEffect(() => {
    let cancelled = false;

    announcementApi
      .listAnnouncements()
      .then((list) => {
        if (!cancelled) setAnnouncements(list.map(toUiAnnouncement));
      })
      .catch(() => {
        if (!cancelled) setToast({ message: "Failed to load announcements.", severity: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [setAnnouncements]);

  const filteredAnnouncements = useMemo(
    () =>
      announcements
        .filter((announcement) => announcement.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((announcement) => priorityFilter === "All" || announcement.priority === priorityFilter),
    [announcements, priorityFilter, searchTerm]
  );

  const total = announcements.length;
  const high = announcements.filter((announcement) => announcement.priority === "High").length;
  const medium = announcements.filter((announcement) => announcement.priority === "Medium").length;
  const low = announcements.filter((announcement) => announcement.priority === "Low").length;

  const handleOpen = () => {
    setEditId(null);
    setSelectedAnnouncement({
      id: 0,
      title: "",
      description: "",
      createdBy: userName,
      createdByUserId: currentUserId || null,
      publishDate: todayString(),
      expiryDate: "",
      priority: "Medium",
      targetAudience: "All",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const saveAnnouncement = async (announcement: Announcement) => {
    const payload: announcementApi.AnnouncementPayload = {
      title: announcement.title,
      description: announcement.description,
      publishDate: announcement.publishDate,
      expiryDate: announcement.expiryDate,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
    };

    try {
      if (editId !== null) {
        const updated = await announcementApi.updateAnnouncement(editId, payload);
        setAnnouncements((prev) => prev.map((item) => (item.id === editId ? toUiAnnouncement(updated) : item)));
        setToast({ message: "Announcement updated successfully.", severity: "success" });
      } else {
        const created = await announcementApi.createAnnouncement(payload);
        setAnnouncements((prev) => [...prev, toUiAnnouncement(created)]);
        setToast({ message: "Announcement created successfully.", severity: "success" });
      }

      setEditId(null);
      setOpen(false);
    } catch {
      setToast({ message: "Failed to save announcement.", severity: "error" });
    }
  };

  const editAnnouncement = (index: number) => {
    const announcement = filteredAnnouncements[index];
    setEditId(announcement.id);
    setSelectedAnnouncement(announcement);
    setOpen(true);
  };

  const deleteAnnouncement = async (index: number) => {
    const announcement = filteredAnnouncements[index];

    if (!window.confirm(`Delete announcement "${announcement.title}"?`)) {
      return;
    }

    try {
      await announcementApi.deleteAnnouncement(announcement.id);
      setAnnouncements((prev) => prev.filter((item) => item.id !== announcement.id));
      setToast({ message: "Announcement deleted successfully.", severity: "success" });
    } catch {
      setToast({ message: "Failed to delete announcement.", severity: "error" });
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Announcements</Typography>

        {isHr && (
          <Button variant="contained" onClick={handleOpen}>
            Add Announcement
          </Button>
        )}
      </Box>

      <AnnouncementChart total={total} high={high} medium={medium} low={low} />

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          label="Search Announcement"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Priority</InputLabel>
          <Select value={priorityFilter} label="Priority" onChange={(e) => setPriorityFilter(e.target.value)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Publish Date</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Audience</TableCell>
              {isHr && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredAnnouncements.length === 0 ? (
              <TableRow>
                <TableCell align="center" colSpan={isHr ? 8 : 7}>
                  No announcements found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAnnouncements.map((announcement, index) => (
                <TableRow key={announcement.id}>
                  <TableCell>{announcement.title}</TableCell>
                  <TableCell>{announcement.description}</TableCell>
                  <TableCell>{announcement.createdBy || "-"}</TableCell>
                  <TableCell>{announcement.publishDate || "-"}</TableCell>
                  <TableCell>{announcement.expiryDate || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={announcement.priority}
                      color={
                        announcement.priority === "High"
                          ? "error"
                          : announcement.priority === "Medium"
                          ? "warning"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{announcement.targetAudience}</TableCell>
                  {isHr && (
                    <TableCell>
                      <IconButton color="primary" onClick={() => editAnnouncement(index)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => deleteAnnouncement(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddAnnouncementDialog
        open={open}
        handleClose={handleClose}
        addAnnouncement={saveAnnouncement}
        selectedAnnouncement={selectedAnnouncement}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setToast(null)} severity={toast?.severity} variant="filled">
          {toast?.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Announcements;
