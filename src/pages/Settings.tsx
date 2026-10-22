import { useState } from 'react'

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

import {
  useChangePasswordMutation,
  useGetMySettingsQuery,
  useUpdateMySettingsMutation,
} from '../store'

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

type NotificationDraft = {
  emailNotifications?: boolean
  pushNotifications?: boolean
}

function Settings() {
  const { data: serverSettings, isLoading: loading } = useGetMySettingsQuery()
  const [updateSettings, { isLoading: saving }] = useUpdateMySettingsMutation()
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation()

  // Unsaved switch changes layered over the cached server settings.
  const [draft, setDraft] = useState<NotificationDraft>({})
  const settings = serverSettings ? { ...serverSettings, ...draft } : null

  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(defaultPasswordForm)

  const [toast, setToast] = useState<ToastState>(null)

  const handleSaveSettings = async () => {
    if (!settings) return

    try {
      await updateSettings({
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        theme: settings.theme,
        phone: settings.phone ?? '',
      }).unwrap()
      setDraft({})
      setToast({
        message: 'Settings updated.',
        severity: 'success',
      })
    } catch {
      setToast({
        message: 'Failed to update settings.',
        severity: 'error',
      })
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

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap()
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
                    setDraft((current) => ({ ...current, emailNotifications: e.target.checked }))
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
                    setDraft((current) => ({ ...current, pushNotifications: e.target.checked }))
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
