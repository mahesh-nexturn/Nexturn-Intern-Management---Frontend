import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
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

import AddEvaluationDialog from "../components/AddEvaluationDialog";
import EvaluationChart from "../components/EvaluationChart";
import type { Evaluation } from "../types/Evaluation";
import type { Intern } from "../types/Intern";
import * as evaluationApi from "../services/evaluationApi";
import * as internApi from "../services/internApi";

type EvaluationsProps = {
  evaluations: Evaluation[];
  setEvaluations: React.Dispatch<React.SetStateAction<Evaluation[]>>;
};

type Role = "HR" | "MENTOR" | "INTERN" | null;

export function toUiEvaluation(
  dto: evaluationApi.EvaluationDto,
  interns: Intern[] = []
): Evaluation {
  const intern = interns.find((item) => item.id === dto.internId);

  return {
    id: dto.id,
    intern: dto.internName,
    internId: dto.internId,
    mentor: intern?.mentor ?? "",
    mentorId: dto.mentorId ?? intern?.mentorId ?? null,
    technicalRating: dto.technicalRating,
    communicationRating: dto.communicationRating,
    problemSolvingRating: dto.problemSolvingRating,
    overallRating: dto.overallRating,
    feedback: dto.feedback ?? "",
  };
}

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

function Evaluations({ evaluations, setEvaluations }: EvaluationsProps) {
  const role = localStorage.getItem("role") as Role;
  const userName = localStorage.getItem("name") || "";

  const isHr = role === "HR";
  const isMentor = role === "MENTOR";
  const isIntern = role === "INTERN";
  const canManageEvaluations = isHr || isMentor;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);
  const [availableInterns, setAvailableInterns] = useState<Intern[]>([]);

  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation>({
    id: 0,
    intern: "",
    internId: null,
    mentor: "",
    mentorId: null,
    technicalRating: 1,
    communicationRating: 1,
    problemSolvingRating: 1,
    overallRating: 1,
    feedback: "",
  });

  useEffect(() => {
    let cancelled = false;

    evaluationApi
      .listEvaluations()
      .then((list) => {
        if (!cancelled) setEvaluations(list.map((item) => toUiEvaluation(item)));
      })
      .catch(() => {
        if (!cancelled) setToast({ message: "Failed to load evaluations.", severity: "error" });
      });

    internApi
      .listInterns()
      .then((list) => {
        if (!cancelled) setAvailableInterns(list.map(toUiIntern));
      })
      .catch(() => {
        if (!cancelled) setToast({ message: "Failed to load interns.", severity: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [setEvaluations]);

  const evaluationsWithRelations = useMemo(
    () =>
      evaluations.map((evaluation) => {
        const intern = availableInterns.find((item) => item.id === evaluation.internId);
        return {
          ...evaluation,
          intern: evaluation.intern || intern?.name || "",
          mentor: evaluation.mentor || intern?.mentor || "",
          mentorId: evaluation.mentorId ?? intern?.mentorId ?? null,
        };
      }),
    [availableInterns, evaluations]
  );

  const visibleEvaluations = useMemo(() => {
    if (isHr) return evaluationsWithRelations;
    if (isMentor) return evaluationsWithRelations.filter((evaluation) => evaluation.mentor === userName);
    if (isIntern) return evaluationsWithRelations.filter((evaluation) => evaluation.intern === userName);
    return [];
  }, [evaluationsWithRelations, isHr, isIntern, isMentor, userName]);

  const filteredEvaluations = useMemo(
    () =>
      visibleEvaluations.filter((evaluation) =>
        evaluation.intern.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm, visibleEvaluations]
  );

  const total = visibleEvaluations.length;
  const technicalAverage =
    total === 0
      ? 0
      : visibleEvaluations.reduce((sum, evaluation) => sum + evaluation.technicalRating, 0) / total;
  const communicationAverage =
    total === 0
      ? 0
      : visibleEvaluations.reduce((sum, evaluation) => sum + evaluation.communicationRating, 0) / total;
  const overallAverage =
    total === 0
      ? 0
      : visibleEvaluations.reduce((sum, evaluation) => sum + evaluation.overallRating, 0) / total;

  const handleOpen = () => {
    setEditId(null);
    setSelectedEvaluation({
      id: 0,
      intern: "",
      internId: null,
      mentor: "",
      mentorId: null,
      technicalRating: 1,
      communicationRating: 1,
      problemSolvingRating: 1,
      overallRating: 1,
      feedback: "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const saveEvaluation = async (evaluation: Evaluation) => {
    if (!evaluation.internId) {
      alert("Please select an intern.");
      return;
    }

    const selectedIntern = availableInterns.find((intern) => intern.id === evaluation.internId);
    const payload: evaluationApi.EvaluationPayload = {
      internId: evaluation.internId,
      mentorId: selectedIntern?.mentorId ?? evaluation.mentorId ?? null,
      technicalRating: evaluation.technicalRating,
      communicationRating: evaluation.communicationRating,
      problemSolvingRating: evaluation.problemSolvingRating,
      overallRating: evaluation.overallRating,
      feedback: evaluation.feedback,
    };

    try {
      if (editId !== null) {
        const updated = await evaluationApi.updateEvaluation(editId, payload);
        setEvaluations((prev) =>
          prev.map((item) => (item.id === editId ? toUiEvaluation(updated, availableInterns) : item))
        );
        setToast({ message: "Evaluation updated successfully.", severity: "success" });
      } else {
        const created = await evaluationApi.createEvaluation(payload);
        setEvaluations((prev) => [...prev, toUiEvaluation(created, availableInterns)]);
        setToast({ message: "Evaluation created successfully.", severity: "success" });
      }

      setEditId(null);
      setOpen(false);
    } catch {
      setToast({ message: "Failed to save evaluation.", severity: "error" });
    }
  };

  const editEvaluation = (index: number) => {
    const evaluation = filteredEvaluations[index];
    setEditId(evaluation.id);
    setSelectedEvaluation(evaluation);
    setOpen(true);
  };

  const deleteEvaluation = async (index: number) => {
    const evaluation = filteredEvaluations[index];

    if (!window.confirm(`Delete evaluation for "${evaluation.intern}"?`)) {
      return;
    }

    try {
      await evaluationApi.deleteEvaluation(evaluation.id);
      setEvaluations((prev) => prev.filter((item) => item.id !== evaluation.id));
      setToast({ message: "Evaluation deleted successfully.", severity: "success" });
    } catch {
      setToast({ message: "Failed to delete evaluation.", severity: "error" });
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Evaluations</Typography>

        {canManageEvaluations && (
          <Button variant="contained" onClick={handleOpen}>
            Add Evaluation
          </Button>
        )}
      </Box>

      <EvaluationChart
        total={total}
        technicalAverage={technicalAverage}
        communicationAverage={communicationAverage}
        overallAverage={overallAverage}
      />

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Search Intern"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Intern</TableCell>
              <TableCell>Mentor</TableCell>
              <TableCell>Technical</TableCell>
              <TableCell>Communication</TableCell>
              <TableCell>Problem Solving</TableCell>
              <TableCell>Overall</TableCell>
              <TableCell>Feedback</TableCell>
              {canManageEvaluations && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredEvaluations.length === 0 ? (
              <TableRow>
                <TableCell align="center" colSpan={canManageEvaluations ? 8 : 7}>
                  No evaluations found.
                </TableCell>
              </TableRow>
            ) : (
              filteredEvaluations.map((evaluation, index) => (
                <TableRow key={evaluation.id}>
                  <TableCell>{evaluation.intern}</TableCell>
                  <TableCell>{evaluation.mentor || "-"}</TableCell>
                  <TableCell>{evaluation.technicalRating}</TableCell>
                  <TableCell>{evaluation.communicationRating}</TableCell>
                  <TableCell>{evaluation.problemSolvingRating}</TableCell>
                  <TableCell>{evaluation.overallRating}</TableCell>
                  <TableCell>{evaluation.feedback}</TableCell>
                  {canManageEvaluations && (
                    <TableCell>
                      <IconButton color="primary" onClick={() => editEvaluation(index)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => deleteEvaluation(index)}>
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

      <AddEvaluationDialog
        open={open}
        handleClose={handleClose}
        addEvaluation={saveEvaluation}
        selectedEvaluation={selectedEvaluation}
        interns={availableInterns}
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

export default Evaluations;
