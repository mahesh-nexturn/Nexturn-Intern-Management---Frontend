import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

type NotificationChartProps = {
  total: number;
  unread: number;
  read: number;
  today: number;
};

function NotificationChart({
  total,
  unread,
  read,
  today,
}: NotificationChartProps) {
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
            Total Notifications
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="warning.main"
          >
            {unread}
          </Typography>

          <Typography>
            Unread
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="success.main"
          >
            {read}
          </Typography>

          <Typography>
            Read
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="primary.main"
          >
            {today}
          </Typography>

          <Typography>
            Today
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default NotificationChart;