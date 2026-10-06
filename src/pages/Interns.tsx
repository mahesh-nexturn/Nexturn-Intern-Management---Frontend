import { useEffect, useMemo, useState } from "react";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
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

import type { Intern } from "../types/Intern";
import type { Mentor } from "../types/Mentor";
import * as internApi from "../services/internApi";

type InternsProps = {
  interns: Intern[];
  setInterns: React.Dispatch<React.SetStateAction<Intern[]>>;
  mentors: Mentor[];
};

type Role = "HR" | "MENTOR" | "INTERN" | null;

function toUiIntern(dto: internApi.InternDto): Intern {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    department: dto.department ?? "",
    mentor: dto.mentorName ?? "",
    mentorId: dto.mentorId,
    status: dto.status ?? "Active",
    userId: dto.userId,
  };
}

function Interns({
  interns,
  setInterns,
  mentors,
}: InternsProps) {
  const role =
    (localStorage.getItem("role") as Role) || "HR";

  const userName =
    localStorage.getItem("name") || "";

  const isHr = role === "HR";
  const isMentor = role === "MENTOR";
  const isIntern = role === "INTERN";

  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const [editIndex, setEditIndex] =
    useState<number | null>(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [departmentFilter, setDepartmentFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [selectedIntern, setSelectedIntern] =
    useState<Intern>({
      id: 0,
      name: "",
      email: "",
      department: "",
      mentor: userName,
      status: "Active",
    });

  useEffect(() => {
    let cancelled = false;
    internApi
      .listInterns()
      .then((list) => {
        if (!cancelled) setInterns(list.map(toUiIntern));
      })
      .catch(() => {
        if (!cancelled) setToast({ message: "Failed to load interns.", severity: "error" });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleInterns = useMemo(() => {
    if (isHr) return interns;

    if (isMentor)
      return interns.filter(
        (i) => i.mentor === userName
      );

    if (isIntern)
      return interns.filter(
        (i) => i.name === userName
      );

    return interns;
  }, [
    interns,
    role,
    userName,
  ]);

  const departments = [
    "All",
    ...Array.from(
      new Set(
        visibleInterns.map(
          (i) => i.department
        )
      )
    ),
  ];

  const filteredInterns =
    visibleInterns
      .filter(
        (intern) =>
          intern.name
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            ) ||
          (intern.email || "")
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            )
      )
      .filter(
        (intern) =>
          departmentFilter === "All" ||
          intern.department ===
            departmentFilter
      )
      .filter(
        (intern) =>
          statusFilter === "All" ||
          intern.status === statusFilter
      );

  const totalInterns =
    visibleInterns.length;

  const activeInterns =
    visibleInterns.filter(
      (i) => i.status === "Active"
    ).length;

  const inactiveInterns =
    visibleInterns.filter(
      (i) => i.status === "Inactive"
    ).length;

  const uniqueDepartments =
    new Set(
      visibleInterns.map(
        (i) => i.department
      )
    ).size;

  const canManageInterns = isHr;

  const handleOpenAdd = () => {
    setEditIndex(null);

    setSelectedIntern({
      id: 0,
      name: "",
      email: "",
      department: "",
      mentor: "",
      status: "Active",
    });

    setOpen(true);
  };

  const handleOpenEdit = (
    index: number
  ) => {
    const selected =
      filteredInterns[index];

    const actualIndex =
      interns.findIndex((i) => i.id === selected.id);

    if (actualIndex !== -1) {
      setEditIndex(actualIndex);
      setSelectedIntern(
        interns[actualIndex]
      );
      setOpen(true);
    }
  };

  const handleDelete = (
    index: number
  ) => {
    const selected =
      filteredInterns[index];

    const actualIndex =
      interns.findIndex((i) => i.id === selected.id);

    if (actualIndex !== -1) {
      if (
        window.confirm(
          `Delete ${selected.name}?`
        )
      ) {
        internApi
          .deleteIntern(selected.id)
          .then(() => {
            setInterns(interns.filter((_, i) => i !== actualIndex));
            setToast({ message: "Intern deleted.", severity: "success" });
          })
          .catch(() => setToast({ message: "Failed to delete intern.", severity: "error" }));
      }
    }
  };

  const handleSave = () => {
    if (
      !selectedIntern.name.trim() ||
      !selectedIntern.department.trim()
    ) {
      alert(
        "Please enter Name and Department."
      );
      return;
    }

    const matchedMentor = mentors.find(
      (m) => m.name === selectedIntern.mentor
    );

    const payload: internApi.InternPayload = {
      name: selectedIntern.name,
      email: selectedIntern.email || "",
      department: selectedIntern.department,
      status: selectedIntern.status,
      mentorId: matchedMentor ? matchedMentor.id : selectedIntern.mentorId ?? null,
    };

    if (editIndex !== null) {
      internApi
        .updateIntern(selectedIntern.id, payload)
        .then((dto) => {
          const updated = [...interns];
          updated[editIndex] = toUiIntern(dto);
          setInterns(updated);
          setToast({ message: "Intern updated.", severity: "success" });
        })
        .catch(() => setToast({ message: "Failed to update intern.", severity: "error" }));
    } else {
      internApi
        .createIntern(payload)
        .then((dto) => {
          setInterns([...interns, toUiIntern(dto)]);
          setToast({ message: "Intern created.", severity: "success" });
        })
        .catch(() => setToast({ message: "Failed to create intern.", severity: "error" }));
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
    {/* Add Button */}

    {canManageInterns && (
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 3,
        }}
      >
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
            fontSize: 16,
          }}
        >
          Add Intern
        </Button>
      </Box>
    )}

    {/* Statistics */}

    <Paper
      elevation={2}
      sx={{
        borderRadius: 4,
        p: 4,
        mb: 3,
      }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
  sx={{
    fontWeight: "bold",
  }}
            >
              {totalInterns}
            </Typography>

            <Typography color="text.secondary">
              Total Interns
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
  sx={{
    fontWeight: "bold",
  }}
            >
              {activeInterns}
            </Typography>

            <Typography color="text.secondary">
              Active Interns
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
         <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
  sx={{
    fontWeight: "bold",
  }}
            >
              {inactiveInterns}
            </Typography>

            <Typography color="text.secondary">
              Inactive Interns
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
         <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
  sx={{
    fontWeight: "bold",
  }}
            >
              {uniqueDepartments}
            </Typography>

            <Typography color="text.secondary">
              Departments
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>

    {/* Filters */}

    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 4,
        mb: 3,
      }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            placeholder="Search Intern"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel>
              Department
            </InputLabel>

            <Select
              label="Department"
              value={departmentFilter}
              onChange={(e) =>
                setDepartmentFilter(
                  e.target.value
                )
              }
            >
              {departments.map((dept) => (
                <MenuItem
                  key={dept}
                  value={dept}
                >
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>

            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <MenuItem value="All">
                All
              </MenuItem>

              <MenuItem value="Active">
                Active
              </MenuItem>

              <MenuItem value="Inactive">
                Inactive
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
        {/* Interns Table */}

    <Paper
      elevation={2}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <TableContainer>
        <Table>

          <TableHead
            sx={{
              bgcolor: "#f8fafc",
            }}
          >
            <TableRow>

              <TableCell sx={{ fontWeight: 700 }}>
                Name
              </TableCell>

              <TableCell sx={{ fontWeight: 700 }}>
                Email
              </TableCell>

              <TableCell sx={{ fontWeight: 700 }}>
                Department
              </TableCell>

              <TableCell sx={{ fontWeight: 700 }}>
                Mentor
              </TableCell>

              <TableCell sx={{ fontWeight: 700 }}>
                Status
              </TableCell>

              {canManageInterns && (
                <TableCell
                  align="center"
                  sx={{ fontWeight: 700 }}
                >
                  Actions
                </TableCell>
              )}

            </TableRow>
          </TableHead>

          <TableBody>

            {filteredInterns.length === 0 ? (

              <TableRow>
                <TableCell
                  align="center"
                  colSpan={
                    canManageInterns ? 6 : 5
                  }
                >
                  No interns found.
                </TableCell>
              </TableRow>

            ) : (

              filteredInterns.map(
                (intern, index) => (

                  <TableRow
                    key={index}
                    hover
                  >
                    <TableCell>
                      <Typography
                      sx={{ fontWeight: 600 }}
                      >
                        {intern.name}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {intern.email || "-"}
                    </TableCell>

                    <TableCell>
                      {intern.department}
                    </TableCell>

                    <TableCell>
                      {intern.mentor}
                    </TableCell>

                    <TableCell>

                      <Chip
                        label={intern.status}
                        color={
                          intern.status ===
                          "Active"
                            ? "success"
                            : "default"
                        }
                        size="small"
                      />

                    </TableCell>

                    {canManageInterns && (

                      <TableCell align="center">

                        <IconButton
                          color="primary"
                          onClick={() =>
                            handleOpenEdit(
                              index
                            )
                          }
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() =>
                            handleDelete(
                              index
                            )
                          }
                        >
                          <DeleteIcon />
                        </IconButton>

                      </TableCell>

                    )}

                  </TableRow>

                )
              )

            )}

          </TableBody>

        </Table>
      </TableContainer>
    </Paper>
        {/* Add / Edit Dialog */}

    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editIndex === null
          ? "Add Intern"
          : "Edit Intern"}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>

          <Grid size={12}>
            <TextField
              fullWidth
              label="Intern Name"
              value={selectedIntern.name}
              onChange={(e) =>
                setSelectedIntern({
                  ...selectedIntern,
                  name: e.target.value,
                })
              }
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              label="Email"
              value={selectedIntern.email}
              onChange={(e) =>
                setSelectedIntern({
                  ...selectedIntern,
                  email: e.target.value,
                })
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Department"
              value={selectedIntern.department}
              onChange={(e) =>
                setSelectedIntern({
                  ...selectedIntern,
                  department: e.target.value,
                })
              }
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Mentor</InputLabel>
              <Select
                label="Mentor"
                value={selectedIntern.mentor}
                onChange={(e) =>
                  setSelectedIntern({
                    ...selectedIntern,
                    mentor: e.target.value as string,
                  })
                }
              >
                <MenuItem value="">Unassigned</MenuItem>
                {mentors.map((m) => (
                  <MenuItem key={m.id} value={m.name}>
                    {m.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={12}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>

              <Select
                label="Status"
                value={selectedIntern.status}
                onChange={(e) =>
                  setSelectedIntern({
                    ...selectedIntern,
                    status: e.target.value,
                  })
                }
              >
                <MenuItem value="Active">
                  Active
                </MenuItem>

                <MenuItem value="Inactive">
                  Inactive
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>

        <Button
          color="inherit"
          onClick={handleClose}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
        >
          {editIndex === null
            ? "Save"
            : "Update"}
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

export default Interns;