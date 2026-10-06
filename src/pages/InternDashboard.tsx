import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
} from "@mui/material";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import type { Task } from "../types/Task";
import type { Meeting } from "../types/Meeting";
import type { Attendance } from "../types/Attendance";
import type { Evaluation } from "../types/Evaluation";

type InternDashboardProps = {
  tasks: Task[];
  meetings: Meeting[];
  attendance: Attendance[];
  evaluations: Evaluation[];
};

type DashboardCardProps = {
  title: string;
  value: number | string;
  subtitle: string;
  color: string;
};

function DashboardCard({
  title,
  value,
  subtitle,
  color,
}: DashboardCardProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 4,
        borderTop: `5px solid ${color}`,
        height: "100%",
      }}
    >
      <Typography
        sx={{
          color: "text.secondary",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 1,
          fontWeight: 700,
          fontSize: 38,
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color,
          fontWeight: 600,
        }}
      >
        {subtitle}
      </Typography>
    </Paper>
  );
}

function InternDashboard({
  tasks,
  meetings,
  attendance,
  evaluations,
}: InternDashboardProps) {

  const internName =
    localStorage.getItem("name") || "John";

  const myTasks = tasks.filter(
    (t) => t.assignedTo === internName
  );

  const myMeetings = meetings.filter(
    (m) => m.intern === internName
  );

  const myAttendance = attendance.filter(
    (a) => a.intern === internName
  );

  const myEvaluations = evaluations.filter(
    (e) => e.intern === internName
  );

  const totalTasks = myTasks.length;

  const completedTasks = myTasks.filter(
    (t) => t.status === "Completed"
  ).length;

  const attendancePercentage =
    myAttendance.length === 0
      ? 0
      : Math.round(
          (myAttendance.filter(
            (a) => a.status === "Present"
          ).length *
            100) /
            myAttendance.length
        );

  const overallRating =
    myEvaluations.length === 0
      ? 0
      : (
          myEvaluations.reduce(
            (sum, item) =>
              sum + item.overallRating,
            0
          ) / myEvaluations.length
        ).toFixed(1);

  const taskChart = [
    {
      name: "Completed",
      value: completedTasks,
      color: "#22c55e",
    },
    {
      name: "Pending",
      value:
        totalTasks - completedTasks,
      color: "#2563eb",
    },
  ];

  const attendanceChart = [
    {
      name: "Present",
      value: myAttendance.filter(
        (a) => a.status === "Present"
      ).length,
      color: "#22c55e",
    },
    {
      name: "Absent",
      value: myAttendance.filter(
        (a) => a.status === "Absent"
      ).length,
      color: "#ef4444",
    },
  ];

  return (
    <Box
      sx={{
        p: 4,
        bgcolor: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
            {/* Header */}

      <Paper
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 5,
          color: "#fff",
          background:
            "linear-gradient(135deg,#2563eb,#4f8dfd)",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
          }}
        >
          Intern Dashboard
        </Typography>

        <Typography
          sx={{
            mt: 1,
            fontSize: 24,
          }}
        >
          Welcome back, {internName} 👋
        </Typography>

        <Chip
          label={new Date().toDateString()}
          sx={{
            mt: 2,
            bgcolor: "rgba(255,255,255,.2)",
            color: "#fff",
          }}
        />
      </Paper>

      {/* Cards */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 3,
        }}
      >
        <DashboardCard
          title="My Tasks"
          value={totalTasks}
          subtitle="Assigned Tasks"
          color="#2563eb"
        />

        <DashboardCard
          title="Completed Tasks"
          value={completedTasks}
          subtitle="Finished Tasks"
          color="#22c55e"
        />

        <DashboardCard
          title="Attendance %"
          value={`${attendancePercentage}%`}
          subtitle="Current Attendance"
          color="#f59e0b"
        />

        <DashboardCard
          title="Overall Rating"
          value={overallRating}
          subtitle="Latest Evaluation"
          color="#8b5cf6"
        />
      </Box>

      {/* Charts section starts in Part 3 */}
            <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1fr 1fr",
          },
          gap: 3,
          mt: 3,
        }}
      >
        {/* Task Status */}

        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            height: 430,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              mb: 2,
            }}
          >
            Task Status
          </Typography>

          <Box
            sx={{
              width: "100%",
              height: 270,
            }}
          >
            {taskChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskChart}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                  >
                    {taskChart.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "grid",
                  placeItems: "center",
                  color: "text.secondary",
                }}
              >
                No task data
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.25,
            }}
          >
            {taskChart.map((item) => (
              <Box
                key={item.name}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: item.color,
                    }}
                  />
                  <Typography>{item.name}</Typography>
                </Box>

                <Typography sx={{ fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Attendance Overview */}

        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            height: 430,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              mb: 2,
            }}
          >
            Attendance Overview
          </Typography>

          <Box
            sx={{
              width: "100%",
              height: 270,
            }}
          >
            {attendanceChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceChart}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                  >
                    {attendanceChart.map((item) => (
                      <Cell
                        key={item.name}
                        fill={item.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "grid",
                  placeItems: "center",
                  color: "text.secondary",
                }}
              >
                No attendance data
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.25,
            }}
          >
            {attendanceChart.map((item) => (
              <Box
                key={item.name}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: item.color,
                    }}
                  />
                  <Typography>{item.name}</Typography>
                </Box>

                <Typography sx={{ fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
            {/* Upcoming Meetings */}

      <Paper
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            mb: 3,
          }}
        >
          Upcoming Meetings
        </Typography>

        {myMeetings.length === 0 ? (
          <Typography color="text.secondary">
            No upcoming meetings scheduled.
          </Typography>
        ) : (
          myMeetings.map((meeting, index) => (
            <Box key={index}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 2,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: 18,
                    }}
                  >
                    {meeting.title}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Mentor : {meeting.mentor}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {meeting.date} • {meeting.time}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {meeting.agenda}
                  </Typography>
                </Box>

                <Chip
                  label={meeting.status}
                  color={
                    meeting.status === "Scheduled"
                      ? "primary"
                      : meeting.status === "Completed"
                      ? "success"
                      : "error"
                  }
                />
              </Box>

              {index !== myMeetings.length - 1 && (
                <Divider />
              )}
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
}

export default InternDashboard;