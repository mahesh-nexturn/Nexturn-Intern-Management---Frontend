import { useEffect, useState } from "react";

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

import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";

import type { Document } from "../types/Document";

import AddDocumentDialog from "../components/AddDocumentDialog";
import DocumentChart from "../components/DocumentChart";
import * as documentApi from "../services/documentApi";

type DocumentsProps = {
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
};

export function toUiDocument(dto: documentApi.DocumentDto): Document {
  return {
    id: dto.id,
    fileName: dto.fileName,
    fileUrl: dto.fileUrl,
    documentType: dto.documentType as Document["documentType"],
    uploadedBy: dto.uploadedByName,
    uploadedByUserId: dto.uploadedByUserId,
    uploadDate: dto.uploadDate ? dto.uploadDate.replace("T", " ").slice(0, 16) : "",
  };
}

function Documents({
  documents,
  setDocuments,
}: DocumentsProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [toast, setToast] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const [selectedDocument, setSelectedDocument] = useState<Document>({
    id: 0,
    fileName: "",
    documentType: "Resume",
    uploadedBy: "",
    uploadDate: "",
  });

  const userName = localStorage.getItem("name") || "";
  const canManageDocuments = true;

  useEffect(() => {
    documentApi
      .listDocuments()
      .then((list) => setDocuments(list.map(toUiDocument)))
      .catch(() => setToast({ message: "Failed to load documents.", severity: "error" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleDocuments = documents;

  const filteredDocuments = visibleDocuments
    .filter((item) => item.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((item) => typeFilter === "All" || item.documentType === typeFilter);

  const totalDocuments = visibleDocuments.length;
  const resumeCount = visibleDocuments.filter((item) => item.documentType === "Resume").length;
  const certificateCount = visibleDocuments.filter((item) => item.documentType === "Certificate").length;
  const reportCount = visibleDocuments.filter((item) => item.documentType === "Report").length;

  const handleOpen = () => {
    setSelectedDocument({
      id: 0,
      fileName: "",
      documentType: "Resume",
      uploadedBy: userName,
      uploadDate: "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const saveDocument = async (item: Document, file?: File | null) => {
    if (!file) {
      alert("Please choose a file to upload.");
      return;
    }

    try {
      const created = await documentApi.uploadDocument({
        file,
        documentType: item.documentType,
      });
      setDocuments((prev) => [...prev, toUiDocument(created)]);
      setToast({ message: "Document uploaded successfully.", severity: "success" });
      setOpen(false);
    } catch {
      setToast({ message: "Failed to upload document.", severity: "error" });
    }
  };

  const deleteDocument = async (id: number) => {
    try {
      await documentApi.deleteDocument(id);
      setDocuments((prev) => prev.filter((item) => item.id !== id));
      setToast({ message: "Document deleted successfully.", severity: "success" });
    } catch {
      setToast({ message: "Failed to delete document.", severity: "error" });
    }
  };

  const downloadDocument = async (id: number, fileName: string) => {
    try {
      const blob = await documentApi.downloadDocument(id);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setToast({ message: "Failed to download document.", severity: "error" });
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
        <Typography variant="h4">Documents</Typography>

        {canManageDocuments && (
          <Button variant="contained" onClick={handleOpen}>
            Upload Document
          </Button>
        )}
      </Box>

      <DocumentChart
        total={totalDocuments}
        resumes={resumeCount}
        certificates={certificateCount}
        reports={reportCount}
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
          label="Search Document"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Type</InputLabel>

          <Select
            value={typeFilter}
            label="Type"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Resume">Resume</MenuItem>
            <MenuItem value="Certificate">Certificate</MenuItem>
            <MenuItem value="Offer Letter">Offer Letter</MenuItem>
            <MenuItem value="Report">Report</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Uploaded By</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell align="center" colSpan={5}>
                  No documents found.
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.fileName}</TableCell>

                  <TableCell>
                    <Chip label={item.documentType} color="primary" />
                  </TableCell>

                  <TableCell>{item.uploadedBy}</TableCell>

                  <TableCell>{item.uploadDate}</TableCell>

                  <TableCell>
                    <IconButton color="success" onClick={() => downloadDocument(item.id, item.fileName)}>
                      <DownloadIcon />
                    </IconButton>

                    <IconButton color="error" onClick={() => deleteDocument(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddDocumentDialog
        open={open}
        handleClose={handleClose}
        addDocument={saveDocument}
        selectedDocument={selectedDocument}
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

export default Documents;
