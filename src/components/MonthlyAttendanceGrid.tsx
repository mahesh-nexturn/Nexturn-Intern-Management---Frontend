import { Box, Paper, Typography } from '@mui/material'
import type { Attendance } from '../types/Attendance'

type Props = {
  attendance: Attendance[]
  /** First day (YYYY-MM-DD) of the intern; past days without a record from here on count as Absent. */
  startDate?: string
  /** Selected year and 1-based month; falls back to the first record's month. */
  year?: number
  month?: number
}

type StatusType = 'Present' | 'Absent' | 'Leave' | 'Holiday' | 'WFH' | ''

function MonthlyAttendanceGrid({ attendance, startDate, year: yearProp, month: monthProp }: Props) {
  const today = new Date()
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const baseDate =
    yearProp && monthProp
      ? new Date(yearProp, monthProp - 1, 1)
      : attendance.length > 0
        ? new Date(attendance[0].date)
        : today

  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()

  const monthName = baseDate.toLocaleString('en-US', {
    month: 'long',
  })

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'Present':
        return '#e8f5e9'
      case 'Absent':
        return '#ffebee'
      case 'Leave':
        return '#e3f2fd'
      case 'Holiday':
        return '#f3e5f5'
      case 'WFH':
        return '#fff3e0'
      default:
        return '#fafafa'
    }
  }

  const getStatusTextColor = (status: StatusType) => {
    switch (status) {
      case 'Present':
        return '#2e7d32'
      case 'Absent':
        return '#c62828'
      case 'Leave':
        return '#1565c0'
      case 'Holiday':
        return '#6a1b9a'
      case 'WFH':
        return '#ef6c00'
      default:
        return '#333'
    }
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyCells = Array.from({ length: firstDayOfWeek }, () => null)
  const allCells = [...emptyCells, ...days]

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {monthName} {year}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: 1,
        }}
      >
        {weekdayLabels.map((day) => (
          <Box
            key={day}
            sx={{
              textAlign: 'center',
              py: 1,
              fontWeight: 700,
              color: '#555',
            }}
          >
            {day}
          </Box>
        ))}

        {allCells.map((day, index) => {
          if (day === null) {
            return <Box key={`empty-${index}`} />
          }

          const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

          const record = attendance.find((item) => item.date === dateString)

          const dow = new Date(year, month, day).getDay()
          const missingAbsent =
            !record &&
            dow !== 0 &&
            dow !== 6 &&
            !!startDate &&
            dateString >= startDate &&
            dateString < todayString

          const status = (record?.status || '') as StatusType
          const inProgress = !!record?.checkInTime && !record?.checkOutTime && status !== 'Present'
          const formatTime = (iso?: string | null) =>
            iso
              ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '--:--'

          return (
            <Paper
              key={day}
              elevation={0}
              sx={{
                minHeight: 100,
                p: 1.5,
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                bgcolor: inProgress
                  ? '#fffde7'
                  : record
                    ? getStatusColor(status)
                    : missingAbsent
                      ? getStatusColor('Absent')
                      : '#fafafa',
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  fontSize: 14,
                }}
              >
                {day}
              </Typography>

              {record ? (
                <>
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 1,
                      py: 0.4,
                      borderRadius: 1,
                      bgcolor: inProgress ? '#fff9c4' : getStatusColor(status),
                      color: inProgress ? '#f57f17' : getStatusTextColor(status),
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {inProgress ? 'In progress' : record.status}
                  </Box>

                  {record.checkInTime && (
                    <Typography sx={{ fontSize: 11, color: '#555', mt: 0.5 }}>
                      In: {formatTime(record.checkInTime)}
                    </Typography>
                  )}
                  {record.checkInTime && (
                    <Typography sx={{ fontSize: 11, color: '#555' }}>
                      Out: {formatTime(record.checkOutTime)}
                    </Typography>
                  )}
                </>
              ) : missingAbsent ? (
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1,
                    py: 0.4,
                    borderRadius: 1,
                    bgcolor: getStatusColor('Absent'),
                    color: getStatusTextColor('Absent'),
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Absent
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontSize: 12,
                    color: '#999',
                  }}
                >
                  {dow === 0 || dow === 6 ? 'Weekend' : 'No Record'}
                </Typography>
              )}
            </Paper>
          )
        })}
      </Box>
    </Paper>
  )
}

export default MonthlyAttendanceGrid
