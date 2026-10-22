import { useMemo, useState } from 'react'

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
import {
  useAssignHrInternsMutation,
  useAssignHrMentorsMutation,
  useListHrInternsQuery,
  useListHrMentorsQuery,
  useListInternsQuery,
  useListMentorsQuery,
} from '../store'

type Option = { id: number; label: string }

type HrAssignmentsDialogProps = {
  open: boolean
  hr: Hr | null
  handleClose: () => void
  onSaved: () => void
}

function HrAssignmentsDialog({ open, hr, handleClose, onSaved }: HrAssignmentsDialogProps) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const skip = !open || !hr
  const hrId = hr?.id ?? 0
  const mentorsQuery = useListMentorsQuery(undefined, { skip })
  const internsQuery = useListInternsQuery(undefined, { skip })
  const hrMentorsQuery = useListHrMentorsQuery(hrId, { skip })
  const hrInternsQuery = useListHrInternsQuery(hrId, { skip })
  const [assignMentors] = useAssignHrMentorsMutation()
  const [assignInterns] = useAssignHrInternsMutation()

  const loading =
    !skip &&
    (mentorsQuery.isLoading ||
      internsQuery.isLoading ||
      hrMentorsQuery.isLoading ||
      hrInternsQuery.isLoading)
  const loadFailed =
    !skip &&
    (mentorsQuery.isError ||
      internsQuery.isError ||
      hrMentorsQuery.isError ||
      hrInternsQuery.isError)
  const error = saveError || (loadFailed ? 'Failed to load assignments.' : '')

  const mentorOptions = useMemo<Option[]>(
    () => mentorsQuery.data?.map((m) => ({ id: m.id, label: m.name })) ?? [],
    [mentorsQuery.data],
  )
  const internOptions = useMemo<Option[]>(
    () => internsQuery.data?.map((i) => ({ id: i.id, label: i.name })) ?? [],
    [internsQuery.data],
  )

  // User edits override the server-assigned selection until the dialog is reopened.
  const [editedMentors, setEditedMentors] = useState<Option[] | null>(null)
  const [editedInterns, setEditedInterns] = useState<Option[] | null>(null)

  const [prevOpen, setPrevOpen] = useState<boolean | null>(null)
  const [prevHr, setPrevHr] = useState<Hr | null>(null)
  if (prevOpen !== open || prevHr !== hr) {
    setPrevOpen(open)
    setPrevHr(hr)
    setEditedMentors(null)
    setEditedInterns(null)
    setSaveError('')
  }

  const selectedMentors = useMemo(() => {
    if (editedMentors) return editedMentors
    const ids = new Set(hrMentorsQuery.data?.map((m) => m.id))
    return mentorOptions.filter((m) => ids.has(m.id))
  }, [editedMentors, hrMentorsQuery.data, mentorOptions])
  const selectedInterns = useMemo(() => {
    if (editedInterns) return editedInterns
    const ids = new Set(hrInternsQuery.data?.map((i) => i.id))
    return internOptions.filter((i) => ids.has(i.id))
  }, [editedInterns, hrInternsQuery.data, internOptions])

  const handleSave = async () => {
    if (!hr) return
    setSaving(true)
    setSaveError('')
    try {
      // Mentors first: their interns follow the mentor, then the explicit intern set is applied.
      await assignMentors({ id: hr.id, ids: selectedMentors.map((m) => m.id) }).unwrap()
      await assignInterns({ id: hr.id, ids: selectedInterns.map((i) => i.id) }).unwrap()
      onSaved()
      handleClose()
    } catch {
      setSaveError('Failed to save assignments.')
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
              onChange={(_, value) => setEditedMentors(value)}
              renderInput={(params) => <TextField {...params} label="Mentors" margin="normal" />}
            />

            <Autocomplete
              multiple
              options={internOptions}
              value={selectedInterns}
              getOptionLabel={(o) => o.label}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              onChange={(_, value) => setEditedInterns(value)}
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
