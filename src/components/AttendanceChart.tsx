import {
  Paper,
  Box,
  Typography,
} from "@mui/material";

type AttendanceChartProps = {
  present: number;
  absent: number;
  leave: number;
  holiday: number;
  wfh: number;
};

function AttendanceChart({
  present,
  absent,
  leave,
  holiday,
  wfh,
}: AttendanceChartProps) {
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
          <Typography
            variant="h4"
            color="success.main"
          >
            {present}
          </Typography>

          <Typography>
            Present
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="error.main"
          >
            {absent}
          </Typography>

          <Typography>
            Absent
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="primary.main"
          >
            {leave}
          </Typography>

          <Typography>
            Leave
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            sx={{ color: "#9c27b0" }}
          >
            {holiday}
          </Typography>

          <Typography>
            Holiday
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            sx={{ color: "#ff9800" }}
          >
            {wfh}
          </Typography>

          <Typography>
            WFH
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default AttendanceChart;