import { useEffect, useState } from 'react'

import { Alert, Box, Button, Chip, Paper, Typography } from '@mui/material'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'

import { useCheckInMutation, useCheckOutMutation, useGetTodayAttendanceQuery } from '../store'

function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function AttendanceCheckInCard() {
  const {
    data: today,
    isError: loadFailed,
    refetch,
    fulfilledTimeStamp,
  } = useGetTodayAttendanceQuery(undefined, { refetchOnMountOrArgChange: true })
  const [checkIn, { isLoading: checkingIn }] = useCheckInMutation()
  const [checkOut, { isLoading: checkingOut }] = useCheckOutMutation()
  const [actionError, setActionError] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const busy = checkingIn || checkingOut
  const error = actionError || (loadFailed && !today ? "Failed to load today's attendance." : '')

  // server clock minus browser clock (at fetch time), so the timer is correct even if the browser clock is off
  const offset =
    today && fulfilledTimeStamp ? new Date(today.serverTime).getTime() - fulfilledTimeStamp : 0

  const record = today?.record ?? null
  const checkedIn = !!record?.checkInTime
  const checkedOut = !!record?.checkOutTime
  const running = checkedIn && !checkedOut

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running])

  const required = today?.requiredSeconds ?? 10800
  const requiredHours = Math.round((required / 3600) * 10) / 10
  const start = record?.checkInTime ? new Date(record.checkInTime).getTime() : 0
  const sessionSeconds = running ? (now + offset - start) / 1000 : 0
  const elapsed = (record?.workedSeconds ?? 0) + sessionSeconds
  const reached = elapsed >= required

  // The server auto-checks-out after 24 hours; refresh so the card reflects it.
  useEffect(() => {
    if (running && sessionSeconds >= 24 * 3600) void refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, sessionSeconds >= 24 * 3600])

  const run = async (action: () => { unwrap: () => Promise<unknown> }) => {
    setActionError('')
    try {
      await action().unwrap()
    } catch (e: unknown) {
      setActionError((e as { message?: string })?.message || 'Action failed. Please try again.')
    }
  }

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="h6">Today's Attendance</Typography>
          <Typography variant="body2" color="text.secondary">
            Work at least {requiredHours} hours to be marked Present.
          </Typography>
        </Box>

        {checkedIn && (
          <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
            {formatDuration(elapsed)}
          </Typography>
        )}

        {checkedIn && (
          <Chip
            color={reached ? 'success' : 'warning'}
            label={
              reached
                ? 'Present'
                : running
                  ? 'In progress'
                  : `Absent (under ${requiredHours} hours)`
            }
          />
        )}

        <Box sx={{ ml: 'auto' }}>
          {!running && (
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              disabled={busy || !today}
              onClick={() => run(checkIn)}
            >
              {checkedOut ? 'Check In Again' : 'Check In'}
            </Button>
          )}
          {running && (
            <Button
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              disabled={busy}
              onClick={() => run(checkOut)}
            >
              Check Out
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setActionError('')}>
          {error}
        </Alert>
      )}
    </Paper>
  )
}

export default AttendanceCheckInCard
