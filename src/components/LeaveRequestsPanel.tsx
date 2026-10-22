import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import { useApproveLeaveMutation, useListLeavesQuery, useRejectLeaveMutation } from '../store'

type Props = {
  isApprover: boolean
  internName?: string
  onError: (message: string) => void
}

const statusColor = { Pending: 'warning', Approved: 'success', Rejected: 'error' } as const

function LeaveRequestsPanel({ isApprover, internName, onError }: Props) {
  const { data } = useListLeavesQuery()
  const [approveLeave] = useApproveLeaveMutation()
  const [rejectLeave] = useRejectLeaveMutation()
  const allLeaves = data ?? []
  const leaves = internName ? allLeaves.filter((l) => l.internName === internName) : allLeaves

  const decide = async (id: number, approve: boolean) => {
    try {
      await (approve ? approveLeave(id) : rejectLeave(id)).unwrap()
    } catch {
      onError('Failed to update leave request.')
    }
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {isApprover ? 'Leave Requests' : 'My Leave Requests'}
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {isApprover && <TableCell>Intern</TableCell>}
              <TableCell>Type</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>HR</TableCell>
              <TableCell>Status</TableCell>
              {isApprover && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {leaves.length === 0 ? (
              <TableRow>
                <TableCell align="center" colSpan={isApprover ? 9 : 7}>
                  No leave requests.
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow key={leave.id}>
                  {isApprover && <TableCell>{leave.internName}</TableCell>}
                  <TableCell>{leave.leaveType}</TableCell>
                  <TableCell>{leave.fromDate}</TableCell>
                  <TableCell>{leave.toDate}</TableCell>
                  <TableCell>{leave.days}</TableCell>
                  <TableCell>{leave.reason || '-'}</TableCell>
                  <TableCell>{leave.hrName || '-'}</TableCell>
                  <TableCell>
                    <Chip label={leave.status} color={statusColor[leave.status]} size="small" />
                  </TableCell>
                  {isApprover && (
                    <TableCell>
                      {leave.status === 'Pending' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => decide(leave.id, true)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => decide(leave.id, false)}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default LeaveRequestsPanel
