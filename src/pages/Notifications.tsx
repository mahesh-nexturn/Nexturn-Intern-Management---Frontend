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

import AddNotificationDialog from "../components/AddNotificationDialog";
import NotificationChart from "../components/NotificationChart";
import type { Notification } from "../types/Notification";
import * as notificationApi from "../services/notificationApi";

type NotificationsProps = {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
};

type Role = "HR" | "MENTOR" | "INTERN" | null;

function formatDate(value?: string | null) {
  return value ? value.split("T")[0] : "";
}

function userLabelForId(userId?: number | null) {
  const currentUserId = Number(localStorage.getItem("userId") || "0");
  const currentUserName = localStorage.getItem("name") || "";

  if (userId && userId === currentUserId && currentUserName) {
    return currentUserName;
  }

  return userId ? `User #${userId}` : "";
}

export function toUiNotification(dto: notificationApi.NotificationDto): Notification {
  return {
    id: dto.id,
    title: dto.title,
    message: dto.message,
    recipient: dto.recipient as Notification["recipient"],
    createdBy: userLabelForId(dto.createdByUserId),
    createdByUserId: dto.createdByUserId,
    date: formatDate(dto.notificationDate),
    status: dto.status as Notification["status"],
  };
}

function todayString() {
  return new Date().toISOString().split("T")[0];
}

function Notifications({ notifications, setNotifications }: NotificationsProps) {
  const role = localStorage.getItem("role") as Role;
  const userName = localStorage.getItem("name") || "";
  const currentUserId = Number(localStorage.getItem("userId") || "0");
  const isHr = role === "HR";

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const [selectedNotification, setSelectedNotification] = useState<Notification>({
    id: 0,
    title: "",
    message: "",
    recipient: "All",
    createdBy: userName,
    createdByUserId: currentUserId || null,
    date: todayString(),
    status: "Unread",
  });

  useEffect(() => {
    let cancelled = false;

    notificationApi
      .listNotifications()
      .then((list) => {
        if (!cancelled) setNotifications(list.map(toUiNotification));
      })
      .catch(() => {
        if (!cancelled) setToast({ message: "Failed to load notifications.", severity: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [setNotifications]);

  const filteredNotifications = useMemo(
    () =>
      notifications
        .filter((notification) => notification.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((notification) => statusFilter === "All" || notification.status === statusFilter),
    [notifications, searchTerm, statusFilter]
  );

  const total = notifications.length;
  const unread = notifications.filter((notification) => notification.status === "Unread").length;
  const read = notifications.filter((notification) => notification.status === "Read").length;
  const today = notifications.filter((notification) => notification.date === todayString()).length;

  const handleOpen = () => {
    setEditId(null);
    setSelectedNotification({
      id: 0,
      title: "",
      message: "",
      recipient: "All",
      createdBy: userName,
      createdByUserId: currentUserId || null,
      date: todayString(),
      status: "Unread",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const saveNotification = async (notification: Notification) => {
    const payload: notificationApi.NotificationPayload = {
      title: notification.title,
      message: notification.message,
      recipient: notification.recipient,
    };

    try {
      if (editId !== null) {
        const updated = await notificationApi.updateNotification(editId, payload);
        setNotifications((prev) => prev.map((item) => (item.id === editId ? toUiNotification(updated) : item)));
        setToast({ message: "Notification updated successfully.", severity: "success" });
      } else {
        const created = await notificationApi.createNotification(payload);
        setNotifications((prev) => [...prev, toUiNotification(created)]);
        setToast({ message: "Notification created successfully.", severity: "success" });
      }

      setEditId(null);
      setOpen(false);
    } catch {
      setToast({ message: "Failed to save notification.", severity: "error" });
    }
  };

  const editNotification = (index: number) => {
    const notification = filteredNotifications[index];
    setEditId(notification.id);
    setSelectedNotification(notification);
    setOpen(true);
  };

  const deleteNotification = async (index: number) => {
    const notification = filteredNotifications[index];

    if (!window.confirm(`Delete notification "${notification.title}"?`)) {
      return;
    }

    try {
      await notificationApi.deleteNotification(notification.id);
      setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
      setToast({ message: "Notification deleted successfully.", severity: "success" });
    } catch {
      setToast({ message: "Failed to delete notification.", severity: "error" });
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Notifications</Typography>

        {isHr && (
          <Button variant="contained" onClick={handleOpen}>
            Add Notification
          </Button>
        )}
      </Box>

      <NotificationChart total={total} unread={unread} read={read} today={today} />

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          label="Search Notification"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Unread">Unread</MenuItem>
            <MenuItem value="Read">Read</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Recipient</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              {isHr && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredNotifications.length === 0 ? (
              <TableRow>
                <TableCell align="center" colSpan={isHr ? 7 : 6}>
                  No notifications found.
                </TableCell>
              </TableRow>
            ) : (
              filteredNotifications.map((notification, index) => (
                <TableRow key={notification.id}>
                  <TableCell>{notification.title}</TableCell>
                  <TableCell>{notification.message}</TableCell>
                  <TableCell>{notification.recipient}</TableCell>
                  <TableCell>{notification.createdBy || "-"}</TableCell>
                  <TableCell>{notification.date}</TableCell>
                  <TableCell>
                    <Chip
                      label={notification.status}
                      color={notification.status === "Unread" ? "warning" : "success"}
                      size="small"
                    />
                  </TableCell>
                  {isHr && (
                    <TableCell>
                      <IconButton color="primary" onClick={() => editNotification(index)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => deleteNotification(index)}>
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

      <AddNotificationDialog
        open={open}
        handleClose={handleClose}
        addNotification={saveNotification}
        selectedNotification={selectedNotification}
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

export default Notifications;
