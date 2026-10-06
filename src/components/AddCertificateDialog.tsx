import { useEffect, useMemo, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";

import type { Certificate } from "../types/Certificate";
import type { Intern } from "../types/Intern";

type AddCertificateDialogProps = {
  open: boolean;
  handleClose: () => void;
  addCertificate: (certificate: Certificate) => void;
  selectedCertificate: Certificate;
  interns: Intern[];
};

function AddCertificateDialog({
  open,
  handleClose,
  addCertificate,
  selectedCertificate,
  interns,
}: AddCertificateDialogProps) {
  const [internId, setInternId] = useState<number | "">("");
  const [certificateName, setCertificateName] = useState("");
  const [issuedBy, setIssuedBy] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [status, setStatus] = useState<Certificate["status"]>("Active");

  useEffect(() => {
    setInternId(selectedCertificate.internId ?? "");
    setCertificateName(selectedCertificate.certificateName || "");
    setIssuedBy(selectedCertificate.issuedBy || "");
    setIssueDate(selectedCertificate.issueDate || "");
    setExpiryDate(selectedCertificate.expiryDate || "");
    setStatus(selectedCertificate.status || "Active");
  }, [selectedCertificate]);

  const selectedIntern = useMemo(
    () => interns.find((intern) => intern.id === internId),
    [internId, interns]
  );

  const handleSave = () => {
    if (!internId) {
      alert("Please select an intern.");
      return;
    }

    addCertificate({
      id: selectedCertificate.id,
      intern: selectedIntern?.name || "",
      internId: internId as number,
      mentor: selectedIntern?.mentor || "",
      mentorId: selectedIntern?.mentorId ?? null,
      certificateName,
      issuedBy,
      issueDate,
      expiryDate,
      status,
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Certificate Details</DialogTitle>

      <DialogContent>
        <TextField
          select
          fullWidth
          margin="dense"
          label="Intern"
          value={internId}
          onChange={(e) => setInternId(e.target.value === "" ? "" : Number(e.target.value))}
        >
          {interns.map((intern) => (
            <MenuItem key={intern.id} value={intern.id}>
              {intern.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField fullWidth margin="dense" label="Mentor" value={selectedIntern?.mentor || ""} disabled />

        <TextField
          fullWidth
          margin="dense"
          label="Certificate Name"
          value={certificateName}
          onChange={(e) => setCertificateName(e.target.value)}
        />

        <TextField
          fullWidth
          margin="dense"
          label="Issued By"
          value={issuedBy}
          onChange={(e) => setIssuedBy(e.target.value)}
        />

        <TextField
          fullWidth
          type="date"
          margin="dense"
          label="Issue Date"
          value={issueDate}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => setIssueDate(e.target.value)}
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
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Certificate["status"])}
        >
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Expired">Expired</MenuItem>
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

export default AddCertificateDialog;
