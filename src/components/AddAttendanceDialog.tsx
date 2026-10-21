import { useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material'

import type { Attendance } from '../types/Attendance'
import type { Intern } from '../types/Intern'
import { useDialogs } from '../context/dialogState'

type AddAttendanceDialogProps = {
  open: boolean
  handleClose: () => void
  addAttendance: (attendance: Attendance, applyToAll?: boolean) => void
  selectedAttendance: Attendance
  interns: Intern[]
}

const ALL = 'ALL'

function AddAttendanceDialog({
  open,
  handleClose,
  addAttendance,
  selectedAttendance,
  interns,
}: AddAttendanceDialogProps) {
  const { notify } = useDialogs()
  const [internId, setInternId] = useState<number | typeof ALL | ''>('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState<Attendance['status']>('Present')

  const isEdit = selectedAttendance.id !== 0
  const isAll = internId === ALL

  const [prevSelected, setPrevSelected] = useState<Attendance | null>(null)
  if (prevSelected !== selectedAttendance) {
    setPrevSelected(selectedAttendance)
    setInternId(selectedAttendance.internId ?? '')
    setDate(selectedAttendance.date || '')
    setStatus(selectedAttendance.status || 'Present')
  }

  const selectedIntern = isAll ? undefined : interns.find((intern) => intern.id === internId)

  const handleSave = () => {
    if (!internId) {
      notify('Please select an intern.')
      return
    }

    if (!date) {
      notify('Please select a date.')
      return
    }

    if (isAll) {
      addAttendance(
        { id: 0, intern: '', internId: null, mentor: '', mentorId: null, date, status },
        true,
      )
      handleClose()
      return
    }

    addAttendance({
      id: selectedAttendance.id,
      intern: selectedIntern?.name || '',
      internId: internId as number,
      mentor: selectedIntern?.mentor || '',
      mentorId: selectedIntern?.mentorId ?? null,
      date,
      status,
    })

    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Attendance Details</DialogTitle>

      <DialogContent>
        <TextField
          select
          fullWidth
          margin="dense"
          label="Intern"
          value={internId}
          helperText={
            isAll
              ? `Will be applied to all ${interns.length} intern${interns.length === 1 ? '' : 's'} assigned to you.`
              : undefined
          }
          onChange={(e) =>
            setInternId(
              e.target.value === '' ? '' : e.target.value === ALL ? ALL : Number(e.target.value),
            )
          }
        >
          {!isEdit && interns.length > 0 && (
            <MenuItem value={ALL}>All Interns ({interns.length})</MenuItem>
          )}
          {interns.map((intern) => (
            <MenuItem key={intern.id} value={intern.id}>
              {intern.name}
            </MenuItem>
          ))}
        </TextField>

        {!isAll && (
          <TextField
            fullWidth
            margin="dense"
            label="Mentor"
            value={selectedIntern?.mentor || ''}
            disabled
          />
        )}
        <TextField
          fullWidth
          type="date"
          margin="dense"
          value={date}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => setDate(e.target.value)}
        />

        <TextField
          select
          fullWidth
          margin="dense"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Attendance['status'])}
        >
          <MenuItem value="Present">Present</MenuItem>
          <MenuItem value="Absent">Absent</MenuItem>
          <MenuItem value="Leave">Leave</MenuItem>
          <MenuItem value="Holiday">Holiday</MenuItem>
          <MenuItem value="WFH">WFH</MenuItem>
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddAttendanceDialog
