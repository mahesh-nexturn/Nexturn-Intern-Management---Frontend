import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentIcon from "@mui/icons-material/Assignment";

import * as taskApi from "../services/taskApi";
import * as mentorApi from "../services/mentorApi";

const MAX_COMMENT = 2000;

function statusColor(status: string) {
  if (status === "Completed") return "success";
  if (status === "In Progress") return "primary";
  if (status === "Not Started") return "default";
  return "warning";
}

function priorityColor(priority: string) {
  if (priority === "High") return "error";
  if (priority === "Medium") return "warning";
  return "default";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ mt: 0.25 }}>{children}</Box>
    </Box>
  );
}

function TaskDetail() {
  const { id } = useParams();
  const taskId = Number(id);
  const navigate = useNavigate();

  const [task, setTask] = useState<taskApi.TaskDto | null>(null);
  const [mentorName, setMentorName] = useState("");
  const [comments, setComments] = useState<taskApi.TaskCommentDto[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);

  const myUserId = Number(sessionStorage.getItem("userId"));

  const [editingReq, setEditingReq] = useState(false);
  const [reqDraft, setReqDraft] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingPlan, setEditingPlan] = useState(false);
  const [statusDraft, setStatusDraft] = useState("Not Started");
  const [progressDraft, setProgressDraft] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const saveWork = async (payload: { status?: string; progress?: number; description?: string; title?: string }) => {
    setSaving(true);
    try {
      setTask(await taskApi.updateTaskWork(taskId, payload));
      return true;
    } catch {
      setError("Failed to save changes.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveTitle = async () => {
    if (await saveWork({ title: titleDraft.trim() })) setEditingTitle(false);
  };

  const saveRequirements = async () => {
    if (await saveWork({ description: reqDraft })) setEditingReq(false);
  };

  const savePlanning = async () => {
    const progress = Math.min(100, Math.max(0, progressDraft));
    if (await saveWork({ status: taskApi.statusToBackend(statusDraft), progress })) setEditingPlan(false);
  };

  const saveComment = async (commentId: number) => {
    const content = commentDraft.trim();
    if (!content) return;
    setSaving(true);
    try {
      const updated = await taskApi.editComment(taskId, commentId, content);
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      setEditingCommentId(null);
    } catch {
      setError("Failed to update comment.");
    } finally {
      setSaving(false);
    }
  };

  const load = useCallback(async () => {
    try {
      const [t, c] = await Promise.all([
        taskApi.getTask(taskId),
        taskApi.listComments(taskId),
      ]);
      setTask(t);
      setComments(c);

      if (t.mentorId) {
        mentorApi
          .listMentors()
          .then((list) => setMentorName(list.find((m) => m.id === t.mentorId)?.name ?? ""))
          .catch(() => undefined);
      }
    } catch {
      setError("Unable to load this task.");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void load();
  }, [load]);

  const post = async () => {
    const content = text.trim();
    if (!content) return;
    setPosting(true);
    try {
      const created = await taskApi.addComment(taskId, content);
      setComments((prev) => [...prev, created]);
      setText("");
    } catch {
      setError("Failed to post comment.");
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Task not found."}</Alert>
        <Button sx={{ mt: 2 }} startIcon={<ArrowBackIcon />} onClick={() => navigate("/tasks")}>
          Back to tasks
        </Button>
      </Box>
    );
  }

  const status = taskApi.statusToUi(task.status);

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        "& .edit-btn": { opacity: 0, transition: "opacity 0.15s" },
        "& .hover-edit:hover .edit-btn, & .hover-edit:hover.edit-btn, & .edit-btn:focus-visible": { opacity: 1 },
      }}
    >
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/tasks")} sx={{ mb: 2 }}>
        Back to tasks
      </Button>

      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, borderLeft: "6px solid #b8860b" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.main", mb: 1 }}>
          <AssignmentIcon fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            TASK {task.id}
          </Typography>
        </Box>
        {editingTitle ? (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2, flexWrap: "wrap" }}>
            <TextField
              size="small"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 200 } }}
              sx={{ flex: 1, minWidth: 260 }}
              autoFocus
            />
            <Button onClick={() => setEditingTitle(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="contained" onClick={() => void saveTitle()} disabled={saving || !titleDraft.trim()}>
              Save
            </Button>
          </Box>
        ) : (
          <Box className="hover-edit" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {task.title}
            </Typography>
            <IconButton
              className="edit-btn"
              size="small"
              color="primary"
              aria-label="Edit title"
              onClick={() => {
                setTitleDraft(task.title);
                setEditingTitle(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <Chip label={status} color={statusColor(status)} size="small" />
          <Chip label={`${task.priority} priority`} color={priorityColor(task.priority)} size="small" />
          <Chip label={`${comments.length} Comments`} variant="outlined" size="small" />
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Box>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Box className="hover-edit" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Requirements
              </Typography>
              {!editingReq && (
                <IconButton
                  className="edit-btn"
                  size="small"
                  color="primary"
                  aria-label="Edit requirements"
                  onClick={() => {
                    setReqDraft(task.description || "");
                    setEditingReq(true);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            <Divider sx={{ my: 1.5 }} />
            {editingReq ? (
              <>
                <TextField
                  fullWidth
                  multiline
                  label="Requirements"
                  minRows={4}
                  value={reqDraft}
                  onChange={(e) => setReqDraft(e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 5000 } }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
                  <Button onClick={() => setEditingReq(false)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={() => void saveRequirements()} disabled={saving}>
                    Save
                  </Button>
                </Box>
              </>
            ) : (
              <Typography sx={{ whiteSpace: "pre-wrap" }} color={task.description ? "text.primary" : "text.secondary"}>
                {task.description || "No requirements added."}
              </Typography>
            )}
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Discussion
            </Typography>
            <Divider sx={{ my: 1.5 }} />

            {comments.length === 0 && (
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No comments yet. Start the discussion below.
              </Typography>
            )}

            {comments.map((c) => (
              <Box key={c.id} sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: c.authorId === myUserId ? "#2563eb" : "#6b7280" }}>
                  {c.authorName.charAt(0).toUpperCase()}
                </Avatar>
                <Box className="hover-edit" sx={{ flex: 1, bgcolor: "#f5f7fb", borderRadius: 2, p: 1.5 }}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "baseline", flexWrap: "wrap" }}>
                    <Typography sx={{ fontWeight: 700 }}>{c.authorName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {c.authorRole.charAt(0) + c.authorRole.slice(1).toLowerCase()} ·{" "}
                      {new Date(c.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  {editingCommentId === c.id ? (
                    <>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                        slotProps={{ htmlInput: { maxLength: MAX_COMMENT } }}
                        sx={{ mt: 0.5, bgcolor: "#fff" }}
                      />
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
                        <Button size="small" onClick={() => setEditingCommentId(null)} disabled={saving}>
                          Cancel
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => void saveComment(c.id)}
                          disabled={saving || !commentDraft.trim()}
                        >
                          Save
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>{c.content}</Typography>
                      {c.authorId === myUserId && (
                        <IconButton
                          className="edit-btn"
                          size="small"
                          color="primary"
                          aria-label="Edit comment"
                          sx={{ mt: 0.5 }}
                          onClick={() => {
                            setCommentDraft(c.content);
                            setEditingCommentId(c.id);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </>
                  )}
                </Box>
              </Box>
            ))}

            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="Add a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              slotProps={{ htmlInput: { maxLength: MAX_COMMENT } }}
              helperText={`${text.length}/${MAX_COMMENT}`}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button variant="contained" onClick={() => void post()} disabled={posting || !text.trim()}>
                {posting ? "Posting..." : "Post comment"}
              </Button>
            </Box>
          </Paper>
        </Box>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Box className="hover-edit" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Planning
            </Typography>
            {!editingPlan && (
              <IconButton
                className="edit-btn"
                size="small"
                color="primary"
                aria-label="Edit planning"
                onClick={() => {
                  setStatusDraft(status);
                  setProgressDraft(task.progress);
                  setEditingPlan(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Field label="Assigned To">
            <Typography>{task.internName || "-"}</Typography>
          </Field>
          <Field label="Mentor">
            <Typography>{mentorName || "-"}</Typography>
          </Field>
          <Field label="Priority">
            <Typography>{task.priority}</Typography>
          </Field>
          <Field label="Status">
            {editingPlan ? (
              <TextField select fullWidth size="small" value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)}>
                {["Not Started", "Pending", "In Progress", "Completed"].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Typography>{status}</Typography>
            )}
          </Field>
          <Field label="Due Date">
            <Typography>{task.dueDate || "-"}</Typography>
          </Field>
          <Field label="Progress">
            {editingPlan ? (
              <>
                <Slider
                  value={progressDraft}
                  min={0}
                  max={100}
                  step={5}
                  valueLabelDisplay="auto"
                  onChange={(_, v) => setProgressDraft(v as number)}
                />
                <Typography variant="body2">{progressDraft}%</Typography>
              </>
            ) : (
              <>
                <LinearProgress variant="determinate" value={task.progress} sx={{ mt: 1 }} />
                <Typography variant="body2">{task.progress}%</Typography>
              </>
            )}
          </Field>
          {editingPlan && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button onClick={() => setEditingPlan(false)} disabled={saving}>
                Cancel
              </Button>
              <Button variant="contained" onClick={() => void savePlanning()} disabled={saving}>
                Save
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default TaskDetail;
