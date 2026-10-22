import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Link,
  Paper,
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

import AddEvaluationDialog from '../components/AddEvaluationDialog'
import EvaluationChart from '../components/EvaluationChart'
import type { Evaluation, Intern } from '../types'
import * as evaluationApi from '../services/evaluationApi'
import * as internApi from '../services/internApi'
import * as taskApi from '../services/taskApi'
import { EMPTY_RATINGS, EVALUATION_CRITERIA } from '../utils/evaluationCriteria'
import { toUiEvaluation } from '../utils/mappers/evaluationMapper'
import { useDialogs } from '../context/dialogState'

type EvaluationsProps = {
  evaluations: Evaluation[]
  setEvaluations: React.Dispatch<React.SetStateAction<Evaluation[]>>
}

type Role = 'HR' | 'MENTOR' | 'INTERN' | null

function toUiIntern(dto: internApi.InternDto): Intern {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    department: dto.department ?? '',
    mentor: dto.mentorName ?? '',
    mentorId: dto.mentorId,
    status: dto.status ?? 'Active',
    userId: dto.userId,
  }
}

function Evaluations({ evaluations, setEvaluations }: EvaluationsProps) {
  const { notify } = useDialogs()
  const role = sessionStorage.getItem('role') as Role
  const userName = sessionStorage.getItem('name') || ''

  const isHr = role === 'HR'
  const isMentor = role === 'MENTOR'
  const isIntern = role === 'INTERN'
  const canManageEvaluations = isHr || isMentor

  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(
    null,
  )
  const [availableInterns, setAvailableInterns] = useState<Intern[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Evaluation | null>(null)
  const [taskTitles, setTaskTitles] = useState<Record<number, string>>({})
  const navigate = useNavigate()

  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation>({
    id: 0,
    intern: '',
    internId: null,
    mentor: '',
    mentorId: null,
    taskId: null,
    ...EMPTY_RATINGS,
    overallRating: 0,
    feedback: '',
  })

  useEffect(() => {
    let cancelled = false

    evaluationApi
      .listEvaluations()
      .then((list) => {
        if (!cancelled) setEvaluations(list.map((item) => toUiEvaluation(item)))
      })
      .catch(() => {
        if (!cancelled) setToast({ message: 'Failed to load evaluations.', severity: 'error' })
      })

    internApi
      .listInterns()
      .then((list) => {
        if (!cancelled) setAvailableInterns(list.map(toUiIntern))
      })
      .catch(() => {
        if (!cancelled) setToast({ message: 'Failed to load interns.', severity: 'error' })
      })

    taskApi
      .listTasks()
      .then((list) => {
        if (!cancelled) setTaskTitles(Object.fromEntries(list.map((task) => [task.id, task.title])))
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [setEvaluations])

  const evaluationsWithRelations = useMemo(
    () =>
      evaluations.map((evaluation) => {
        const intern = availableInterns.find((item) => item.id === evaluation.internId)
        return {
          ...evaluation,
          intern: evaluation.intern || intern?.name || '',
          mentor: evaluation.mentor || intern?.mentor || '',
          mentorId: evaluation.mentorId ?? intern?.mentorId ?? null,
        }
      }),
    [availableInterns, evaluations],
  )

  const visibleEvaluations = useMemo(() => {
    if (isHr) return evaluationsWithRelations
    if (isMentor)
      return evaluationsWithRelations.filter((evaluation) => evaluation.mentor === userName)
    if (isIntern)
      return evaluationsWithRelations.filter((evaluation) => evaluation.intern === userName)
    return []
  }, [evaluationsWithRelations, isHr, isIntern, isMentor, userName])

  const filteredEvaluations = useMemo(
    () =>
      visibleEvaluations.filter((evaluation) =>
        evaluation.intern.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm, visibleEvaluations],
  )

  const total = visibleEvaluations.length
  const average = (pick: (evaluation: Evaluation) => number) => {
    const rated = visibleEvaluations.map(pick).filter((value) => value > 0)
    return rated.length === 0 ? 0 : rated.reduce((sum, value) => sum + value, 0) / rated.length
  }
  const averages = {
    requirementUnderstanding: average((e) => e.requirementUnderstanding),
    technicalKnowledge: average((e) => e.technicalKnowledge),
    workQuality: average((e) => e.workQuality),
    taskCompletion: average((e) => e.taskCompletion),
    taskDemonstration: average((e) => e.taskDemonstration),
    overall: average((e) => e.overallRating),
  }

  const handleOpen = () => {
    setSelectedEvaluation({
      id: 0,
      intern: '',
      internId: null,
      mentor: '',
      mentorId: null,
      taskId: null,
      ...EMPTY_RATINGS,
      overallRating: 0,
      feedback: '',
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const saveEvaluation = async (evaluation: Evaluation) => {
    if (!evaluation.internId) {
      notify('Please select an intern.')
      return
    }

    const selectedIntern = availableInterns.find((intern) => intern.id === evaluation.internId)
    const payload: evaluationApi.EvaluationPayload = {
      internId: evaluation.internId,
      mentorId: selectedIntern?.mentorId ?? evaluation.mentorId ?? null,
      taskId: evaluation.taskId ?? null,
      requirementUnderstanding: evaluation.requirementUnderstanding,
      technicalKnowledge: evaluation.technicalKnowledge,
      workQuality: evaluation.workQuality,
      taskCompletion: evaluation.taskCompletion,
      taskDemonstration: evaluation.taskDemonstration,
      feedback: evaluation.feedback,
    }

    try {
      const targetId = evaluation.id > 0 ? evaluation.id : null
      if (targetId !== null) {
        const updated = await evaluationApi.updateEvaluation(targetId, payload)
        setEvaluations((prev) =>
          prev.map((item) =>
            item.id === targetId ? toUiEvaluation(updated, availableInterns) : item,
          ),
        )
        setToast({ message: 'Evaluation updated successfully.', severity: 'success' })
      } else {
        const created = await evaluationApi.createEvaluation(payload)
        setEvaluations((prev) => [...prev, toUiEvaluation(created, availableInterns)])
        setToast({ message: 'Evaluation created successfully.', severity: 'success' })
      }

      setOpen(false)
    } catch {
      setToast({ message: 'Failed to save evaluation.', severity: 'error' })
    }
  }

  const editEvaluation = (index: number) => {
    const evaluation = filteredEvaluations[index]
    setSelectedEvaluation(evaluation)
    setOpen(true)
  }

  const confirmDelete = async () => {
    const evaluation = deleteTarget
    if (!evaluation) return
    setDeleteTarget(null)

    try {
      await evaluationApi.deleteEvaluation(evaluation.id)
      setEvaluations((prev) => prev.filter((item) => item.id !== evaluation.id))
      setToast({ message: 'Evaluation deleted successfully.', severity: 'success' })
    } catch {
      setToast({ message: 'Failed to delete evaluation.', severity: 'error' })
    }
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Evaluations</Typography>

        {canManageEvaluations && (
          <Button variant="contained" onClick={handleOpen}>
            Add Evaluation
          </Button>
        )}
      </Box>

      <EvaluationChart total={total} averages={averages} />

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Search Intern"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Intern</TableCell>
              {!isMentor && <TableCell>Mentor</TableCell>}
              <TableCell>Task</TableCell>
              {EVALUATION_CRITERIA.map((criterion) => (
                <TableCell key={criterion.key}>{criterion.label}</TableCell>
              ))}
              <TableCell>Overall</TableCell>
              <TableCell>Feedback</TableCell>
              {canManageEvaluations && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredEvaluations.length === 0 ? (
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={(canManageEvaluations ? 11 : 10) - (isMentor ? 1 : 0)}
                >
                  No evaluations found.
                </TableCell>
              </TableRow>
            ) : (
              filteredEvaluations.map((evaluation, index) => (
                <TableRow key={evaluation.id}>
                  <TableCell>{evaluation.intern}</TableCell>
                  {!isMentor && <TableCell>{evaluation.mentor || '-'}</TableCell>}
                  <TableCell>
                    {evaluation.taskId ? (
                      <Link
                        component="button"
                        underline="hover"
                        onClick={() => navigate(`/tasks/${evaluation.taskId}`)}
                      >
                        {taskTitles[evaluation.taskId] || `Task #${evaluation.taskId}`}
                      </Link>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  {EVALUATION_CRITERIA.map((criterion) => (
                    <TableCell key={criterion.key}>{evaluation[criterion.key] || '-'}</TableCell>
                  ))}
                  <TableCell>{evaluation.overallRating}</TableCell>
                  <TableCell>{evaluation.feedback}</TableCell>
                  {canManageEvaluations && (
                    <TableCell>
                      <IconButton color="primary" onClick={() => editEvaluation(index)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => setDeleteTarget(filteredEvaluations[index])}
                      >
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

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Evaluation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the evaluation for {deleteTarget?.intern}? This cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => void confirmDelete()}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <AddEvaluationDialog
        open={open}
        handleClose={handleClose}
        addEvaluation={saveEvaluation}
        selectedEvaluation={selectedEvaluation}
        interns={availableInterns}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToast(null)} severity={toast?.severity} variant="filled">
          {toast?.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default Evaluations
