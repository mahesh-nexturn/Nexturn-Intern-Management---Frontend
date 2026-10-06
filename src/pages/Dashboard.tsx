import { useMemo } from "react";

import {
  Box,
  Chip,
  Divider,
  Paper,
  Typography,
} from "@mui/material";

import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { Intern } from "../types/Intern";
import type { Attendance } from "../types/Attendance";
import type { Meeting } from "../types/Meeting";
import type { Document } from "../types/Document";
import type { Training } from "../types/Training";
import type { Evaluation } from "../types/Evaluation";
import type { Notification } from "../types/Notification";

type DashboardProps = {
  interns: Intern[];
  attendance: Attendance[];
  meetings: Meeting[];
  documents: Document[];
  trainings: Training[];
  evaluations: Evaluation[];
  notifications: Notification[];
};

type Role = "HR" | "MENTOR" | "INTERN" | null;

const COLORS = [
  "#2563eb",
  "#14b8a6",
  "#f97316",
  "#8b5cf6",
  "#ef4444",
  "#22c55e",
  "#06b6d4",
  "#eab308",
];

type MetricCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  accent: string;
};

function MetricCard({
  title,
  value,
  subtitle,
  accent,
}: MetricCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        borderTop: `5px solid ${accent}`,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        transition: "0.25s ease",
        height: "100%",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.1)",
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", mb: 1, fontWeight: 600 }}
      >
        {title}
      </Typography>

      <Typography
        variant="h4"
        sx={{ fontWeight: 800, lineHeight: 1.1 }}
      >
        {value}
      </Typography>

      {subtitle ? (
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", display: "block", mt: 0.5 }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Paper>
  );
}

function Dashboard({
  interns,
  attendance,
  meetings,
  documents,
  trainings,
  evaluations,
  notifications,
}: DashboardProps) {
  const role = (localStorage.getItem("role") as Role) || "HR";
  const userName = localStorage.getItem("name") || "Gayathri";

  const dashboardTitle =
    role === "HR"
      ? "HR Dashboard"
      : role === "MENTOR"
      ? "Mentor Dashboard"
      : role === "INTERN"
      ? "Intern Dashboard"
      : "Dashboard";

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const totalInterns = interns.length;
  const activeInterns = interns.filter((i) => i.status === "Active").length;
  const inactiveInterns = interns.filter((i) => i.status === "Inactive").length;
  const completedInternships = trainings.filter(
    (t) => t.status === "Completed" || t.progress >= 100
  ).length;
  const pendingEvaluations = Math.max(interns.length - evaluations.length, 0);
  const departments = new Set(interns.map((i) => i.department)).size;
  const mentors = new Set(interns.map((i) => i.mentor)).size;

  const attendancePercentage =
    attendance.length === 0
      ? 0
      : Math.round(
          ((attendance.filter((a) => a.status === "Present").length +
            attendance.filter((a) => a.status === "WFH").length) /
            attendance.length) *
            100
        );

  const departmentData = useMemo(() => {
    const map = new Map<string, number>();
    interns.forEach((intern) => {
      const key = intern.department || "Other";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [interns]);

  const joiningTrend = [
    { month: "Jan", joined: 2 },
    { month: "Feb", joined: 4 },
    { month: "Mar", joined: 6 },
    { month: "Apr", joined: 5 },
    { month: "May", joined: 8 },
    { month: "Jun", joined: 7 },
  ];

  const recentActivities = useMemo(() => {
    const items: string[] = [];

    if (notifications[0]) {
      items.push(`✓ ${notifications[0].title}`);
    }

    if (notifications[1]) {
      items.push(`✓ ${notifications[1].title}`);
    }

    if (meetings[0]) {
      items.push(`✓ ${meetings[0].title} scheduled`);
    }

    if (evaluations[0]) {
      items.push(`✓ ${evaluations[0].intern} completed evaluation`);
    }

    if (trainings[0]) {
      items.push(`✓ ${trainings[0].title} updated`);
    }

    if (documents.length) {
      items.push(`✓ ${documents.length} document(s) uploaded`);
    }

    if (items.length === 0) {
      items.push(
        "✓ John submitted weekly report",
        "✓ Sarah completed evaluation",
        "✓ New intern joined",
        "✓ Mentor assigned"
      );
    }

    return items.slice(0, 4);
  }, [notifications, meetings, evaluations, trainings, documents]);

  const upcomingMeetings = useMemo(
    () =>
      [...meetings]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 4),
    [meetings]
  );

  const latestNotifications = useMemo(
    () =>
      [...notifications]
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
        .slice(0, 4),
    [notifications]
  );

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
          borderRadius: 5,
          p: { xs: 2.5, md: 4 },
          mb: 3,
          color: "#fff",
          background:
            "linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #3b82f6 100%)",
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
              variant="h4"
              sx={{ fontWeight: 800, lineHeight: 1.2 }}
            >
              Welcome, {userName} 👋
            </Typography>

            <Typography sx={{ opacity: 0.9, mt: 0.5 }}>
              {dashboardTitle}
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
          mb: 2.5,
        }}
      >
        <MetricCard
          title="Total Interns"
          value={totalInterns}
          subtitle="All interns"
          accent="#2563eb"
        />
        <MetricCard
          title="Active Interns"
          value={activeInterns}
          subtitle="Currently active"
          accent="#22c55e"
        />
        <MetricCard
          title="Inactive Interns"
          value={inactiveInterns}
          subtitle="Inactive now"
          accent="#ef4444"
        />
        <MetricCard
          title="Completed Internships"
          value={completedInternships}
          subtitle="Finished training"
          accent="#8b5cf6"
        />
        <MetricCard
          title="Pending Evaluations"
          value={pendingEvaluations}
          subtitle="Needs review"
          accent="#f97316"
        />
        <MetricCard
          title="Departments"
          value={departments}
          subtitle="Unique teams"
          accent="#06b6d4"
        />
        <MetricCard
          title="Mentors"
          value={mentors}
          subtitle="Assigned mentors"
          accent="#14b8a6"
        />
        <MetricCard
          title="Attendance %"
          value={`${attendancePercentage}%`}
          subtitle="Present + WFH"
          accent="#0ea5e9"
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1.05fr 1.2fr",
          },
          gap: 2.5,
          mb: 2.5,
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
            minHeight: 380,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Department Distribution
          </Typography>

          <Box sx={{ width: "100%", height: 290 }}>
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {departmentData.map((_, index) => (
                      <Cell
                        key={`dept-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
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
                No department data available
              </Box>
            )}
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
            minHeight: 380,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Monthly Joining Trend
          </Typography>

          <Box sx={{ width: "100%", height: 290 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={joiningTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Line
                  type="monotone"
                  dataKey="joined"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 2.5,
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
            minHeight: 320,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Recent Activities
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {recentActivities.map((activity, index) => (
              <Typography
                key={`${activity}-${index}`}
                sx={{ color: "text.secondary", lineHeight: 1.7 }}
              >
                {activity}
              </Typography>
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
            minHeight: 320,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Upcoming Meetings
          </Typography>

          {upcomingMeetings.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {upcomingMeetings.map((meeting, index) => (
                <Box
                  key={`${meeting.title}-${meeting.date}-${index}`}
                  sx={{
                    p: 1.8,
                    borderRadius: 3,
                    bgcolor: "#f8fafc",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    {meeting.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {meeting.intern} • {meeting.date} • {meeting.time}
                  </Typography>
                  <Chip
                    size="small"
                    label={meeting.status}
                    color={
                      meeting.status === "Completed"
                        ? "success"
                        : meeting.status === "Scheduled"
                        ? "primary"
                        : "default"
                    }
                    sx={{ mt: 1 }}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No upcoming meetings found.
            </Typography>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
            minHeight: 320,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Latest Notifications
          </Typography>

          {latestNotifications.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {latestNotifications.map((notification, index) => (
                <Box
                  key={`${notification.title}-${notification.date}-${index}`}
                  sx={{
                    p: 1.8,
                    borderRadius: 3,
                    bgcolor: "#f8fafc",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {notification.message}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                    <Chip
                      size="small"
                      label={notification.status}
                      color={
                        notification.status === "Read"
                          ? "success"
                          : "warning"
                      }
                    />
                    <Chip
                      size="small"
                      label={notification.date}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No notifications found.
            </Typography>
          )}
        </Paper>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography
        variant="body2"
        sx={{ color: "text.secondary", textAlign: "center" }}
      >
        Internship Management System • HR Dashboard
      </Typography>
    </Box>
  );
}

export default Dashboard;