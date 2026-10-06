import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

type MeetingChartProps = {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
};

function MeetingChart({
  total,
  scheduled,
  completed,
  cancelled,
}: MeetingChartProps) {
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
            Total Meetings
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="primary.main"
          >
            {scheduled}
          </Typography>

          <Typography>
            Scheduled
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

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="error.main"
          >
            {cancelled}
          </Typography>

          <Typography>
            Cancelled
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default MeetingChart;