import { useState, useEffect } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";

import type { Task } from "../types/Task";
import type { Intern } from "../types/Intern";

type Props = {
  open: boolean;
  handleClose: () => void;
  addTask: (task: Task) => void;
  selectedTask: Task;
  interns: Intern[];
};

function AddTaskDialog({
  open,
  handleClose,
  addTask,
  selectedTask,
  interns,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [internId, setInternId] = useState<number | "">("");

  const [priority, setPriority] =
    useState<Task["priority"]>("Medium");

  const [dueDate, setDueDate] = useState("");

  const [status, setStatus] =
    useState<Task["status"]>("Pending");

  const [progress, setProgress] =
    useState(0);

  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title || "");
      setDescription(
        selectedTask.description || ""
      );

      setInternId(selectedTask.internId ?? "");

      setPriority(
        selectedTask.priority || "Medium"
      );

      setDueDate(selectedTask.dueDate || "");

      setStatus(
        selectedTask.status || "Pending"
      );

      setProgress(
        selectedTask.progress || 0
      );
    }
  }, [selectedTask]);

  const handleSave = () => {
    if (!internId) {
      alert("Please select an intern to assign this task to.");
      return;
    }

    const intern = interns.find((i) => i.id === internId);

    addTask({
      id: selectedTask.id,
      title,
      description,
      assignedTo: intern?.name || "",
      internId: internId as number,
      mentor: intern?.mentor || "",
      mentorId: intern?.mentorId ?? null,
      priority,
      dueDate,
      status,
      progress,
    });

    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Task Details
      </DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          label="Title"
          margin="dense"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description"
          margin="dense"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
        />

        <TextField
          select
          fullWidth
          label="Assigned To (Intern)"
          margin="dense"
          value={internId}
          onChange={(e) =>
            setInternId(
              e.target.value === "" ? "" : Number(e.target.value)
            )
          }
        >
          {interns.map((i) => (
            <MenuItem key={i.id} value={i.id}>
              {i.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Mentor"
          margin="dense"
          value={
            interns.find((i) => i.id === internId)?.mentor || ""
          }
          disabled
        />

        <TextField
          select
          fullWidth
          label="Priority"
          margin="dense"
          value={priority}
          onChange={(e) =>
            setPriority(
              e.target.value as Task["priority"]
            )
          }
        >
          <MenuItem value="High">
            High
          </MenuItem>

          <MenuItem value="Medium">
            Medium
          </MenuItem>

          <MenuItem value="Low">
            Low
          </MenuItem>
        </TextField>

        <TextField
          fullWidth
          type="date"
          margin="dense"
          value={dueDate}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          onChange={(e) =>
            setDueDate(e.target.value)
          }
        />

        <TextField
          select
          fullWidth
          label="Status"
          margin="dense"
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value as Task["status"]
            )
          }
        >
          <MenuItem value="Pending">
            Pending
          </MenuItem>

          <MenuItem value="In Progress">
            In Progress
          </MenuItem>

          <MenuItem value="Completed">
            Completed
          </MenuItem>
        </TextField>

        <TextField
          fullWidth
          type="number"
          label="Progress (%)"
          margin="dense"
          value={progress}
          onChange={(e) =>
            setProgress(
              Number(e.target.value)
            )
          }
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddTaskDialog;