import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { useAuth } from "../context/AuthContext";
import { backendRoleToUi } from "../context/AuthContext";
import * as authApi from "../services/authApi";
import * as settingsApi from "../services/settingsApi";

type ToastState = {
  message: string;
  severity: "success" | "error";
} | null;

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const defaultPasswordForm: PasswordFormState =
  {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

function Settings() {
  const { user } = useAuth();

  const [settings, setSettings] =
    useState<settingsApi.SettingsDto | null>(
      null
    );

  const [passwordForm, setPasswordForm] =
    useState<PasswordFormState>(
      defaultPasswordForm
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [toast, setToast] =
    useState<ToastState>(null);

  useEffect(() => {
    let cancelled = false;

    settingsApi
      .getMySettings()
      .then((data) => {
        if (!cancelled) {
          setSettings(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setToast({
            message:
              "Failed to load settings.",
            severity: "error",
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const displayName =
    settings?.name ??
    user?.name ??
    localStorage.getItem("name") ??
    "";

  const displayEmail =
    settings?.email ??
    user?.email ??
    localStorage.getItem("email") ??
    "";

  const displayRole =
    settings?.role
      ? backendRoleToUi(
          settings.role as authApi.BackendRole
        )
      : user?.role ??
        localStorage.getItem("role") ??
        "";

  const handleSaveSettings =
    async () => {
      if (!settings) return;

      setSaving(true);
      try {
        const updated =
          await settingsApi.updateMySettings({
            emailNotifications:
              settings.emailNotifications,
            pushNotifications:
              settings.pushNotifications,
            theme: settings.theme,
            phone:
              settings.phone ?? "",
          });
        setSettings(updated);
        setToast({
          message:
            "Settings updated.",
          severity: "success",
        });
      } catch {
        setToast({
          message:
            "Failed to update settings.",
          severity: "error",
        });
      } finally {
        setSaving(false);
      }
    };

  const handleChangePassword =
    async () => {
      if (
        !passwordForm.currentPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        setToast({
          message:
            "Fill in all password fields.",
          severity: "error",
        });
        return;
      }

      if (
        passwordForm.newPassword !==
        passwordForm.confirmPassword
      ) {
        setToast({
          message:
            "New passwords do not match.",
          severity: "error",
        });
        return;
      }

      setChangingPassword(true);
      try {
        await authApi.changePassword(
          passwordForm.currentPassword,
          passwordForm.newPassword
        );
        setPasswordForm(
          defaultPasswordForm
        );
        setToast({
          message:
            "Password changed.",
          severity: "success",
        });
      } catch {
        setToast({
          message:
            "Failed to change password.",
          severity: "error",
        });
      } finally {
        setChangingPassword(false);
      }
    };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800 }}
        >
          Settings
        </Typography>
        <Typography
          sx={{
            color: "text.secondary",
            mt: 0.5,
          }}
        >
          Manage your profile,
          preferences, and password.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1.2fr 1fr",
          },
          gap: 3,
        }}
      >
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 4,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Profile & Preferences
          </Typography>

          <Box
            sx={{
              display: "grid",
              gap: 2,
            }}
          >
            <TextField
              label="Name"
              value={displayName}
              disabled
            />

            <TextField
              label="Email"
              value={displayEmail}
              disabled
            />

            <TextField
              label="Role"
              value={displayRole}
              disabled
            />

            <Divider sx={{ my: 1 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={
                    settings?.emailNotifications ??
                    false
                  }
                  onChange={(e) =>
                    setSettings((current) =>
                      current
                        ? {
                            ...current,
                            emailNotifications:
                              e.target
                                .checked,
                          }
                        : current
                    )
                  }
                />
              }
              label="Email notifications"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={
                    settings?.pushNotifications ??
                    false
                  }
                  onChange={(e) =>
                    setSettings((current) =>
                      current
                        ? {
                            ...current,
                            pushNotifications:
                              e.target
                                .checked,
                          }
                        : current
                    )
                  }
                />
              }
              label="Push notifications"
            />

            <FormControl fullWidth>
              <InputLabel>
                Theme
              </InputLabel>
              <Select
                value={
                  settings?.theme ??
                  "light"
                }
                label="Theme"
                onChange={(e) =>
                  setSettings((current) =>
                    current
                      ? {
                          ...current,
                          theme:
                            e.target
                              .value,
                        }
                      : current
                  )
                }
              >
                <MenuItem value="light">
                  Light
                </MenuItem>
                <MenuItem value="dark">
                  Dark
                </MenuItem>
                <MenuItem value="system">
                  System
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Phone"
              value={
                settings?.phone ?? ""
              }
              onChange={(e) =>
                setSettings((current) =>
                  current
                    ? {
                        ...current,
                        phone:
                          e.target.value,
                      }
                    : current
                )
              }
              placeholder="Enter phone number"
            />

            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "flex-end",
              }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  void handleSaveSettings();
                }}
                disabled={
                  saving || loading || !settings
                }
                sx={{
                  textTransform:
                    "none",
                  fontWeight: 700,
                }}
              >
                {saving
                  ? "Saving..."
                  : "Save Settings"}
              </Button>
            </Box>
          </Box>
        </Paper>

        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 4,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Change Password
          </Typography>

          <Box
            sx={{
              display: "grid",
              gap: 2,
            }}
          >
            <TextField
              label="Current Password"
              type="password"
              value={
                passwordForm.currentPassword
              }
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword:
                    e.target.value,
                })
              }
            />

            <TextField
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword:
                    e.target.value,
                })
              }
            />

            <TextField
              label="Confirm New Password"
              type="password"
              value={
                passwordForm.confirmPassword
              }
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword:
                    e.target.value,
                })
              }
            />

            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "flex-end",
              }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  void handleChangePassword();
                }}
                disabled={changingPassword}
                sx={{
                  textTransform:
                    "none",
                  fontWeight: 700,
                }}
              >
                {changingPassword
                  ? "Updating..."
                  : "Change Password"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        {toast ? (
          <Alert
            severity={toast.severity}
            onClose={() => setToast(null)}
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

export default Settings;