import { Box, Paper, Typography } from "@mui/material";
import type { Attendance } from "../types/Attendance";

type Props = {
  attendance: Attendance[];
};

type StatusType =
  | "Present"
  | "Absent"
  | "Leave"
  | "Holiday"
  | "WFH"
  | "";

function MonthlyAttendanceGrid({ attendance }: Props) {
  const today = new Date();

  const baseDate =
    attendance.length > 0
      ? new Date(attendance[0].date)
      : today;

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const monthName = baseDate.toLocaleString("en-US", {
    month: "long",
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case "Present":
        return "#e8f5e9";
      case "Absent":
        return "#ffebee";
      case "Leave":
        return "#e3f2fd";
      case "Holiday":
        return "#f3e5f5";
      case "WFH":
        return "#fff3e0";
      default:
        return "#fafafa";
    }
  };

  const getStatusTextColor = (status: StatusType) => {
    switch (status) {
      case "Present":
        return "#2e7d32";
      case "Absent":
        return "#c62828";
      case "Leave":
        return "#1565c0";
      case "Holiday":
        return "#6a1b9a";
      case "WFH":
        return "#ef6c00";
      default:
        return "#333";
    }
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyCells = Array.from({ length: firstDayOfWeek }, () => null);
  const allCells = [...emptyCells, ...days];

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700 }}
        >
          {monthName} {year}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 1,
        }}
      >
        {weekdayLabels.map((day) => (
          <Box
            key={day}
            sx={{
              textAlign: "center",
              py: 1,
              fontWeight: 700,
              color: "#555",
            }}
          >
            {day}
          </Box>
        ))}

        {allCells.map((day, index) => {
          if (day === null) {
            return (
              <Box key={`empty-${index}`} />
            );
          }

          const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          const record = attendance.find(
            (item) => item.date === dateString
          );

          const status = (record?.status || "") as StatusType;

          return (
            <Paper
              key={day}
              elevation={0}
              sx={{
                minHeight: 100,
                p: 1.5,
                borderRadius: 2,
                border: "1px solid #e0e0e0",
                bgcolor: record
                  ? getStatusColor(status)
                  : "#fafafa",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  fontSize: 14,
                }}
              >
                {day}
              </Typography>

              {record ? (
                <Box
                  sx={{
                    display: "inline-block",
                    px: 1,
                    py: 0.4,
                    borderRadius: 1,
                    bgcolor: getStatusColor(status),
                    color: getStatusTextColor(status),
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {record.status}
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#999",
                  }}
                >
                  No Record
                </Typography>
              )}
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
}

export default MonthlyAttendanceGrid;