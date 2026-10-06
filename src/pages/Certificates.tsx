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

import AddCertificateDialog from "../components/AddCertificateDialog";
import CertificateChart from "../components/CertificateChart";
import type { Certificate } from "../types/Certificate";
import type { Intern } from "../types/Intern";
import * as certificateApi from "../services/certificateApi";
import * as internApi from "../services/internApi";

type CertificatesProps = {
  certificates: Certificate[];
  setCertificates: React.Dispatch<React.SetStateAction<Certificate[]>>;
};

type Role = "HR" | "MENTOR" | "INTERN" | null;

function toUiCertificate(dto: certificateApi.CertificateDto): Certificate {
  return {
    id: dto.id,
    intern: dto.internName,
    internId: dto.internId,
    mentor: "",
    mentorId: dto.mentorId,
    certificateName: dto.certificateName,
    issuedBy: dto.issuedBy ?? "",
    issueDate: dto.issueDate ?? "",
    expiryDate: dto.expiryDate ?? "",
    status: dto.status as Certificate["status"],
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

function Certificates({ certificates, setCertificates }: CertificatesProps) {
  const role = localStorage.getItem("role") as Role;
  const userName = localStorage.getItem("name") || "";

  const isHr = role === "HR";
  const isMentor = role === "MENTOR";
  const canManageCertificates = isHr;

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);
  const [availableInterns, setAvailableInterns] = useState<Intern[]>([]);

  const [selectedCertificate, setSelectedCertificate] = useState<Certificate>({
    id: 0,
    intern: "",
    internId: null,
    mentor: "",
    mentorId: null,
    certificateName: "",
    issuedBy: "",
    issueDate: "",
    expiryDate: "",
    status: "Active",
  });

  useEffect(() => {
    let cancelled = false;

    certificateApi
      .listCertificates()
      .then((list) => {
        if (!cancelled) setCertificates(list.map(toUiCertificate));
      })
      .catch(() => {
        if (!cancelled) setToast({ message: "Failed to load certificates.", severity: "error" });
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
  }, [setCertificates]);

  const certificatesWithRelations = useMemo(
    () =>
      certificates.map((certificate) => {
        const intern = availableInterns.find((item) => item.id === certificate.internId);
        return {
          ...certificate,
          intern: certificate.intern || intern?.name || "",
          mentor: certificate.mentor || intern?.mentor || "",
          mentorId: certificate.mentorId ?? intern?.mentorId ?? null,
        };
      }),
    [availableInterns, certificates]
  );

  const visibleCertificates = useMemo(() => {
    if (isHr) return certificatesWithRelations;
    if (isMentor) return certificatesWithRelations.filter((certificate) => certificate.mentor === userName);
    return certificatesWithRelations.filter((certificate) => certificate.intern === userName);
  }, [certificatesWithRelations, isHr, isMentor, userName]);

  const filteredCertificates = useMemo(
    () =>
      visibleCertificates
        .filter((certificate) => certificate.intern.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((certificate) => statusFilter === "All" || certificate.status === statusFilter),
    [searchTerm, statusFilter, visibleCertificates]
  );

  const total = visibleCertificates.length;
  const active = visibleCertificates.filter((certificate) => certificate.status === "Active").length;
  const expired = visibleCertificates.filter((certificate) => certificate.status === "Expired").length;
  const currentMonth = new Date().getMonth() + 1;
  const issuedThisMonth = visibleCertificates.filter((certificate) => {
    if (!certificate.issueDate) return false;
    return new Date(certificate.issueDate).getMonth() + 1 === currentMonth;
  }).length;

  const handleOpen = () => {
    setEditId(null);
    setSelectedCertificate({
      id: 0,
      intern: "",
      internId: null,
      mentor: "",
      mentorId: null,
      certificateName: "",
      issuedBy: "",
      issueDate: "",
      expiryDate: "",
      status: "Active",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const saveCertificate = async (certificate: Certificate) => {
    if (!certificate.internId) {
      alert("Please select an intern.");
      return;
    }

    const selectedIntern = availableInterns.find((intern) => intern.id === certificate.internId);
    const payload: certificateApi.CertificatePayload = {
      internId: certificate.internId,
      mentorId: selectedIntern?.mentorId ?? certificate.mentorId ?? null,
      certificateName: certificate.certificateName,
      issuedBy: certificate.issuedBy,
      issueDate: certificate.issueDate,
      expiryDate: certificate.expiryDate,
      status: certificate.status,
    };

    try {
      if (editId !== null) {
        const updated = await certificateApi.updateCertificate(editId, payload);
        setCertificates((prev) => prev.map((item) => (item.id === editId ? toUiCertificate(updated) : item)));
        setToast({ message: "Certificate updated successfully.", severity: "success" });
      } else {
        const created = await certificateApi.createCertificate(payload);
        setCertificates((prev) => [...prev, toUiCertificate(created)]);
        setToast({ message: "Certificate created successfully.", severity: "success" });
      }

      setEditId(null);
      setOpen(false);
    } catch {
      setToast({ message: "Failed to save certificate.", severity: "error" });
    }
  };

  const editCertificate = (index: number) => {
    const certificate = filteredCertificates[index];
    setEditId(certificate.id);
    setSelectedCertificate(certificate);
    setOpen(true);
  };

  const deleteCertificate = async (index: number) => {
    const certificate = filteredCertificates[index];

    if (!window.confirm(`Delete certificate "${certificate.certificateName}" for "${certificate.intern}"?`)) {
      return;
    }

    try {
      await certificateApi.deleteCertificate(certificate.id);
      setCertificates((prev) => prev.filter((item) => item.id !== certificate.id));
      setToast({ message: "Certificate deleted successfully.", severity: "success" });
    } catch {
      setToast({ message: "Failed to delete certificate.", severity: "error" });
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Certificates</Typography>

        {canManageCertificates && (
          <Button variant="contained" onClick={handleOpen}>
            Add Certificate
          </Button>
        )}
      </Box>

      <CertificateChart total={total} active={active} expired={expired} issuedThisMonth={issuedThisMonth} />

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField label="Search Intern" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Expired">Expired</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Intern</TableCell>
              <TableCell>Mentor</TableCell>
              <TableCell>Certificate</TableCell>
              <TableCell>Issued By</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Status</TableCell>
              {canManageCertificates && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredCertificates.length === 0 ? (
              <TableRow>
                <TableCell align="center" colSpan={canManageCertificates ? 8 : 7}>
                  No certificates found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCertificates.map((certificate, index) => (
                <TableRow key={certificate.id}>
                  <TableCell>{certificate.intern}</TableCell>
                  <TableCell>{certificate.mentor || "-"}</TableCell>
                  <TableCell>{certificate.certificateName}</TableCell>
                  <TableCell>{certificate.issuedBy || "-"}</TableCell>
                  <TableCell>{certificate.issueDate || "-"}</TableCell>
                  <TableCell>{certificate.expiryDate || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={certificate.status}
                      color={certificate.status === "Active" ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  {canManageCertificates && (
                    <TableCell>
                      <IconButton color="primary" onClick={() => editCertificate(index)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => deleteCertificate(index)}>
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

      <AddCertificateDialog
        open={open}
        handleClose={handleClose}
        addCertificate={saveCertificate}
        selectedCertificate={selectedCertificate}
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

export default Certificates;
