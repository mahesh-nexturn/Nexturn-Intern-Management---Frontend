import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

type TaskChartProps = {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
};

function TaskChart({
  total,
  pending,
  inProgress,
  completed,
}: TaskChartProps) {
  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4">
            {total}
          </Typography>

          <Typography>
            Total
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="warning.main"
          >
            {pending}
          </Typography>

          <Typography>
            Pending
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="primary.main"
          >
            {inProgress}
          </Typography>

          <Typography>
            In Progress
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="success.main"
          >
            {completed}
          </Typography>

          <Typography>
            Completed
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default TaskChart;