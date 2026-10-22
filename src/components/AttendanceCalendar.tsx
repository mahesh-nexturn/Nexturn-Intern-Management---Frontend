import { useEffect, useState } from 'react'

import { Box, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material'

import type { Attendance, Intern } from '../types'

import AttendanceChart from './AttendanceChart'
import AttendanceLegend from './AttendanceLegend'
import MonthlyAttendanceGrid from './MonthlyAttendanceGrid'

type Props = {
  attendance: Attendance[]
  interns: Intern[]
  onInternChange?: (name: string) => void
}

type Role = 'HR' | 'MENTOR' | 'INTERN' | null

function AttendanceCalendar({ attendance, interns, onInternChange }: Props) {
  const role = sessionStorage.getItem('role') as Role

  const userName = sessionStorage.getItem('name') || ''

  const visibleInterns =
    role === 'HR'
      ? interns
      : role === 'MENTOR'
        ? interns.filter((intern) => intern.mentor === userName)
        : interns.filter((intern) => intern.name === userName)

  const [selectedIntern, setSelectedIntern] = useState(
    role === 'INTERN' ? userName : visibleInterns[0]?.name || '',
  )

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  if (
    role !== 'INTERN' &&
    visibleInterns.length > 0 &&
    !visibleInterns.some((intern) => intern.name === selectedIntern)
  ) {
    setSelectedIntern(visibleInterns[0].name)
  }
  useEffect(() => {
    onInternChange?.(selectedIntern)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIntern])

  const filteredAttendance = attendance.filter((item) => {
    const itemDate = new Date(item.date)

    return (
      item.intern === selectedIntern &&
      itemDate.getMonth() + 1 === selectedMonth &&
      itemDate.getFullYear() === selectedYear
    )
  })

  const startDate = (
    interns.find((intern) => intern.name === selectedIntern)?.createTime || ''
  ).slice(0, 10)

  const missingAbsentCount = (() => {
    if (!startDate) return 0
    const now = new Date()
    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
    let count = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dow = new Date(selectedYear, selectedMonth - 1, d).getDay()
      if (
        dow !== 0 &&
        dow !== 6 &&
        dateString >= startDate &&
        dateString < todayString &&
        !filteredAttendance.some((item) => item.date === dateString)
      ) {
        count++
      }
    }
    return count
  })()

  const presentCount = filteredAttendance.filter((item) => item.status === 'Present').length

  const absentCount =
    filteredAttendance.filter(
      (item) => item.status === 'Absent' && !(item.checkInTime && !item.checkOutTime),
    ).length + missingAbsentCount

  const leaveCount = filteredAttendance.filter((item) => item.status === 'Leave').length

  const holidayCount = filteredAttendance.filter((item) => item.status === 'Holiday').length

  const wfhCount = filteredAttendance.filter((item) => item.status === 'WFH').length

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
      }}
    >
      {/* Dropdowns */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        {(role === 'HR' || role === 'MENTOR') && (
          <FormControl
            sx={{
              minWidth: 200,
            }}
          >
            <InputLabel>Intern</InputLabel>

            <Select
              value={selectedIntern}
              label="Intern"
              onChange={(e) => setSelectedIntern(e.target.value)}
            >
              {visibleInterns.map((intern) => (
                <MenuItem key={intern.name} value={intern.name}>
                  {intern.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl
          sx={{
            minWidth: 180,
          }}
        >
          <InputLabel>Month</InputLabel>

          <Select
            value={selectedMonth}
            label="Month"
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {[
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ].map((month, index) => (
              <MenuItem key={month} value={index + 1}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          sx={{
            minWidth: 150,
          }}
        >
          <InputLabel>Year</InputLabel>

          <Select
            value={selectedYear}
            label="Year"
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            <MenuItem value={2025}>2025</MenuItem>

            <MenuItem value={2026}>2026</MenuItem>

            <MenuItem value={2027}>2027</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Statistics */}
      <AttendanceChart
        present={presentCount}
        absent={absentCount}
        leave={leaveCount}
        holiday={holidayCount}
        wfh={wfhCount}
      />

      {/* Calendar + Legend */}
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          mt: 3,
          alignItems: 'flex-start',
          flexDirection: {
            xs: 'column',
            lg: 'row',
          },
        }}
      >
        <Box
          sx={{
            flex: 4,
            width: '100%',
          }}
        >
          <MonthlyAttendanceGrid
            attendance={filteredAttendance}
            startDate={startDate}
            year={selectedYear}
            month={selectedMonth}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 180,
          }}
        >
          <AttendanceLegend />
        </Box>
      </Box>
    </Paper>
  )
}

export default AttendanceCalendar
