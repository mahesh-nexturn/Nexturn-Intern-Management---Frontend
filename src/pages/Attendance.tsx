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

import AttendanceCalendar from "../components/AttendanceCalendar";
import AddAttendanceDialog from "../components/AddAttendanceDialog";

import type { Attendance as AttendanceType } from "../types/Attendance";
import type { Intern } from "../types/Intern";
import type { Mentor } from "../types/Mentor";
import * as attendanceApi from "../services/attendanceApi";

type AttendanceProps = {
  attendance: AttendanceType[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceType[]>>;
  interns: Intern[];
  mentors: Mentor[];
};

type Role = "HR" | "MENTOR" | "INTERN" | null;

export function toUiAttendance(
  dto: attendanceApi.AttendanceDto,
  interns: Intern[],
  mentors: Mentor[]
): AttendanceType {
  return {
    id: dto.id,
    intern: dto.internName,
    internId: dto.internId,
    mentor: mentors.find((mentor) => mentor.id === dto.mentorId)?.name
      ?? interns.find((intern) => intern.id === dto.internId)?.mentor
      ?? "",
    mentorId: dto.mentorId,
    date: dto.date,
    status: dto.status as AttendanceType["status"],
  };
}

function Attendance({
  attendance,
  setAttendance,
  interns,
  mentors,
}: AttendanceProps) {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceType>({
    id: 0,
    intern: "",
    internId: null,
    mentor: "",
    mentorId: null,
    date: "",
    status: "Present",
  });

  const role = localStorage.getItem("role") as Role;
  const userName = localStorage.getItem("name") || "";

  const isHr = role === "HR";
  const isMentor = role === "MENTOR";
  const canManageAttendance = isHr || isMentor;

  useEffect(() => {
    attendanceApi
      .listAttendance()
      .then((list) => setAttendance(list.map((item) => toUiAttendance(item, interns, mentors))))
      .catch(() => setToast({ message: "Failed to load attendance.", severity: "error" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const attendanceWithMentor = useMemo(
    () =>
      attendance.map((record) => ({
        ...record,
        mentor: mentors.find((mentor) => mentor.id === record.mentorId)?.name
          ?? interns.find((intern) => intern.id === record.internId)?.mentor
          ?? record.mentor,
      })),
    [attendance, interns, mentors]
  );

  const visibleAttendance = useMemo(() => {
    if (isHr) return attendanceWithMentor;
    if (isMentor) {
      return attendanceWithMentor.filter((record) => record.mentor === userName);
    }
    return attendanceWithMentor.filter((record) => record.intern === userName);
  }, [attendanceWithMentor, isHr, isMentor, userName]);

  const filteredAttendance = visibleAttendance
    .filter((record) => record.intern.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((record) => statusFilter === "All" || record.status === statusFilter);

  const handleOpen = () => {
    setEditId(null);
    setSelectedAttendance({
      id: 0,
      intern: "",
      internId: null,
      mentor: "",
      mentorId: null,
      date: "",
      status: "Present",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const saveAttendance = async (record: AttendanceType) => {
    if (!record.internId) {
      alert("Please select an intern.");
      return;
    }

    const payload: attendanceApi.AttendancePayload = {
      internId: record.internId,
      mentorId: record.mentorId ?? null,
      attendanceDate: record.date,
      status: record.status,
    };

    try {
      if (editId !== null) {
        const updated = await attendanceApi.updateAttendance(editId, payload);
        setAttendance((prev) =>
          prev.map((item) =>
            item.id === editId ? toUiAttendance(updated, interns, mentors) : item
          )
        );
        setToast({ message: "Attendance updated successfully.", severity: "success" });
      } else {
        const created = await attendanceApi.createAttendance(payload);
        setAttendance((prev) => [...prev, toUiAttendance(created, interns, mentors)]);
        setToast({ message: "Attendance recorded successfully.", severity: "success" });
      }

      setEditId(null);
      setOpen(false);
    } catch {
      setToast({ message: "Failed to save attendance.", severity: "error" });
    }
  };

  const editAttendance = (id: number) => {
    const record = filteredAttendance.find((item) => item.id === id);
    if (!record) return;

    setEditId(record.id);
    setSelectedAttendance(record);
    setOpen(true);
  };

  const deleteAttendance = async (id: number) => {
    try {
      await attendanceApi.deleteAttendance(id);
      setAttendance((prev) => prev.filter((item) => item.id !== id));
      setToast({ message: "Attendance deleted successfully.", severity: "success" });
    } catch {
      setToast({ message: "Failed to delete attendance.", severity: "error" });
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h4">Attendance</Typography>

        {canManageAttendance && (
          <Button variant="contained" onClick={handleOpen}>
            Add Attendance
          </Button>
        )}
      </Box>

      <AttendanceCalendar attendance={visibleAttendance} interns={interns} />

      <Box
        sx={{
          display: "flex",
          gap: 2,
          my: 3,
          flexWrap: "wrap",
        }}
      >
        <TextField
          label="Search Intern"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Present">Present</MenuItem>
            <MenuItem value="Absent">Absent</MenuItem>
            <MenuItem value="Leave">Leave</MenuItem>
            <MenuItem value="Holiday">Holiday</MenuItem>
            <MenuItem value="WFH">WFH</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Intern</TableCell>
              <TableCell>Mentor</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              {canManageAttendance && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredAttendance.length === 0 ? (
              <TableRow>
                <TableCell align="center" colSpan={canManageAttendance ? 5 : 4}>
                  No attendance records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAttendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.intern}</TableCell>
                  <TableCell>{record.mentor || "-"}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>
                    <Chip label={record.status} color="primary" />
                  </TableCell>
                  {canManageAttendance && (
                    <TableCell>
                      <IconButton color="primary" onClick={() => editAttendance(record.id)}>
                        <EditIcon />
                      </IconButton>

                      <IconButton color="error" onClick={() => deleteAttendance(record.id)}>
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

      <AddAttendanceDialog
        open={open}
        handleClose={handleClose}
        addAttendance={saveAttendance}
        selectedAttendance={selectedAttendance}
        interns={interns}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}

export default Attendance;
