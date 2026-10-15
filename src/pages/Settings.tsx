import { useEffect, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Paper,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from '@mui/material'

import * as authApi from '../services/authApi'
import * as settingsApi from '../services/settingsApi'

type ToastState = {
  message: string
  severity: 'success' | 'error'
} | null

type PasswordFormState = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const defaultPasswordForm: PasswordFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

function Settings() {
  const [settings, setSettings] = useState<settingsApi.SettingsDto | null>(null)

  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(defaultPasswordForm)

  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)

  const [changingPassword, setChangingPassword] = useState(false)

  const [toast, setToast] = useState<ToastState>(null)

  useEffect(() => {
    let cancelled = false

    settingsApi
      .getMySettings()
      .then((data) => {
        if (!cancelled) {
          setSettings(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setToast({
            message: 'Failed to load settings.',
            severity: 'error',
          })
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleSaveSettings = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const updated = await settingsApi.updateMySettings({
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        theme: settings.theme,
        phone: settings.phone ?? '',
      })
      setSettings(updated)
      setToast({
        message: 'Settings updated.',
        severity: 'success',
      })
    } catch {
      setToast({
        message: 'Failed to update settings.',
        severity: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setToast({
        message: 'Fill in all password fields.',
        severity: 'error',
      })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({
        message: 'New passwords do not match.',
        severity: 'error',
      })
      return
    }

    setChangingPassword(true)
    try {
      await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordForm(defaultPasswordForm)
      setToast({
        message: 'Password changed.',
        severity: 'success',
      })
    } catch {
      setToast({
        message: 'Failed to change password.',
        severity: 'error',
      })
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: '#f5f7fb',
        minHeight: '100vh',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Settings
        </Typography>
        <Typography
          sx={{
            color: 'text.secondary',
            mt: 0.5,
          }}
        >
          Manage your notifications and password.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 640px)',
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
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Security & Notifications
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
            }}
          >
            <TextField
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
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
                  newPassword: e.target.value,
                })
              }
            />

            <TextField
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  void handleChangePassword()
                }}
                disabled={changingPassword}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                {changingPassword ? 'Updating...' : 'Change Password'}
              </Button>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Notifications
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings?.emailNotifications ?? false}
                  onChange={(e) =>
                    setSettings((current) =>
                      current
                        ? {
                            ...current,
                            emailNotifications: e.target.checked,
                          }
                        : current,
                    )
                  }
                />
              }
              label="Email notifications"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings?.pushNotifications ?? false}
                  onChange={(e) =>
                    setSettings((current) =>
                      current
                        ? {
                            ...current,
                            pushNotifications: e.target.checked,
                          }
                        : current,
                    )
                  }
                />
              }
              label="Push notifications"
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  void handleSaveSettings()
                }}
                disabled={saving || loading || !settings}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                {saving ? 'Saving...' : 'Save Notifications'}
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
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  )
}

export default Settings
