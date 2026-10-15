import { useState } from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'

import type { LeavePayload } from '../services/leaveApi'

const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Emergency Leave', 'Other']

type Props = {
  open: boolean
  hrName?: string | null
  onClose: () => void
  onSubmit: (payload: LeavePayload) => Promise<void>
}

const emptyForm = { leaveType: '', fromDate: '', toDate: '', teamEmail: '', reason: '' }

function ApplyLeaveDialog({ open, hrName, onClose, onSubmit }: Props) {
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof emptyForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const close = () => {
    setForm(emptyForm)
    setError('')
    onClose()
  }

  const submit = async () => {
    if (!form.leaveType || !form.fromDate || !form.toDate) {
      setError('Leave type and both dates are required.')
      return
    }
    if (form.toDate < form.fromDate) {
      setError('End date cannot be before start date.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        leaveType: form.leaveType,
        fromDate: form.fromDate,
        toDate: form.toDate,
        teamEmail: form.teamEmail || undefined,
        reason: form.reason || undefined,
      })
      close()
    } catch (e) {
      const message = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message || 'Failed to submit leave request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>Apply Leave</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {hrName
              ? `This request will be sent to ${hrName} for approval.`
              : 'No HR is assigned to you; the request will be visible to all HR.'}
          </Typography>

          <TextField
            select
            required
            label="Leave type"
            value={form.leaveType}
            onChange={(e) => set('leaveType')(e.target.value)}
          >
            {LEAVE_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              required
              fullWidth
              type="date"
              label="From"
              slotProps={{ inputLabel: { shrink: true } }}
              value={form.fromDate}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  fromDate: e.target.value,
                  toDate:
                    prev.toDate && prev.toDate < e.target.value ? e.target.value : prev.toDate,
                }))
              }
            />
            <TextField
              required
              fullWidth
              type="date"
              label="To"
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: form.fromDate || undefined },
              }}
              value={form.toDate}
              onChange={(e) => set('toDate')(e.target.value)}
            />
          </Box>

          <TextField
            label="Team Email ID"
            value={form.teamEmail}
            onChange={(e) => set('teamEmail')(e.target.value)}
          />

          <TextField
            label="Reason for leave"
            multiline
            minRows={3}
            value={form.reason}
            onChange={(e) => set('reason')(e.target.value)}
          />

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" onClick={submit} disabled={submitting}>
          Submit
        </Button>
        <Button onClick={close} disabled={submitting}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ApplyLeaveDialog
