import { Box, Chip, Divider, Paper, Typography } from "@mui/material";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { Intern } from "../types/Intern";
import type { Meeting } from "../types/Meeting";
import type { Task } from "../types/Task";
import type { Evaluation } from "../types/Evaluation";

type MentorDashboardProps = {
  interns?: Intern[];
  meetings?: Meeting[];
  tasks?: Task[];
  evaluations?: Evaluation[];
};

type StatCardProps = {
  title: string;
  value: number | string;
  subtitle: string;
  color: string;
};

function StatCard({
  title,
  value,
  subtitle,
  color,
}: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        borderTop: `5px solid ${color}`,
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
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
          fontWeight: 800,
          fontSize: 38,
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color,
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        {subtitle}
      </Typography>
    </Paper>
  );
}

function MentorDashboard({
  interns = [],
  meetings = [],
  tasks = [],
  evaluations = [],
}: MentorDashboardProps) {
  const mentorName = localStorage.getItem("name") || "Rahul";

  const myInterns = interns.filter(
    (intern) => intern.mentor === mentorName
  );

  const myTasks = tasks.filter(
    (task) => task.mentor === mentorName
  );

  const myMeetings = meetings.filter(
    (meeting) => meeting.mentor === mentorName
  );

  const myEvaluations = evaluations.filter(
    (evaluation) => evaluation.mentor === mentorName
  );

  const totalInterns = myInterns.length;
  const activeInterns = myInterns.filter(
    (intern) => intern.status === "Active"
  ).length;
  const pendingTasks = myTasks.filter(
    (task) => task.status === "Pending"
  ).length;
  const completedTasks = myTasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const inProgressTasks = myTasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const evaluationAverage =
    myEvaluations.length === 0
      ? 0
      : myEvaluations.reduce(
          (sum, item) => sum + item.overallRating,
          0
        ) / myEvaluations.length;

  const internProgressData = [
    {
      name: "Active",
      value: activeInterns,
      color: "#2563eb",
    },
    {
      name: "Inactive",
      value: Math.max(totalInterns - activeInterns, 0),
      color: "#f59e0b",
    },
  ].filter((item) => item.value > 0);

  const taskStatusData = [
    {
      name: "Completed",
      value: completedTasks,
      color: "#22c55e",
    },
    {
      name: "In Progress",
      value: inProgressTasks,
      color: "#2563eb",
    },
    {
      name: "Pending",
      value: pendingTasks,
      color: "#f59e0b",
    },
  ].filter((item) => item.value > 0);

  const upcomingMeetingsList = myMeetings.filter(
    (meeting) => meeting.status === "Scheduled"
  );

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fb",
        p: { xs: 2, md: 3 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: 5,
          mb: 3,
          color: "#fff",
          background:
            "linear-gradient(135deg, #1d4ed8 0%, #2563eb 40%, #3b82f6 100%)",
          boxShadow: "0 18px 40px rgba(37, 99, 235, 0.22)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, lineHeight: 1.15 }}
            >
              Mentor Dashboard
            </Typography>

            <Typography
              sx={{ opacity: 0.92, mt: 0.75, fontSize: 24 }}
            >
              Welcome back, {mentorName} 👋
            </Typography>
          </Box>

          <Chip
            label={today}
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.25)",
              fontWeight: 700,
            }}
          />
        </Box>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          title="My Interns"
          value={totalInterns}
          subtitle="Assigned to me"
          color="#2563eb"
        />

        <StatCard
          title="Active Interns"
          value={activeInterns}
          subtitle="Currently active"
          color="#22c55e"
        />

        <StatCard
          title="Pending Tasks"
          value={pendingTasks}
          subtitle="Need review"
          color="#f59e0b"
        />

        <StatCard
          title="Avg Evaluation"
          value={evaluationAverage.toFixed(1)}
          subtitle="Overall rating"
          color="#8b5cf6"
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1fr 1fr",
          },
          gap: 2.5,
          mb: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
            minHeight: 420,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            Intern Progress
          </Typography>

          <Box sx={{ width: "100%", height: 270 }}>
            {internProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={internProgressData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={110}
                    paddingAngle={4}
                  >
                    {internProgressData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
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
                No intern data
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {internProgressData.map((item) => (
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

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
            minHeight: 420,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            Task Status
          </Typography>

          <Box sx={{ width: "100%", height: 270 }}>
            {taskStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={110}
                    paddingAngle={4}
                  >
                    {taskStatusData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
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

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {taskStatusData.map((item) => (
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

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
          Upcoming Meetings
        </Typography>

        {upcomingMeetingsList.length === 0 ? (
          <Typography sx={{ color: "text.secondary" }}>
            No upcoming meetings scheduled.
          </Typography>
        ) : (
          upcomingMeetingsList.map((meeting, index) => (
            <Box key={`${meeting.title}-${index}`}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
                  gap: 2,
                  alignItems: "center",
                  py: 2,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 18,
                    }}
                  >
                    {meeting.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      mt: 0.5,
                    }}
                  >
                    Intern: {meeting.intern}
                  </Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      mt: 0.5,
                    }}
                  >
                    {meeting.date} • {meeting.time}
                  </Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      mt: 0.5,
                    }}
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
                  sx={{ justifySelf: { xs: "start", md: "end" } }}
                />
              </Box>

              {index !== upcomingMeetingsList.length - 1 && <Divider />}
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
}

export default MentorDashboard;