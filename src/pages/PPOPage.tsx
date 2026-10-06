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

import AddPPODialog from "../components/AddPPODialog";
import PPOChart from "../components/PPOChart";
import type { PPO } from "../types/PPO";
import type { Intern } from "../types/Intern";
import * as ppoApi from "../services/ppoApi";
import * as internApi from "../services/internApi";

type PPOProps = {
  ppoData: PPO[];
  setPPOData: React.Dispatch<React.SetStateAction<PPO[]>>;
};

type Role = "HR" | "MENTOR" | "INTERN" | null;

function toUiPpo(dto: ppoApi.PpoDto): PPO {
  return {
    id: dto.id,
    intern: dto.internName,
    internId: dto.internId,
    mentor: dto.mentorName ?? "",
    mentorId: dto.mentorId,
    attendance: dto.attendancePct,
    trainingCompletion: dto.trainingCompletionPct,
    technicalScore: dto.technicalScore,
    communicationScore: dto.communicationScore,
    overallScore: dto.overallScore,
    mentorRecommendation: (dto.mentorRecommendation as PPO["mentorRecommendation"]) ?? "Yes",
    hrRecommendation: (dto.hrRecommendation as PPO["hrRecommendation"]) ?? "Yes",
    status: dto.status as PPO["status"],
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

function PPOPage({ ppoData, setPPOData }: PPOProps) {
  const role = localStorage.getItem("role") as Role;
  const userName = localStorage.getItem("name") || "";

  const isHr = role === "HR";
  const isMentor = role === "MENTOR";
  const isIntern = role === "INTERN";
  const canEditPPO = isHr || isMentor;
  const canDeletePPO = isHr;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);
  const [availableInterns, setAvailableInterns] = useState<Intern[]>([]);

  const [selectedPPO, setSelectedPPO] = useState<PPO>({
    id: 0,
    intern: "",
    internId: null,
    mentor: "",
    mentorId: null,
    attendance: 0,
    trainingCompletion: 0,
    technicalScore: 0,
    communicationScore: 0,
    overallScore: 0,
    mentorRecommendation: "Yes",
    hrRecommendation: "Yes",
    status: "Eligible",
  });

  useEffect(() => {
    let cancelled = false;

    const loadPpo = async () => {
      try {
        if (role === "INTERN") {
          const item = await ppoApi.getMyPpo();
          if (!cancelled) setPPOData(item ? [toUiPpo(item)] : []);
          return;
        }

        const list = await ppoApi.listPpo();
        if (!cancelled) setPPOData(list.map(toUiPpo));
      } catch {
        if (!cancelled) setToast({ message: "Failed to load PPO records.", severity: "error" });
      }
    };

    void loadPpo();

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
  }, [role, setPPOData]);

  const visiblePPO = useMemo(() => {
    if (isHr) return ppoData;
    if (isMentor) return ppoData.filter((ppo) => ppo.mentor === userName);
    if (isIntern) return ppoData.filter((ppo) => ppo.intern === userName);
    return [];
  }, [isHr, isIntern, isMentor, ppoData, userName]);

  const filteredPPO = useMemo(
    () =>
      visiblePPO
        .filter((ppo) => ppo.intern.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((ppo) => statusFilter === "All" || ppo.status === statusFilter),
    [searchTerm, statusFilter, visiblePPO]
  );

  const total = visiblePPO.length;
  const eligible = visiblePPO.filter((ppo) => ppo.status === "Eligible").length;
  const notEligible = visiblePPO.filter((ppo) => ppo.status === "Not Eligible").length;
  const offered = visiblePPO.filter((ppo) => ppo.status === "Offered").length;

  const handleOpen = () => {
    setEditId(null);
    setSelectedPPO({
      id: 0,
      intern: "",
      internId: null,
      mentor: "",
      mentorId: null,
      attendance: 0,
      trainingCompletion: 0,
      technicalScore: 0,
      communicationScore: 0,
      overallScore: 0,
      mentorRecommendation: "Yes",
      hrRecommendation: "Yes",
      status: "Eligible",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const savePPO = async (ppo: PPO) => {
    if (!ppo.internId) {
      alert("Please select an intern.");
      return;
    }

    const selectedIntern = availableInterns.find((intern) => intern.id === ppo.internId);
    const payload: ppoApi.PpoPayload = {
      internId: ppo.internId,
      mentorId: selectedIntern?.mentorId ?? ppo.mentorId ?? null,
      attendancePct: ppo.attendance,
      trainingCompletionPct: ppo.trainingCompletion,
      technicalScore: ppo.technicalScore,
      communicationScore: ppo.communicationScore,
      overallScore: ppo.overallScore,
      mentorRecommendation: ppo.mentorRecommendation,
      hrRecommendation: ppo.hrRecommendation,
      status: ppo.status,
    };

    try {
      if (editId !== null) {
        const updated = await ppoApi.updatePpo(editId, payload);
        setPPOData((prev) => prev.map((item) => (item.id === editId ? toUiPpo(updated) : item)));
        setToast({ message: "PPO record updated successfully.", severity: "success" });
      } else {
        const created = await ppoApi.createPpo(payload);
        setPPOData((prev) => [...prev, toUiPpo(created)]);
        setToast({ message: "PPO record created successfully.", severity: "success" });
      }

      setEditId(null);
      setOpen(false);
    } catch {
      setToast({ message: "Failed to save PPO record.", severity: "error" });
    }
  };

  const editPPO = (index: number) => {
    const ppo = filteredPPO[index];
    setEditId(ppo.id);
    setSelectedPPO(ppo);
    setOpen(true);
  };

  const deletePPO = async (index: number) => {
    const ppo = filteredPPO[index];

    if (!window.confirm(`Delete PPO record for "${ppo.intern}"?`)) {
      return;
    }

    try {
      await ppoApi.deletePpo(ppo.id);
      setPPOData((prev) => prev.filter((item) => item.id !== ppo.id));
      setToast({ message: "PPO record deleted successfully.", severity: "success" });
    } catch {
      setToast({ message: "Failed to delete PPO record.", severity: "error" });
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">PPO Management</Typography>

        {canEditPPO && (
          <Button variant="contained" onClick={handleOpen}>
            Add PPO
          </Button>
        )}
      </Box>

      <PPOChart total={total} eligible={eligible} notEligible={notEligible} offered={offered} />

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField label="Search Intern" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Eligible">Eligible</MenuItem>
            <MenuItem value="Not Eligible">Not Eligible</MenuItem>
            <MenuItem value="Offered">Offered</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Intern</TableCell>
              <TableCell>Mentor</TableCell>
              <TableCell>Attendance</TableCell>
              <TableCell>Training</TableCell>
              <TableCell>Technical</TableCell>
              <TableCell>Communication</TableCell>
              <TableCell>Overall</TableCell>
              <TableCell>Status</TableCell>
              {(canEditPPO || canDeletePPO) && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredPPO.length === 0 ? (
              <TableRow>
                <TableCell align="center" colSpan={canEditPPO || canDeletePPO ? 9 : 8}>
                  No PPO records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPPO.map((ppo, index) => (
                <TableRow key={ppo.id}>
                  <TableCell>{ppo.intern}</TableCell>
                  <TableCell>{ppo.mentor || "-"}</TableCell>
                  <TableCell>{ppo.attendance}%</TableCell>
                  <TableCell>{ppo.trainingCompletion}%</TableCell>
                  <TableCell>{ppo.technicalScore}</TableCell>
                  <TableCell>{ppo.communicationScore}</TableCell>
                  <TableCell>{ppo.overallScore}</TableCell>
                  <TableCell>
                    <Chip
                      label={ppo.status}
                      color={ppo.status === "Offered" ? "success" : ppo.status === "Eligible" ? "info" : "default"}
                      size="small"
                    />
                  </TableCell>
                  {(canEditPPO || canDeletePPO) && (
                    <TableCell>
                      {canEditPPO && (
                        <IconButton color="primary" onClick={() => editPPO(index)}>
                          <EditIcon />
                        </IconButton>
                      )}
                      {canDeletePPO && (
                        <IconButton color="error" onClick={() => deletePPO(index)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddPPODialog
        open={open}
        handleClose={handleClose}
        addPPO={savePPO}
        selectedPPO={selectedPPO}
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

export default PPOPage;
