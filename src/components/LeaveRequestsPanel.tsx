import { useEffect, useState } from "react";

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
} from "@mui/material";

import * as leaveApi from "../services/leaveApi";

type Props = {
  isApprover: boolean;
  internName?: string;
  refreshKey: number;
  onChanged?: () => void;
  onError: (message: string) => void;
};

const statusColor = { Pending: "warning", Approved: "success", Rejected: "error" } as const;

function LeaveRequestsPanel({ isApprover, internName, refreshKey, onChanged, onError }: Props) {
  const [allLeaves, setLeaves] = useState<leaveApi.LeaveDto[]>([]);
  const leaves = internName ? allLeaves.filter((l) => l.internName === internName) : allLeaves;

  useEffect(() => {
    leaveApi
      .listLeaves()
      .then(setLeaves)
      .catch(() => onError("Failed to load leave requests."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const decide = async (id: number, approve: boolean) => {
    try {
      const updated = approve ? await leaveApi.approveLeave(id) : await leaveApi.rejectLeave(id);
      setLeaves((prev) => prev.map((l) => (l.id === id ? updated : l)));
      onChanged?.();
    } catch {
      onError("Failed to update leave request.");
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {isApprover ? "Leave Requests" : "My Leave Requests"}
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
                  <TableCell>{leave.reason || "-"}</TableCell>
                  <TableCell>{leave.hrName || "-"}</TableCell>
                  <TableCell>
                    <Chip label={leave.status} color={statusColor[leave.status]} size="small" />
                  </TableCell>
                  {isApprover && (
                    <TableCell>
                      {leave.status === "Pending" && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button size="small" variant="contained" color="success" onClick={() => decide(leave.id, true)}>
                            Approve
                          </Button>
                          <Button size="small" variant="outlined" color="error" onClick={() => decide(leave.id, false)}>
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
  );
}

export default LeaveRequestsPanel;
