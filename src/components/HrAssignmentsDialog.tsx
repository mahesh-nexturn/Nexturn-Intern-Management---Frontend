import { useEffect, useState } from 'react'

import {
  Alert,
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material'

import type { Hr } from '../types'
import * as hrApi from '../services/hrApi'
import * as mentorApi from '../services/mentorApi'
import * as internApi from '../services/internApi'

type Option = { id: number; label: string }

type HrAssignmentsDialogProps = {
  open: boolean
  hr: Hr | null
  handleClose: () => void
  onSaved: () => void
}

function HrAssignmentsDialog({ open, hr, handleClose, onSaved }: HrAssignmentsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [mentorOptions, setMentorOptions] = useState<Option[]>([])
  const [internOptions, setInternOptions] = useState<Option[]>([])
  const [selectedMentors, setSelectedMentors] = useState<Option[]>([])
  const [selectedInterns, setSelectedInterns] = useState<Option[]>([])

  const [prevOpen, setPrevOpen] = useState<boolean | null>(null)
  const [prevHr, setPrevHr] = useState<Hr | null>(null)
  if (prevOpen !== open || prevHr !== hr) {
    setPrevOpen(open)
    setPrevHr(hr)
    if (open && hr) {
      setLoading(true)
      setError('')
    }
  }

  useEffect(() => {
    if (!open || !hr) return
    let cancelled = false

    Promise.all([
      mentorApi.listMentors(),
      internApi.listInterns(),
      hrApi.listHrMentors(hr.id),
      hrApi.listHrInterns(hr.id),
    ])
      .then(([mentors, interns, hrMentors, hrInterns]) => {
        if (cancelled) return
        const mOpts = mentors.map((m) => ({ id: m.id, label: m.name }))
        const iOpts = interns.map((i) => ({ id: i.id, label: i.name }))
        setMentorOptions(mOpts)
        setInternOptions(iOpts)
        const mIds = new Set(hrMentors.map((m) => m.id))
        const iIds = new Set(hrInterns.map((i) => i.id))
        setSelectedMentors(mOpts.filter((m) => mIds.has(m.id)))
        setSelectedInterns(iOpts.filter((i) => iIds.has(i.id)))
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load assignments.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, hr])

  const handleSave = async () => {
    if (!hr) return
    setSaving(true)
    setError('')
    try {
      // Mentors first: their interns follow the mentor, then the explicit intern set is applied.
      await hrApi.assignMentors(
        hr.id,
        selectedMentors.map((m) => m.id),
      )
      await hrApi.assignInterns(
        hr.id,
        selectedInterns.map((i) => i.id),
      )
      onSaved()
      handleClose()
    } catch {
      setError('Failed to save assignments.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>
        Manage assignments{hr ? ` - ${hr.name}` : ''}
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Assigning a mentor also moves that mentor's interns to this HR.
            </Typography>

            <Autocomplete
              multiple
              options={mentorOptions}
              value={selectedMentors}
              getOptionLabel={(o) => o.label}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              onChange={(_, value) => setSelectedMentors(value)}
              renderInput={(params) => <TextField {...params} label="Mentors" margin="normal" />}
            />

            <Autocomplete
              multiple
              options={internOptions}
              value={selectedInterns}
              getOptionLabel={(o) => o.label}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              onChange={(_, value) => setSelectedInterns(value)}
              renderInput={(params) => <TextField {...params} label="Interns" margin="normal" />}
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={loading || saving}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default HrAssignmentsDialog
