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

import DeleteIcon from "@mui/icons-material/Delete";

import { useAuth, type UserRole } from "../context/AuthContext";
import * as feedbackApi from "../services/feedbackApi";

type ToastState = {
  message: string;
  severity: "success" | "error";
} | null;

type FeedbackFormState = {
  subject: string;
  message: string;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function Feedback() {
  const { user } = useAuth();

  const role = (user?.role ??
    (localStorage.getItem("role") as UserRole | null));
  const isHr = role === "HR";

  const [feedback, setFeedback] =
    useState<feedbackApi.FeedbackDto[]>(
      []
    );

  const [form, setForm] =
    useState<FeedbackFormState>({
      subject: "",
      message: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [toast, setToast] =
    useState<ToastState>(null);

  useEffect(() => {
    let cancelled = false;

    const loadFeedback = async () => {
      setLoading(true);
      try {
        const list = isHr
          ? await feedbackApi.listAllFeedback()
          : await feedbackApi.listMyFeedback();

        if (!cancelled) {
          setFeedback(list);
        }
      } catch {
        if (!cancelled) {
          setToast({
            message:
              "Failed to load feedback.",
            severity: "error",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadFeedback();

    return () => {
      cancelled = true;
    };
  }, [isHr]);

  const totalFeedback = feedback.length;

  const feedbackThisWeek = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo =
      now - 7 * 24 * 60 * 60 * 1000;

    return feedback.filter((item) => {
      const createdAt =
        new Date(item.createdAt).getTime();
      return createdAt >= sevenDaysAgo;
    }).length;
  }, [feedback]);

  const handleSubmit = async () => {
    if (!form.message.trim()) {
      setToast({
        message:
          "Message is required.",
        severity: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const created =
        await feedbackApi.createFeedback({
          subject:
            form.subject.trim() ||
            undefined,
          message:
            form.message.trim(),
        });

      setFeedback((current) => [
        created,
        ...current,
      ]);
      setForm({
        subject: "",
        message: "",
      });
      setToast({
        message:
          "Feedback submitted.",
        severity: "success",
      });
    } catch {
      setToast({
        message:
          "Failed to submit feedback.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (
    id: number
  ) => {
    const ok = window.confirm(
      "Delete this feedback entry?"
    );

    if (!ok) return;

    try {
      await feedbackApi.deleteFeedback(id);
      setFeedback((current) =>
        current.filter(
          (item) => item.id !== id
        )
      );
      setToast({
        message:
          "Feedback deleted.",
        severity: "success",
      });
    } catch {
      setToast({
        message:
          "Failed to delete feedback.",
        severity: "error",
      });
    }
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
          justifyContent:
            "space-between",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800 }}
          >
            Feedback
          </Typography>
          <Typography
            sx={{
              color:
                "text.secondary",
              mt: 0.5,
            }}
          >
            {isHr
              ? "Review and manage submitted feedback."
              : "Share your feedback with the team."}
          </Typography>
        </Box>
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
              md: "repeat(3, 1fr)",
            },
            gap: 2,
            textAlign: "center",
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{ fontWeight: 800 }}
            >
              {totalFeedback}
            </Typography>
            <Typography color="text.secondary">
              {isHr
                ? "Total Feedback"
                : "My Feedback"}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="h3"
              sx={{ fontWeight: 800 }}
            >
              {feedbackThisWeek}
            </Typography>
            <Typography color="text.secondary">
              Last 7 Days
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="h3"
              sx={{ fontWeight: 800 }}
            >
              {loading ? "..." : "Live"}
            </Typography>
            <Typography color="text.secondary">
              Data Source
            </Typography>
          </Box>
        </Box>
      </Paper>

      {!isHr && (
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 4,
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Submit Feedback
          </Typography>

          <Box
            sx={{
              display: "grid",
              gap: 2,
            }}
          >
            <TextField
              label="Subject"
              value={form.subject}
              onChange={(e) =>
                setForm({
                  ...form,
                  subject:
                    e.target.value,
                })
              }
              placeholder="Optional subject"
            />

            <TextField
              label="Message"
              multiline
              minRows={4}
              value={form.message}
              onChange={(e) =>
                setForm({
                  ...form,
                  message:
                    e.target.value,
                })
              }
              required
            />

            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "flex-end",
              }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  void handleSubmit();
                }}
                disabled={submitting}
                sx={{
                  textTransform:
                    "none",
                  fontWeight: 700,
                }}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Feedback"}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

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
              sx={{ bgcolor: "#f8fafc" }}
            >
              <TableRow>
                {isHr && (
                  <TableCell
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Submitted By
                  </TableCell>
                )}
                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Subject
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Message
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Created At
                </TableCell>
                {isHr && (
                  <TableCell
                    sx={{
                      fontWeight: 700,
                    }}
                    align="center"
                  >
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {feedback.length === 0 ? (
                <TableRow>
                  <TableCell
                    align="center"
                    colSpan={
                      isHr ? 5 : 3
                    }
                    sx={{ py: 5 }}
                  >
                    <Typography color="text.secondary">
                      {loading
                        ? "Loading feedback..."
                        : "No feedback found."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                feedback.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                  >
                    {isHr && (
                      <TableCell>
                        {
                          item.fromUserName
                        }
                      </TableCell>
                    )}
                    <TableCell>
                      {item.subject?.trim() ||
                        "General"}
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 420,
                        whiteSpace:
                          "pre-wrap",
                        wordBreak:
                          "break-word",
                      }}
                    >
                      {item.message}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(
                        item.createdAt
                      )}
                    </TableCell>
                    {isHr && (
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => {
                            void handleDelete(
                              item.id
                            );
                          }}
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

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        {toast ? (
          <Alert
            severity={toast.severity}
            onClose={() => setToast(null)}
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

export default Feedback;