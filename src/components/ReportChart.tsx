import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

type ReportChartProps = {
  total: number;
  averageAttendance: number;
  averageEvaluation: number;
  ppoOffered: number;
};

function ReportChart({
  total,
  averageAttendance,
  averageEvaluation,
  ppoOffered,
}: ReportChartProps) {
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
            Total Interns
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="primary.main"
          >
            {averageAttendance.toFixed(1)}%
          </Typography>
          <Typography>
            Avg Attendance
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="success.main"
          >
            {averageEvaluation.toFixed(1)}
          </Typography>
          <Typography>
            Avg Evaluation
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="warning.main"
          >
            {ppoOffered}
          </Typography>
          <Typography>
            PPO Offered
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default ReportChart;