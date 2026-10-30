import { useMemo, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Snackbar,
} from '@mui/material'

import ReportChart from '../components/ReportChart'
import { useExportReportsExcelMutation, useListReportsQuery } from '../store'

type Role = 'HR' | 'MENTOR' | 'INTERN' | null

function Reports() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: reportData, isLoading: loading, isError: loadFailed } = useListReportsQuery()
  const reports = useMemo(() => reportData ?? [], [reportData])
  const [exportReportsExcel] = useExportReportsExcelMutation()

  const [toast, setToast] = useState<{
    message: string
    severity: 'success' | 'error'
  } | null>(null)

  const role = sessionStorage.getItem('role') as Role

  const canExport = role === 'HR' || role === 'MENTOR'

  const activeToast =
    toast ??
    (loadFailed ? { message: 'Failed to load reports.', severity: 'error' as const } : null)

  const filteredReports = reports.filter((report) =>
    report.internName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const total = reports.length

  const averageAttendance =
    total === 0 ? 0 : reports.reduce((sum, report) => sum + report.attendancePct, 0) / total

  const averageEvaluation =
    reports.length === 0
      ? 0
      : reports.reduce((sum, report) => sum + (report.averageEvaluationScore ?? 0), 0) /
        reports.length

  const ppoOffered = reports.filter((report) => report.ppoStatus === 'Offered').length

  const exportReport = async () => {
    try {
      await exportReportsExcel().unwrap()
      setToast({
        message: 'Report export started.',
        severity: 'success',
      })
    } catch {
      setToast({
        message: 'Failed to export reports.',
        severity: 'error',
      })
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
        }}
      >
        <Typography variant="h4">Reports</Typography>

        {canExport && (
          <Button
            variant="contained"
            onClick={() => {
              void exportReport()
            }}
          >
            Export Report
          </Button>
        )}
      </Box>

      <ReportChart
        total={total}
        averageAttendance={averageAttendance}
        averageEvaluation={averageEvaluation}
        ppoOffered={ppoOffered}
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
          label="Search Intern"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Intern</TableCell>

              <TableCell>Mentor</TableCell>

              <TableCell>Attendance</TableCell>

              <TableCell>Completed Tasks</TableCell>

              <TableCell>Pending Tasks</TableCell>

              <TableCell>Training</TableCell>

              <TableCell>Evaluation</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell align="center" colSpan={7} sx={{ py: 5 }}>
                  <Typography color="text.secondary">
                    {loading ? 'Loading reports...' : 'No reports found.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.internId}>
                  <TableCell>{report.internName}</TableCell>

                  <TableCell>{report.mentorName ?? '-'}</TableCell>

                  <TableCell>{report.attendancePct.toFixed(1)}%</TableCell>

                  <TableCell>{report.completedTasks}</TableCell>

                  <TableCell>{Math.max(report.totalTasks - report.completedTasks, 0)}</TableCell>

                  <TableCell>{report.trainingCompletionPct.toFixed(1)}%</TableCell>

                  <TableCell>{report.averageEvaluationScore?.toFixed(1) ?? '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={!!activeToast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        {activeToast ? (
          <Alert severity={activeToast.severity} onClose={() => setToast(null)}>
            {activeToast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  )
}

export default Reports
