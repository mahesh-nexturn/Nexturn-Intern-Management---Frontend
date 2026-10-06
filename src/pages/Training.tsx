import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
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

import type { Training as TrainingType } from "../types/Training";
import type { Intern } from "../types/Intern";
import type { Mentor } from "../types/Mentor";

import AddTrainingDialog from "../components/AddTrainingDialog";
import TrainingChart from "../components/TrainingChart";
import * as trainingApi from "../services/trainingApi";
import { statusToBackend, statusToUi } from "../services/trainingApi";

type TrainingProps = {
  trainings: TrainingType[];
  setTrainings: React.Dispatch<React.SetStateAction<TrainingType[]>>;
  interns: Intern[];
  mentors: Mentor[];
};

type Role = "HR" | "MENTOR" | "INTERN" | null;

export function toUiTraining(
  dto: trainingApi.TrainingDto,
  interns: Intern[],
  mentors: Mentor[]
): TrainingType {
  return {
    id: dto.id,
    title: dto.title,
    assignedTo: dto.internName,
    internId: dto.internId,
    mentor: mentors.find((mentor) => mentor.id === dto.mentorId)?.name
      ?? interns.find((intern) => intern.id === dto.internId)?.mentor
      ?? "",
    mentorId: dto.mentorId,
    startDate: dto.startDate || "",
    endDate: dto.endDate || "",
    status: statusToUi(dto.status) as TrainingType["status"],
    progress: dto.progress,
  };
}

function Training({
  trainings,
  setTrainings,
  interns,
  mentors,
}: TrainingProps) {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const [selectedTraining, setSelectedTraining] = useState<TrainingType>({
    id: 0,
    title: "",
    assignedTo: "",
    internId: null,
    mentor: "",
    mentorId: null,
    startDate: "",
    endDate: "",
    status: "Not Started",
    progress: 0,
  });

  const role = localStorage.getItem("role") as Role;
  const userName = localStorage.getItem("name") || "";

  const isHr = role === "HR";
  const isMentor = role === "MENTOR";
  const isIntern = role === "INTERN";
  const canManageTrainings = isHr || isMentor;

  useEffect(() => {
    trainingApi
      .listTrainings()
      .then((list) => setTrainings(list.map((item) => toUiTraining(item, interns, mentors))))
      .catch(() => setToast({ message: "Failed to load trainings.", severity: "error" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleTrainings = useMemo(() => {
    if (isHr) return trainings;
    if (isMentor) return trainings.filter((training) => training.mentor === userName);
    if (isIntern) return trainings.filter((training) => training.assignedTo === userName);
    return [];
  }, [isHr, isIntern, isMentor, trainings, userName]);

  const filteredTrainings = visibleTrainings
    .filter((training) => training.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((training) => statusFilter === "All" || training.status === statusFilter);

  const totalTrainings = visibleTrainings.length;
  const notStartedCount = visibleTrainings.filter((training) => training.status === "Not Started").length;
  const inProgressCount = visibleTrainings.filter((training) => training.status === "In Progress").length;
  const completedCount = visibleTrainings.filter((training) => training.status === "Completed").length;

  const handleOpen = () => {
    setEditId(null);
    setSelectedTraining({
      id: 0,
      title: "",
      assignedTo: "",
      internId: null,
      mentor: "",
      mentorId: null,
      startDate: "",
      endDate: "",
      status: "Not Started",
      progress: 0,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const saveTraining = async (training: TrainingType) => {
    if (!training.internId) {
      alert("Please select an intern.");
      return;
    }

    const payload: trainingApi.TrainingPayload = {
      title: training.title,
      internId: training.internId,
      mentorId: training.mentorId ?? null,
      startDate: training.startDate || undefined,
      endDate: training.endDate || undefined,
      status: statusToBackend(training.status),
      progress: training.progress,
    };

    try {
      if (editId !== null) {
        const updated = await trainingApi.updateTraining(editId, payload);
        setTrainings((prev) =>
          prev.map((item) =>
            item.id === editId ? toUiTraining(updated, interns, mentors) : item
          )
        );
        setToast({ message: "Training updated successfully.", severity: "success" });
      } else {
        const created = await trainingApi.createTraining(payload);
        setTrainings((prev) => [...prev, toUiTraining(created, interns, mentors)]);
        setToast({ message: "Training created successfully.", severity: "success" });
      }

      setEditId(null);
      setOpen(false);
    } catch {
      setToast({ message: "Failed to save training.", severity: "error" });
    }
  };

  const editTraining = (id: number) => {
    const training = filteredTrainings.find((item) => item.id === id);
    if (!training) return;

    setEditId(training.id);
    setSelectedTraining(training);
    setOpen(true);
  };

  const deleteTraining = async (id: number) => {
    try {
      await trainingApi.deleteTraining(id);
      setTrainings((prev) => prev.filter((item) => item.id !== id));
      setToast({ message: "Training deleted successfully.", severity: "success" });
    } catch {
      setToast({ message: "Failed to delete training.", severity: "error" });
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h4">Training</Typography>

        {canManageTrainings && (
          <Button variant="contained" onClick={handleOpen}>
            Add Training
          </Button>
        )}
      </Box>

      <TrainingChart
        total={totalTrainings}
        notStarted={notStartedCount}
        inProgress={inProgressCount}
        completed={completedCount}
      />

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <TextField
          label="Search Training"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Not Started">Not Started</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Mentor</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Progress</TableCell>
              {canManageTrainings && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTrainings.length === 0 ? (
              <TableRow>
                <TableCell align="center" colSpan={canManageTrainings ? 8 : 7}>
                  No training records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTrainings.map((training) => (
                <TableRow key={training.id}>
                  <TableCell>{training.title}</TableCell>
                  <TableCell>{training.assignedTo}</TableCell>
                  <TableCell>{training.mentor || "-"}</TableCell>
                  <TableCell>{training.startDate}</TableCell>
                  <TableCell>{training.endDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={training.status}
                      color={
                        training.status === "Completed"
                          ? "success"
                          : training.status === "In Progress"
                          ? "primary"
                          : "warning"
                      }
                    />
                  </TableCell>

                  <TableCell sx={{ minWidth: 150 }}>
                    <LinearProgress variant="determinate" value={training.progress} />

                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {training.progress}%
                    </Typography>
                  </TableCell>

                  {canManageTrainings && (
                    <TableCell>
                      <IconButton color="primary" onClick={() => editTraining(training.id)}>
                        <EditIcon />
                      </IconButton>

                      <IconButton color="error" onClick={() => deleteTraining(training.id)}>
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

      <AddTrainingDialog
        open={open}
        handleClose={handleClose}
        addTraining={saveTraining}
        selectedTraining={selectedTraining}
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

export default Training;
