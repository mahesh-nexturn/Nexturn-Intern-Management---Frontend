import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import type { Mentor } from "../types/Mentor";
import * as mentorApi from "../services/mentorApi";

type MentorsProps = {
  mentors: Mentor[];
  setMentors: Dispatch<SetStateAction<Mentor[]>>;
};

function toUiMentor(dto: mentorApi.MentorDto): Mentor {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    department: dto.department ?? "",
    designation: dto.designation ?? "",
    status: (dto.status as "Active" | "Inactive") ?? "Active",
  };
}

function Mentors({ mentors, setMentors }: MentorsProps) {
  const role = localStorage.getItem("role") || "HR";
  const isHr = role === "HR";

  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedMentor, setSelectedMentor] = useState<Mentor>({
    id: 0,
    name: "",
    email: "",
    department: "",
    designation: "",
    status: "Active",
  });

  useEffect(() => {
    let cancelled = false;
    mentorApi
      .listMentors()
      .then((list) => {
        if (!cancelled) setMentors(list.map(toUiMentor));
      })
      .catch(() => {
        if (!cancelled) setToast({ message: "Failed to load mentors.", severity: "error" });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const departments = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(mentors.map((m) => m.department))),
    ];
  }, [mentors]);

  const filteredMentors = useMemo(() => {
    return mentors
      .filter((mentor) => {
        const search = searchTerm.toLowerCase();
        return (
          mentor.name.toLowerCase().includes(search) ||
          mentor.email.toLowerCase().includes(search)
        );
      })
      .filter(
        (mentor) =>
          departmentFilter === "All" ||
          mentor.department === departmentFilter
      )
      .filter(
        (mentor) =>
          statusFilter === "All" || mentor.status === statusFilter
      );
  }, [mentors, searchTerm, departmentFilter, statusFilter]);

  const totalMentors = mentors.length;
  const activeMentors = mentors.filter((m) => m.status === "Active").length;
  const inactiveMentors = mentors.filter((m) => m.status === "Inactive").length;
  const uniqueDepartments = new Set(mentors.map((m) => m.department)).size;

  const handleOpenAdd = () => {
    setEditIndex(null);
    setSelectedMentor({
      id: Date.now(),
      name: "",
      email: "",
      department: "",
      designation: "",
      status: "Active",
    });
    setOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    const selected = filteredMentors[index];
    const actualIndex = mentors.findIndex((m) => m.id === selected.id);

    if (actualIndex !== -1) {
      setEditIndex(actualIndex);
      setSelectedMentor(mentors[actualIndex]);
      setOpen(true);
    }
  };

  const handleDelete = (index: number) => {
    const selected = filteredMentors[index];
    const actualIndex = mentors.findIndex((m) => m.id === selected.id);

    if (actualIndex !== -1) {
      const ok = window.confirm(`Delete mentor "${selected.name}"?`);
      if (ok) {
        mentorApi
          .deleteMentor(selected.id)
          .then(() => {
            setMentors(mentors.filter((_, i) => i !== actualIndex));
            setToast({ message: "Mentor deleted.", severity: "success" });
          })
          .catch(() => setToast({ message: "Failed to delete mentor.", severity: "error" }));
      }
    }
  };

  const handleSave = () => {
    if (
      !selectedMentor.name.trim() ||
      !selectedMentor.email.trim() ||
      !selectedMentor.department.trim() ||
      !selectedMentor.designation.trim()
    ) {
      alert("Please fill all fields.");
      return;
    }

    const payload: mentorApi.MentorPayload = {
      name: selectedMentor.name,
      email: selectedMentor.email,
      department: selectedMentor.department,
      designation: selectedMentor.designation,
      status: selectedMentor.status,
    };

    if (editIndex !== null) {
      mentorApi
        .updateMentor(selectedMentor.id, payload)
        .then((dto) => {
          const updated = [...mentors];
          updated[editIndex] = toUiMentor(dto);
          setMentors(updated);
          setToast({ message: "Mentor updated.", severity: "success" });
        })
        .catch(() => setToast({ message: "Failed to update mentor.", severity: "error" }));
    } else {
      mentorApi
        .createMentor(payload)
        .then((dto) => {
          setMentors([...mentors, toUiMentor(dto)]);
          setToast({ message: "Mentor created.", severity: "success" });
        })
        .catch(() => setToast({ message: "Failed to create mentor.", severity: "error" }));
    }

    setOpen(false);
    setEditIndex(null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Mentor Management
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
            Manage mentors, departments, and status.
          </Typography>
        </Box>

        {isHr && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{
              px: 3,
              py: 1.3,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Add Mentor
          </Button>
        )}
      </Box>

      <Paper
        elevation={2}
        sx={{
          borderRadius: 4,
          p: 4,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
            textAlign: "center",
          }}
        >
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {totalMentors}
            </Typography>
            <Typography color="text.secondary">Total Mentors</Typography>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {activeMentors}
            </Typography>
            <Typography color="text.secondary">Active Mentors</Typography>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {inactiveMentors}
            </Typography>
            <Typography color="text.secondary">
              Inactive Mentors
            </Typography>
          </Box>

          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {uniqueDepartments}
            </Typography>
            <Typography color="text.secondary">Departments</Typography>
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 4,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label="Search Mentor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              label="Department"
              onChange={(e) => setDepartmentFilter(e.target.value as string)}
            >
              {departments.map((department) => (
                <MenuItem key={department} value={department}>
                  {department}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value as string)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper
        elevation={2}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Designation</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                {isHr && (
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredMentors.length === 0 ? (
                <TableRow>
                  <TableCell
                    align="center"
                    colSpan={isHr ? 6 : 5}
                    sx={{ py: 5 }}
                  >
                    <Typography color="text.secondary">
                      No mentors found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMentors.map((mentor, index) => (
                  <TableRow key={mentor.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>
                        {mentor.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{mentor.email}</TableCell>
                    <TableCell>{mentor.department}</TableCell>
                    <TableCell>{mentor.designation}</TableCell>
                    <TableCell>
                      <Chip
                        label={mentor.status}
                        color={mentor.status === "Active" ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    {isHr && (
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEdit(index)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(index)}
                        >
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
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editIndex !== null ? "Edit Mentor" : "Add Mentor"}
        </DialogTitle>

        <DialogContent dividers>
          <TextField
            fullWidth
            margin="normal"
            label="Mentor Name"
            value={selectedMentor.name}
            onChange={(e) =>
              setSelectedMentor({
                ...selectedMentor,
                name: e.target.value,
              })
            }
          />

          <TextField
            fullWidth
            margin="normal"
            label="Email"
            value={selectedMentor.email}
            onChange={(e) =>
              setSelectedMentor({
                ...selectedMentor,
                email: e.target.value,
              })
            }
          />

          <TextField
            fullWidth
            margin="normal"
            label="Department"
            value={selectedMentor.department}
            onChange={(e) =>
              setSelectedMentor({
                ...selectedMentor,
                department: e.target.value,
              })
            }
          />

          <TextField
            fullWidth
            margin="normal"
            label="Designation"
            value={selectedMentor.designation}
            onChange={(e) =>
              setSelectedMentor({
                ...selectedMentor,
                designation: e.target.value,
              })
            }
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedMentor.status}
              label="Status"
              onChange={(e) =>
                setSelectedMentor({
                  ...selectedMentor,
                  status: e.target.value as "Active" | "Inactive",
                })
              }
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {editIndex !== null ? "Update Mentor" : "Add Mentor"}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
}

export default Mentors;