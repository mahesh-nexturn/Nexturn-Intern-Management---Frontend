import { useEffect, useMemo, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'

import type { Hr } from '../types'
import { hrApi } from '../services'
import HrAssignmentsDialog from '../components/HrAssignmentsDialog'
import { useDialogs } from '../context/dialogState'

type FormState = { id: number | null; name: string; email: string; password: string }

const emptyForm: FormState = { id: null, name: '', email: '', password: '' }

function HrManagement() {
  const { confirm, notify } = useDialogs()
  const [hrs, setHrs] = useState<Hr[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(
    null,
  )

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)

  const [assignHr, setAssignHr] = useState<Hr | null>(null)

  const loadHrs = () =>
    hrApi
      .listHrs()
      .then(setHrs)
      .catch(() => setToast({ message: 'Failed to load HRs.', severity: 'error' }))

  useEffect(() => {
    loadHrs()
  }, [])

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase()
    return hrs.filter((h) => h.name.toLowerCase().includes(s) || h.email.toLowerCase().includes(s))
  }, [hrs, searchTerm])

  const totalMentors = hrs.reduce((sum, h) => sum + h.mentorCount, 0)
  const totalInterns = hrs.reduce((sum, h) => sum + h.internCount, 0)

  const handleOpenAdd = () => {
    setForm(emptyForm)
    setFormOpen(true)
  }

  const handleOpenEdit = (hr: Hr) => {
    setForm({ id: hr.id, name: hr.name, email: hr.email, password: '' })
    setFormOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      notify('Please enter name and email.')
      return
    }

    const payload: hrApi.HrPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
    }
    if (form.password.trim()) payload.password = form.password

    const request = form.id !== null ? hrApi.updateHr(form.id, payload) : hrApi.createHr(payload)

    request
      .then(() => {
        setToast({
          message: form.id !== null ? 'HR updated.' : 'HR created.',
          severity: 'success',
        })
        setFormOpen(false)
        return loadHrs()
      })
      .catch(() =>
        setToast({
          message: form.id !== null ? 'Failed to update HR.' : 'Failed to create HR.',
          severity: 'error',
        }),
      )
  }

  const handleDelete = async (hr: Hr) => {
    if (!(await confirm(`Delete HR "${hr.name}"?`))) return
    hrApi
      .deleteHr(hr.id)
      .then(() => {
        setHrs((prev) => prev.filter((h) => h.id !== hr.id))
        setToast({ message: 'HR deleted.', severity: 'success' })
      })
      .catch(() => setToast({ message: 'Failed to delete HR.', severity: 'error' }))
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f5f7fb', minHeight: '100vh' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          flexWrap: 'wrap',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            HR Management
          </Typography>
          <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
            Manage HR users and the mentors and interns assigned to them.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ px: 3, py: 1.3, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
        >
          Add HR
        </Button>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 4, p: 4, mb: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
            textAlign: 'center',
          }}
        >
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {hrs.length}
            </Typography>
            <Typography color="text.secondary">Total HRs</Typography>
          </Box>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {totalMentors}
            </Typography>
            <Typography color="text.secondary">Mentors Assigned</Typography>
          </Box>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {totalInterns}
            </Typography>
            <Typography color="text.secondary">Interns Assigned</Typography>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, borderRadius: 4, mb: 3 }}>
        <TextField
          fullWidth
          label="Search HR"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mentors</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Interns</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell align="center" colSpan={5} sx={{ py: 5 }}>
                    <Typography color="text.secondary">No HRs found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((hr) => (
                  <TableRow key={hr.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>{hr.name}</Typography>
                    </TableCell>
                    <TableCell>{hr.email}</TableCell>
                    <TableCell>{hr.mentorCount}</TableCell>
                    <TableCell>{hr.internCount}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Manage assignments">
                        <IconButton color="secondary" onClick={() => setAssignHr(hr)}>
                          <AssignmentIndIcon />
                        </IconButton>
                      </Tooltip>
                      <IconButton color="primary" onClick={() => handleOpenEdit(hr)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(hr)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {form.id !== null ? 'Edit HR' : 'Add HR'}
        </DialogTitle>

        <DialogContent dividers>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            type="password"
            label="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            helperText={
              form.id !== null
                ? 'Leave blank to keep the current password.'
                : 'Leave blank to use the default password.'
            }
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setFormOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {form.id !== null ? 'Update HR' : 'Add HR'}
          </Button>
        </DialogActions>
      </Dialog>

      <HrAssignmentsDialog
        open={assignHr !== null}
        hr={assignHr}
        handleClose={() => setAssignHr(null)}
        onSaved={() => {
          setToast({ message: 'Assignments saved.', severity: 'success' })
          loadHrs()
        }}
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
    </Box>
  )
}

export default HrManagement
