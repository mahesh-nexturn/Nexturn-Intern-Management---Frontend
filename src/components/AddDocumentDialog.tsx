import { useEffect, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import type { Document } from "../types/Document";

type AddDocumentDialogProps = {
  open: boolean;
  handleClose: () => void;
  addDocument: (document: Document, file?: File | null) => void;
  selectedDocument: Document;
};

function AddDocumentDialog({
  open,
  handleClose,
  addDocument,
  selectedDocument,
}: AddDocumentDialogProps) {
  const userName = localStorage.getItem("name") || "";

  const [documentType, setDocumentType] = useState<Document["documentType"]>("Resume");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    setDocumentType(selectedDocument.documentType || "Resume");
    setFile(null);
  }, [selectedDocument]);

  const handleSave = () => {
    if (!file) {
      alert("Please choose a file.");
      return;
    }

    addDocument(
      {
        id: selectedDocument.id,
        fileName: file.name,
        fileUrl: selectedDocument.fileUrl,
        documentType,
        uploadedBy: userName,
        uploadedByUserId: selectedDocument.uploadedByUserId ?? null,
        uploadDate: selectedDocument.uploadDate || "",
      },
      file
    );

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload Document</DialogTitle>

      <DialogContent>
        <TextField
          select
          fullWidth
          margin="dense"
          label="Document Type"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as Document["documentType"])}
        >
          <MenuItem value="Resume">Resume</MenuItem>
          <MenuItem value="Certificate">Certificate</MenuItem>
          <MenuItem value="Offer Letter">Offer Letter</MenuItem>
          <MenuItem value="Report">Report</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </TextField>

        <Button component="label" variant="outlined" sx={{ mt: 2 }}>
          Choose File
          <input
            hidden
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Button>

        <Typography sx={{ mt: 1 }} color="text.secondary">
          {file?.name || "No file selected"}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddDocumentDialog;
