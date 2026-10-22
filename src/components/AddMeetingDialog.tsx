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

import type { Intern, Meeting } from '../types'
import { useDialogs } from '../context/dialogState'

type AddMeetingDialogProps = {
  open: boolean
  handleClose: () => void
  addMeeting: (meeting: Meeting) => void
  selectedMeeting: Meeting
  interns: Intern[]
}

function AddMeetingDialog({
  open,
  handleClose,
  addMeeting,
  selectedMeeting,
  interns,
}: AddMeetingDialogProps) {
  const { notify } = useDialogs()
  const [title, setTitle] = useState('')
  const [agenda, setAgenda] = useState('')
  const [internId, setInternId] = useState<number | ''>('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [status, setStatus] = useState<Meeting['status']>('Scheduled')

  const [prevSelected, setPrevSelected] = useState<Meeting | null>(null)
  if (prevSelected !== selectedMeeting) {
    setPrevSelected(selectedMeeting)
    setTitle(selectedMeeting.title || '')
    setAgenda(selectedMeeting.agenda || '')
    setInternId(selectedMeeting.internId ?? '')
    setDate(selectedMeeting.date || '')
    setTime(selectedMeeting.time || '')
    setStatus(selectedMeeting.status || 'Scheduled')
  }

  const selectedIntern = interns.find((intern) => intern.id === internId)
  // needs the current time on every render, so the meeting locks as soon as it starts
  const statusOnly =
    selectedMeeting.id !== 0 &&
    !!selectedMeeting.date &&
    // eslint-disable-next-line react-hooks/purity
    new Date(`${selectedMeeting.date}T${selectedMeeting.time || '00:00'}`).getTime() <= Date.now()

  const handleSave = () => {
    if (!title.trim()) {
      notify('Please enter a meeting title.')
      return
    }

    if (!internId) {
      notify('Please select an intern.')
      return
    }

    if (!date || !time) {
      notify('Please select both date and time.')
      return
    }

    addMeeting({
      id: selectedMeeting.id,
      title,
      agenda,
      mentor: selectedIntern?.mentor || '',
      mentorId: selectedIntern?.mentorId ?? null,
      intern: selectedIntern?.name || '',
      internId: internId as number,
      date,
      time,
      status,
    })

    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Meeting Details</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label="Title"
          value={title}
          disabled={statusOnly}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          fullWidth
          margin="dense"
          multiline
          rows={3}
          label="Agenda"
          value={agenda}
          disabled={statusOnly}
          onChange={(e) => setAgenda(e.target.value)}
        />

        <TextField
          select
          fullWidth
          margin="dense"
          label="Intern"
          value={internId}
          disabled={statusOnly}
          onChange={(e) => setInternId(e.target.value === '' ? '' : Number(e.target.value))}
        >
          {interns.map((intern) => (
            <MenuItem key={intern.id} value={intern.id}>
              {intern.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          margin="dense"
          type="date"
          value={date}
          disabled={statusOnly}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => setDate(e.target.value)}
        />

        <TextField
          fullWidth
          margin="dense"
          type="time"
          value={time}
          disabled={statusOnly}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => setTime(e.target.value)}
        />

        <TextField
          select
          fullWidth
          margin="dense"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Meeting['status'])}
        >
          <MenuItem value="Scheduled">Scheduled</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Cancelled">Cancelled</MenuItem>
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

export default AddMeetingDialog
