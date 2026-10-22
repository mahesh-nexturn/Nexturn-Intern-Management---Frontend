import { useEffect, useMemo, useState } from 'react'

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
  Typography,
} from '@mui/material'

import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import AttendanceCalendar from '../components/AttendanceCalendar'
import AddAttendanceDialog from '../components/AddAttendanceDialog'
import AttendanceCheckInCard from '../components/AttendanceCheckInCard'
import ApplyLeaveDialog from '../components/ApplyLeaveDialog'
import LeaveRequestsPanel from '../components/LeaveRequestsPanel'
import * as leaveApi from '../services/leaveApi'

import type { Attendance as AttendanceType, Intern, Mentor } from '../types'
import * as attendanceApi from '../services/attendanceApi'
import { toUiAttendance } from '../utils/mappers/attendanceMapper'
import { useDialogs } from '../context/dialogState'

type AttendanceProps = {
  attendance: AttendanceType[]
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceType[]>>
  interns: Intern[]
  mentors: Mentor[]
}

type Role = 'HR' | 'MENTOR' | 'INTERN' | null

function formatTime(iso?: string | null) {
  return iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
}

function Attendance({ attendance, setAttendance, interns, mentors }: AttendanceProps) {
  const { notify } = useDialogs()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [selectedInternName, setSelectedInternName] = useState('')
  const [leaveRefresh, setLeaveRefresh] = useState(0)
  const [weekRecords, setWeekRecords] = useState<AttendanceType[]>([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [toast, setToast] = useState<{
    message: string
    severity: 'success' | 'error'
  } | null>(null)

  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceType>({
    id: 0,
    intern: '',
    internId: null,
    mentor: '',
    mentorId: null,
    date: '',
    status: 'Present',
  })

  const role = sessionStorage.getItem('role') as Role
  const userName = sessionStorage.getItem('name') || ''

  const isHr = role === 'HR'
  const isMentor = role === 'MENTOR'
  const canManageAttendance = isHr || isMentor

  const [now, setNow] = useState(() => Date.now())
  const [requiredMs, setRequiredMs] = useState(3 * 60 * 60 * 1000)
  const hasInProgress = attendance.some((r) => r.checkInTime && !r.checkOutTime)
  useEffect(() => {
    if (!hasInProgress) return
    const id = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(id)
  }, [hasInProgress])

  useEffect(() => {
    attendanceApi
      .listAttendance()
      .then((list) => setAttendance(list.map((item) => toUiAttendance(item, interns, mentors))))
      .catch(() => setToast({ message: 'Failed to load attendance.', severity: 'error' }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const weekRange = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7) + weekOffset * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return { from: fmt(start), to: fmt(end) }
  }, [weekOffset])

  useEffect(() => {
    attendanceApi
      .listAttendance({
        from: weekRange.from,
        to: weekRange.to,
        status: statusFilter === 'All' ? undefined : statusFilter,
      })
      .then((list) => setWeekRecords(list.map((item) => toUiAttendance(item, interns, mentors))))
      .catch(() => setToast({ message: 'Failed to load attendance.', severity: 'error' }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekRange, statusFilter, attendance])

  const attendanceWithMentor = useMemo(
    () =>
      attendance.map((record) => ({
        ...record,
        mentor:
          mentors.find((mentor) => mentor.id === record.mentorId)?.name ??
          interns.find((intern) => intern.id === record.internId)?.mentor ??
          record.mentor,
      })),
    [attendance, interns, mentors],
  )

  const visibleAttendance = useMemo(() => {
    if (isHr) return attendanceWithMentor
    if (isMentor) {
      return attendanceWithMentor.filter((record) => record.mentor === userName)
    }
    return attendanceWithMentor.filter((record) => record.intern === userName)
  }, [attendanceWithMentor, isHr, isMentor, userName])

  const filteredAttendance = useMemo(() => {
    const scoped = weekRecords.map((record) => ({
      ...record,
      mentor:
        mentors.find((mentor) => mentor.id === record.mentorId)?.name ??
        interns.find((intern) => intern.id === record.internId)?.mentor ??
        record.mentor,
    }))
    const real = isHr
      ? scoped
      : isMentor
        ? scoped.filter((record) => record.mentor === userName)
        : scoped.filter((record) => record.intern === userName)

    // Weekdays from the join date up to yesterday without a record are shown as Absent.
    const visibleInterns = isHr
      ? interns
      : isMentor
        ? interns.filter((intern) => intern.mentor === userName)
        : interns.filter((intern) => intern.name === userName)
    const todayStr = (() => {
      const n = new Date()
      return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
    })()
    const implicit: AttendanceType[] = []
    if (statusFilter === 'All' || statusFilter === 'Absent') {
      const [fy, fm, fd] = weekRange.from.split('-').map(Number)
      visibleInterns.forEach((intern) => {
        const joined = (intern.createTime || '').slice(0, 10)
        if (!joined) return
        for (let i = 0; i < 7; i++) {
          const d = new Date(fy, fm - 1, fd + i)
          const dow = d.getDay()
          const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          if (dow === 0 || dow === 6 || date < joined || date >= todayStr) continue
          if (real.some((r) => r.internId === intern.id && r.date === date)) continue
          implicit.push({
            id: -(intern.id * 100 + i + 1),
            intern: intern.name,
            internId: intern.id,
            mentor: intern.mentor,
            mentorId: intern.mentorId ?? null,
            date,
            status: 'Absent',
          })
        }
      })
    }
    const byIntern = selectedInternName
      ? [...real, ...implicit].filter((r) => r.intern === selectedInternName)
      : [...real, ...implicit]
    return byIntern.sort((a, b) => b.date.localeCompare(a.date) || a.intern.localeCompare(b.intern))
  }, [
    weekRecords,
    mentors,
    interns,
    isHr,
    isMentor,
    userName,
    statusFilter,
    weekRange,
    selectedInternName,
  ])

  // A day still being worked shows nothing in the calendar until the required hours are reached, then Present.
  const calendarAttendance = useMemo(
    () =>
      visibleAttendance.map((record) => {
        if (!record.checkInTime || record.checkOutTime) return record
        const worked =
          (record.workedSeconds ?? 0) * 1000 + now - new Date(record.checkInTime).getTime()
        return worked >= requiredMs ? { ...record, status: 'Present' as const } : record
      }),
    [visibleAttendance, now, requiredMs],
  )

  const handleCheckInChange = (dto: attendanceApi.AttendanceDto, requiredSeconds: number) => {
    setRequiredMs(requiredSeconds * 1000)
    const ui = toUiAttendance(dto, interns, mentors)
    setAttendance((prev) =>
      prev.some((item) => item.id === ui.id)
        ? prev.map((item) => (item.id === ui.id ? ui : item))
        : [...prev, ui],
    )
  }

  const handleOpen = () => {
    setEditId(null)
    setSelectedAttendance({
      id: 0,
      intern: '',
      internId: null,
      mentor: '',
      mentorId: null,
      date: '',
      status: 'Present',
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const saveAttendance = async (record: AttendanceType, applyToAll?: boolean) => {
    if (applyToAll) {
      if (interns.length === 0) {
        setToast({ message: 'No interns assigned.', severity: 'error' })
        return
      }
      try {
        const created = await Promise.all(
          interns.map((intern) =>
            attendanceApi.createAttendance({
              internId: intern.id,
              mentorId: intern.mentorId ?? null,
              attendanceDate: record.date,
              status: record.status,
            }),
          ),
        )
        const ui = created.map((dto) => toUiAttendance(dto, interns, mentors))
        const ids = new Set(ui.map((item) => item.id))
        setAttendance((prev) => [...prev.filter((item) => !ids.has(item.id)), ...ui])
        setToast({
          message: `${record.status} applied to ${created.length} interns.`,
          severity: 'success',
        })
        setEditId(null)
        setOpen(false)
      } catch {
        setToast({ message: 'Failed to apply attendance to all interns.', severity: 'error' })
      }
      return
    }

    if (!record.internId) {
      notify('Please select an intern.')
      return
    }

    const payload: attendanceApi.AttendancePayload = {
      internId: record.internId,
      mentorId: record.mentorId ?? null,
      attendanceDate: record.date,
      status: record.status,
    }

    try {
      if (editId !== null) {
        const updated = await attendanceApi.updateAttendance(editId, payload)
        setAttendance((prev) =>
          prev.map((item) =>
            item.id === editId ? toUiAttendance(updated, interns, mentors) : item,
          ),
        )
        setToast({ message: 'Attendance updated successfully.', severity: 'success' })
      } else {
        const created = await attendanceApi.createAttendance(payload)
        setAttendance((prev) => [...prev, toUiAttendance(created, interns, mentors)])
        setToast({ message: 'Attendance recorded successfully.', severity: 'success' })
      }

      setEditId(null)
      setOpen(false)
    } catch {
      setToast({ message: 'Failed to save attendance.', severity: 'error' })
    }
  }

  const editAttendance = (id: number) => {
    const record = filteredAttendance.find((item) => item.id === id)
    if (!record) return

    setEditId(record.id)
    setSelectedAttendance(record)
    setOpen(true)
  }

  const deleteAttendance = async (id: number) => {
    try {
      await attendanceApi.deleteAttendance(id)
      setAttendance((prev) => prev.filter((item) => item.id !== id))
      setToast({ message: 'Attendance deleted successfully.', severity: 'success' })
    } catch {
      setToast({ message: 'Failed to delete attendance.', severity: 'error' })
    }
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h4">Attendance</Typography>

        {role === 'INTERN' && (
          <Button variant="contained" onClick={() => setLeaveOpen(true)}>
            Apply Leave
          </Button>
        )}

        {canManageAttendance && (
          <Button variant="contained" onClick={handleOpen}>
            Add Attendance
          </Button>
        )}
      </Box>

      {role === 'INTERN' && <AttendanceCheckInCard onChange={handleCheckInChange} />}

      <AttendanceCalendar
        attendance={calendarAttendance}
        interns={interns}
        onInternChange={setSelectedInternName}
      />

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          my: 3,
          flexWrap: 'wrap',
        }}
      >
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Present">Present</MenuItem>
            <MenuItem value="Absent">Absent</MenuItem>
            <MenuItem value="Leave">Leave</MenuItem>
            <MenuItem value="Holiday">Holiday</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Intern</TableCell>
              <TableCell>Mentor</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Status</TableCell>
              {canManageAttendance && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredAttendance.length === 0 ? (
              <TableRow>
                <TableCell align="center" colSpan={canManageAttendance ? 7 : 6}>
                  No attendance records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAttendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.intern}</TableCell>
                  <TableCell>{record.mentor || '-'}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{formatTime(record.checkInTime)}</TableCell>
                  <TableCell>{formatTime(record.checkOutTime)}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        record.checkInTime && !record.checkOutTime ? 'In progress' : record.status
                      }
                      color="primary"
                    />
                  </TableCell>
                  {canManageAttendance && (
                    <TableCell>
                      {record.id > 0 && (
                        <>
                          <IconButton color="primary" onClick={() => editAttendance(record.id)}>
                            <EditIcon />
                          </IconButton>

                          <IconButton color="error" onClick={() => deleteAttendance(record.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
        <IconButton onClick={() => setWeekOffset((w) => w - 1)} aria-label="Previous week">
          <ChevronLeftIcon />
        </IconButton>
        <IconButton onClick={() => setWeekOffset((w) => w + 1)} aria-label="Next week">
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {(role === 'INTERN' || isHr) && (
        <LeaveRequestsPanel
          isApprover={isHr}
          internName={isHr ? selectedInternName : undefined}
          refreshKey={leaveRefresh}
          onChanged={() =>
            attendanceApi
              .listAttendance()
              .then((list) =>
                setAttendance(list.map((item) => toUiAttendance(item, interns, mentors))),
              )
          }
          onError={(message) => setToast({ message, severity: 'error' })}
        />
      )}

      <ApplyLeaveDialog
        open={leaveOpen}
        hrName={interns.find((intern) => intern.name === userName)?.hrName}
        onClose={() => setLeaveOpen(false)}
        onSubmit={async (payload) => {
          await leaveApi.applyLeave(payload)
          setLeaveRefresh((n) => n + 1)
          setToast({ message: 'Leave request sent to HR for approval.', severity: 'success' })
        }}
      />

      <AddAttendanceDialog
        open={open}
        handleClose={handleClose}
        addAttendance={saveAttendance}
        selectedAttendance={selectedAttendance}
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

export default Attendance
