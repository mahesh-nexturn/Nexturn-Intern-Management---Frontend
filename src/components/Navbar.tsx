import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AvatarUploadDialog from "./AvatarUploadDialog";

function Navbar({ setCollapsed, collapsed }: { setCollapsed: (collapsed: boolean) => void; collapsed: boolean }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const avatarKey = `avatar_${sessionStorage.getItem("userId") ?? "me"}`;
  const [avatar, setAvatar] = useState(localStorage.getItem(avatarKey) || "");
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    const sync = () => setAvatar(localStorage.getItem(avatarKey) || "");
    window.addEventListener("avatar-changed", sync);
    return () => window.removeEventListener("avatar-changed", sync);
  }, [avatarKey]);

  const name = sessionStorage.getItem("name") || "User";
  const role = sessionStorage.getItem("role") || "";

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    navigate("/profile");
  };

  
  const handleMenuSettings = () => {
    navigate("/settings");
  };
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "#ffffff",
        color: "#111827",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }} >
          <IconButton edge="start" color="inherit" onClick={() => setCollapsed(!collapsed)}>
            <MenuIcon />
          </IconButton>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              InternTrack
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {role} Portal
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontWeight: 700 }}>{name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {role}
            </Typography>
          </Box>

          <IconButton onClick={handleMenuOpen}>
            <Avatar
              src={avatar || undefined}
              sx={{ bgcolor: "#2563eb", fontWeight: 700 }}
            >
              {name.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuSettings}>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>

          <AvatarUploadDialog
            open={uploadOpen}
            current={avatar}
            onClose={() => setUploadOpen(false)}
            onSave={(url) => {
              if (url) localStorage.setItem(avatarKey, url);
              else localStorage.removeItem(avatarKey);
              window.dispatchEvent(new Event("avatar-changed"));
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;