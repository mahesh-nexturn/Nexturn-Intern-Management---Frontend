import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

type AnnouncementChartProps = {
  total: number;
  high: number;
  medium: number;
  low: number;
};

function AnnouncementChart({
  total,
  high,
  medium,
  low,
}: AnnouncementChartProps) {
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
            Total Announcements
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="error.main"
          >
            {high}
          </Typography>

          <Typography>
            High Priority
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="warning.main"
          >
            {medium}
          </Typography>

          <Typography>
            Medium Priority
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="success.main"
          >
            {low}
          </Typography>

          <Typography>
            Low Priority
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default AnnouncementChart;