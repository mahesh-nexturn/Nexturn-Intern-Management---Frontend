import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

type TrainingChartProps = {
  total: number;
  notStarted: number;
  inProgress: number;
  completed: number;
};

function TrainingChart({
  total,
  notStarted,
  inProgress,
  completed,
}: TrainingChartProps) {
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
            Total Trainings
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="warning.main"
          >
            {notStarted}
          </Typography>

          <Typography>
            Not Started
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

export default TrainingChart;