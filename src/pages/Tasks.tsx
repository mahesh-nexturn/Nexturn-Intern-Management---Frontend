import { useEffect, useState } from "react";

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

import AddTaskDialog from "../components/AddTaskDialog";
import TaskChart from "../components/TaskChart";

import type { Task } from "../types/Task";
import type { Intern } from "../types/Intern";
import * as taskApi from "../services/taskApi";
import { statusToBackend, statusToUi } from "../services/taskApi";

type TasksProps = {
  tasks: Task[];
  setTasks: React.Dispatch<
    React.SetStateAction<Task[]>
  >;
  interns: Intern[];
};

export function toUiTask(
  dto: taskApi.TaskDto,
  interns: Intern[] = []
): Task {
  const intern = interns.find((item) => item.id === dto.internId);

  return {
    id: dto.id,
    title: dto.title,
    description: dto.description || "",
    assignedTo: dto.internName || "",
    internId: dto.internId,
    mentor: intern?.mentor ?? "",
    mentorId: dto.mentorId ?? intern?.mentorId ?? null,
    priority: dto.priority as Task["priority"],
    dueDate: dto.dueDate || "",
    status: statusToUi(dto.status) as Task["status"],
    progress: dto.progress,
  };
}

type Role =
  | "HR"
  | "MENTOR"
  | "INTERN"
  | null;

function Tasks({
  tasks,
  setTasks,
  interns,
}: TasksProps) {
  const [open, setOpen] =
    useState(false);

  const [editId, setEditId] =
    useState<number | null>(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [toast, setToast] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const [selectedTask, setSelectedTask] =
    useState<Task>({
      id: 0,
      title: "",
      description: "",
      assignedTo: "",
      mentor: "",
      priority: "Medium",
      dueDate: "",
      status: "Pending",
      progress: 0,
    });

  useEffect(() => {
    taskApi
      .listTasks()
      .then((list) => setTasks(list.map((item) => toUiTask(item))))
      .catch(() =>
        setToast({ message: "Failed to load tasks.", severity: "error" })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve mentor names via the interns list (task DTOs only carry mentorId).
  const tasksWithMentor = tasks.map((t) => ({
    ...t,
    mentor:
      interns.find((i) => i.id === t.internId)?.mentor || t.mentor,
  }));

  const role = localStorage.getItem(
    "role"
  ) as Role;

  const userName =
    localStorage.getItem("name") || "";

  const isHr = role === "HR";
  const isMentor = role === "MENTOR";
  const isIntern = role === "INTERN";

  const canManageTasks =
    isHr || isMentor;

  const visibleTasks = isHr
    ? tasksWithMentor
    : isMentor
    ? tasksWithMentor.filter(
        (task) =>
          task.mentor === userName
      )
    : isIntern
    ? tasksWithMentor.filter(
        (task) =>
          task.assignedTo === userName
      )
    : [];

  const filteredTasks = visibleTasks
    .filter((task) =>
      task.title
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    )
    .filter(
      (task) =>
        statusFilter === "All" ||
        task.status === statusFilter
    )
    .filter(
      (task) =>
        priorityFilter === "All" ||
        task.priority ===
          priorityFilter
    );

  const totalTasks =
    visibleTasks.length;

  const pendingCount =
    visibleTasks.filter(
      (task) =>
        task.status === "Pending"
    ).length;

  const inProgressCount =
    visibleTasks.filter(
      (task) =>
        task.status ===
        "In Progress"
    ).length;

  const completedCount =
    visibleTasks.filter(
      (task) =>
        task.status === "Completed"
    ).length;

  const handleOpen = () => {
    setEditId(null);

    setSelectedTask({
      id: 0,
      title: "",
      description: "",
      assignedTo: "",
      mentor: userName,
      priority: "Medium",
      dueDate: "",
      status: "Pending",
      progress: 0,
    });

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const saveTask = async (task: Task) => {
    const payload: taskApi.TaskPayload = {
      title: task.title,
      description: task.description,
      internId: task.internId as number,
      mentorId: task.mentorId,
      priority: task.priority,
      dueDate: task.dueDate,
      status: statusToBackend(task.status),
      progress: task.progress,
    };

    try {
      if (editId !== null) {
        const updated = await taskApi.updateTask(editId, payload);
        setTasks((prev) =>
          prev.map((t) => (t.id === editId ? toUiTask(updated, interns) : t))
        );
        setToast({ message: "Task updated successfully.", severity: "success" });
      } else {
        const created = await taskApi.createTask(payload);
        setTasks((prev) => [...prev, toUiTask(created, interns)]);
        setToast({ message: "Task created successfully.", severity: "success" });
      }

      setEditId(null);
      setOpen(false);
    } catch {
      setToast({ message: "Failed to save task.", severity: "error" });
    }
  };

  const editTask = (
    index: number
  ) => {
    const taskToEdit =
      filteredTasks[index];

    setEditId(taskToEdit.id);
    setSelectedTask(taskToEdit);
    setOpen(true);
  };

  const deleteTask = async (
    index: number
  ) => {
    const taskToDelete =
      filteredTasks[index];

    try {
      await taskApi.deleteTask(taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      setToast({ message: "Task deleted successfully.", severity: "success" });
    } catch {
      setToast({ message: "Failed to delete task.", severity: "error" });
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h4">
          Tasks
        </Typography>

        {canManageTasks && (
          <Button
            variant="contained"
            onClick={handleOpen}
          >
            Add Task
          </Button>
        )}
      </Box>

      <TaskChart
        total={totalTasks}
        pending={pendingCount}
        inProgress={
          inProgressCount
        }
        completed={
          completedCount
        }
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
          label="Search Task"
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
        />

        <FormControl
          sx={{
            minWidth: 180,
          }}
        >
          <InputLabel>
            Status
          </InputLabel>

          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >
            <MenuItem value="All">
              All
            </MenuItem>

            <MenuItem value="Pending">
              Pending
            </MenuItem>

            <MenuItem value="In Progress">
              In Progress
            </MenuItem>

            <MenuItem value="Completed">
              Completed
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl
          sx={{
            minWidth: 180,
          }}
        >
          <InputLabel>
            Priority
          </InputLabel>

          <Select
            value={priorityFilter}
            label="Priority"
            onChange={(e) =>
              setPriorityFilter(
                e.target.value
              )
            }
          >
            <MenuItem value="All">
              All
            </MenuItem>

            <MenuItem value="High">
              High
            </MenuItem>

            <MenuItem value="Medium">
              Medium
            </MenuItem>

            <MenuItem value="Low">
              Low
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer
        component={Paper}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Title
              </TableCell>

              <TableCell>
                Assigned To
              </TableCell>

              <TableCell>
                Mentor
              </TableCell>

              <TableCell>
                Priority
              </TableCell>

              <TableCell>
                Due Date
              </TableCell>

              <TableCell>
                Status
              </TableCell>

              <TableCell>
                Progress
              </TableCell>

              {canManageTasks && (
                <TableCell>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTasks.map(
              (
                task,
                index
              ) => (
                <TableRow
                  key={index}
                >
                  <TableCell>
                    {task.title}
                  </TableCell>

                  <TableCell>
                    {
                      task.assignedTo
                    }
                  </TableCell>

                  <TableCell>
                    {task.mentor}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={
                        task.priority
                      }
                      color={
                        task.priority ===
                        "High"
                          ? "error"
                          : task.priority ===
                            "Medium"
                          ? "warning"
                          : "success"
                      }
                    />
                  </TableCell>

                  <TableCell>
                    {task.dueDate}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={
                        task.status
                      }
                      color={
                        task.status ===
                        "Completed"
                          ? "success"
                          : task.status ===
                            "In Progress"
                          ? "primary"
                          : "warning"
                      }
                    />
                  </TableCell>

                  <TableCell
                    sx={{
                      minWidth: 150,
                    }}
                  >
                    <LinearProgress
                      variant="determinate"
                      value={
                        task.progress
                      }
                    />

                    <Typography
                      variant="body2"
                    >
                      {
                        task.progress
                      }
                      %
                    </Typography>
                  </TableCell>

                  {canManageTasks && (
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() =>
                          editTask(
                            index
                          )
                        }
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() =>
                          deleteTask(
                            index
                          )
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddTaskDialog
        open={open}
        handleClose={
          handleClose
        }
        addTask={saveTask}
        selectedTask={
          selectedTask
        }
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

export default Tasks;