import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import GroupIcon from "@mui/icons-material/Group";
import TaskIcon from "@mui/icons-material/Task";
import EventIcon from "@mui/icons-material/Event";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SchoolIcon from "@mui/icons-material/School";
import DescriptionIcon from "@mui/icons-material/Description";
import NotificationsIcon from "@mui/icons-material/Notifications";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CampaignIcon from "@mui/icons-material/Campaign";
import SettingsIcon from "@mui/icons-material/Settings";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import { useNavigate, useLocation } from "react-router-dom";

type MenuItem = {
  text: string;
  icon: React.ReactNode;
  path: string;
};

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role");

  let menu: MenuItem[] = [];

  if (role === "HR") {
    menu = [
      { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
      {text: "Mentors",icon: <SupervisorAccountIcon />,path: "/mentors"},
      { text: "Interns", icon: <GroupIcon />, path: "/interns" },
      { text: "Tasks", icon: <TaskIcon />, path: "/tasks" },
      { text: "Meetings", icon: <EventIcon />, path: "/meetings" },
      { text: "Attendance", icon: <CalendarMonthIcon />, path: "/attendance" },
      { text: "Training", icon: <SchoolIcon />, path: "/training" },
      { text: "Evaluations", icon: <FactCheckIcon />, path: "/evaluations" },
      { text: "Documents", icon: <DescriptionIcon />, path: "/documents" },
      { text: "Certificates", icon: <WorkspacePremiumIcon />, path: "/certificates" },
      { text: "Announcements", icon: <CampaignIcon />, path: "/announcements" },
      { text: "Notifications", icon: <NotificationsIcon />, path: "/notifications" },
      { text: "Reports", icon: <AssessmentIcon />, path: "/reports" },
      { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
    ];
  }

  if (role === "MENTOR") {
    menu = [
      { text: "Dashboard", icon: <DashboardIcon />, path: "/mentor-dashboard" },
      { text: "My Interns", icon: <GroupIcon />, path: "/interns" },
      { text: "Tasks", icon: <TaskIcon />, path: "/tasks" },
      { text: "Meetings", icon: <EventIcon />, path: "/meetings" },
      { text: "Evaluations", icon: <FactCheckIcon />, path: "/evaluations" },
      { text: "Reports", icon: <AssessmentIcon />, path: "/reports" },
      { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
    ];
  }

  if (role === "INTERN") {
    menu = [
      { text: "Dashboard", icon: <DashboardIcon />, path: "/intern-dashboard" },
      { text: "Tasks", icon: <TaskIcon />, path: "/tasks" },
      { text: "Meetings", icon: <EventIcon />, path: "/meetings" },
      { text: "Training", icon: <SchoolIcon />, path: "/training" },
      { text: "Documents", icon: <DescriptionIcon />, path: "/documents" },
      { text: "Certificates", icon: <WorkspacePremiumIcon />, path: "/certificates" },
      { text: "Notifications", icon: <NotificationsIcon />, path: "/notifications" },
      { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
    ];
  }

  return (
    <Box
      sx={{
        width: 260,
        bgcolor: "#1e293b",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          p: 3,
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        InternTrack
      </Typography>

      <List sx={{ px: 1 }}>
        {menu.map((item) => (
          <ListItemButton
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              mb: 1,
              borderRadius: 2,
              color: "#fff",
              "&.Mui-selected": {
                bgcolor: "#2563eb",
              },
              "&.Mui-selected:hover": {
                bgcolor: "#1d4ed8",
              },
              "&:hover": {
                bgcolor: "#334155",
              },
            }}
          >
            <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>

            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

export default Sidebar;