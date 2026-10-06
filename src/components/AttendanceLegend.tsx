import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

function AttendanceLegend() {
  const items = [
    {
      label: "Present",
      color: "#4caf50",
    },
    {
      label: "Absent",
      color: "#f44336",
    },
    {
      label: "Leave",
      color: "#2196f3",
    },
    {
      label: "Holiday",
      color: "#9c27b0",
    },
    {
      label: "WFH",
      color: "#ff9800",
    },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        minWidth: 180,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {items.map((item) => (
          <Box
            key={item.label}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                bgcolor: item.color,
              }}
            />

            <Typography>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

export default AttendanceLegend;