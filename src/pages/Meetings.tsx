import { useMemo, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import type { Meeting } from '../types'

import AddMeetingDialog from '../components/AddMeetingDialog'
import MeetingChart from '../components/MeetingChart'
import type { meetingApi } from '../services'
import {
  useCreateMeetingMutation,
  useDeleteMeetingMutation,
  useUpdateMeetingMutation,
} from '../store'
import { useInterns, useMeetings } from '../hooks/useAppData'
import { useDialogs } from '../context/dialogState'

type Role = 'HR' | 'MENTOR' | 'INTERN' | null

function Meetings() {
  const { notify } = useDialogs()
  const { meetings } = useMeetings()
  const { interns } = useInterns()
  const [createMeeting] = useCreateMeetingMutation()
  const [updateMeeting] = useUpdateMeetingMutation()
  const [deleteMeetingMutation] = useDeleteMeetingMutation()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [toast, setToast] = useState<{
    message: string
    severity: 'success' | 'error'
  } | null>(null)

  const [selectedMeeting, setSelectedMeeting] = useState<Meeting>({
    id: 0,
    title: '',
    agenda: '',
    mentor: '',
    mentorId: null,
    intern: '',
    internId: null,
    date: '',
    time: '',
    status: 'Scheduled',
  })

  const role = sessionStorage.getItem('role') as Role
  const userName = sessionStorage.getItem('name') || ''

  const isHr = role === 'HR'
  const isMentor = role === 'MENTOR'
  const isIntern = role === 'INTERN'
  const canManageMeetings = isMentor

  const visibleMeetings = useMemo(() => {
    if (isHr) return meetings
    if (isMentor) return meetings.filter((meeting) => meeting.mentor === userName)
    if (isIntern) return meetings.filter((meeting) => meeting.intern === userName)
    return []
  }, [isHr, isIntern, isMentor, meetings, userName])

  const filteredMeetings = visibleMeetings
    .filter((meeting) => meeting.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((meeting) => statusFilter === 'All' || meeting.status === statusFilter)

  const totalMeetings = visibleMeetings.length
  const scheduledCount = visibleMeetings.filter((meeting) => meeting.status === 'Scheduled').length
  const completedCount = visibleMeetings.filter((meeting) => meeting.status === 'Completed').length
  const cancelledCount = visibleMeetings.filter((meeting) => meeting.status === 'Cancelled').length

  const handleOpen = () => {
    setEditId(null)
    setSelectedMeeting({
      id: 0,
      title: '',
      agenda: '',
      mentor: '',
      mentorId: null,
      intern: '',
      internId: null,
      date: '',
      time: '',
      status: 'Scheduled',
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const saveMeeting = async (meeting: Meeting) => {
    if (!meeting.internId) {
      notify('Please select an intern.')
      return
    }

    const payload: meetingApi.MeetingPayload = {
      title: meeting.title,
      agenda: meeting.agenda,
      mentorId: meeting.mentorId ?? null,
      internId: meeting.internId,
      meetingDate: meeting.date,
      meetingTime: meeting.time,
      status: meeting.status,
    }

    try {
      if (editId !== null) {
        await updateMeeting({ id: editId, payload }).unwrap()
        setToast({ message: 'Meeting updated successfully.', severity: 'success' })
      } else {
        await createMeeting(payload).unwrap()
        setToast({ message: 'Meeting created successfully.', severity: 'success' })
      }

      setEditId(null)
      setOpen(false)
    } catch {
      setToast({ message: 'Failed to save meeting.', severity: 'error' })
    }
  }

  const editMeeting = (id: number) => {
    const meeting = filteredMeetings.find((item) => item.id === id)
    if (!meeting) return

    setEditId(meeting.id)
    setSelectedMeeting(meeting)
    setOpen(true)
  }

  const deleteMeeting = async (id: number) => {
    try {
      await deleteMeetingMutation(id).unwrap()
      setToast({ message: 'Meeting deleted successfully.', severity: 'success' })
    } catch {
      setToast({ message: 'Failed to delete meeting.', severity: 'error' })
    }
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h4">Meetings</Typography>

        {canManageMeetings && (
          <Button variant="contained" onClick={handleOpen}>
            Add Meeting
          </Button>
        )}
      </Box>

      <MeetingChart
        total={totalMeetings}
        scheduled={scheduledCount}
        completed={completedCount}
        cancelled={cancelledCount}
      />

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <TextField
          label={isMentor ? 'Search by Intern' : 'Search by Mentor or Intern'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Scheduled">Scheduled</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Agenda</TableCell>
              {!isIntern && <TableCell>Intern</TableCell>}
              {!isMentor && <TableCell>Mentor</TableCell>}
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              {canManageMeetings && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredMeetings.length === 0 ? (
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={
                    5 + (isIntern ? 0 : 1) + (isMentor ? 0 : 1) + (canManageMeetings ? 1 : 0)
                  }
                >
                  No meetings found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMeetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell>{meeting.title}</TableCell>
                  <TableCell
                    title={meeting.agenda}
                    sx={{
                      maxWidth: 280,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {meeting.agenda || '-'}
                  </TableCell>
                  {!isIntern && <TableCell>{meeting.intern}</TableCell>}
                  {!isMentor && <TableCell>{meeting.mentor || '-'}</TableCell>}
                  <TableCell>{meeting.date}</TableCell>
                  <TableCell>{meeting.time}</TableCell>
                  <TableCell>
                    <Chip
                      label={meeting.status}
                      color={
                        meeting.status === 'Completed'
                          ? 'success'
                          : meeting.status === 'Scheduled'
                            ? 'primary'
                            : 'error'
                      }
                    />
                  </TableCell>

                  {canManageMeetings && (
                    <TableCell>
                      <IconButton color="primary" onClick={() => editMeeting(meeting.id)}>
                        <EditIcon />
                      </IconButton>

                      <IconButton color="error" onClick={() => deleteMeeting(meeting.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddMeetingDialog
        open={open}
        handleClose={handleClose}
        addMeeting={saveMeeting}
        selectedMeeting={selectedMeeting}
        interns={interns}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  )
}

export default Meetings
