import { useEffect, useMemo, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material'

import EvaluationFormFields from './EvaluationFormFields'
import {
  EMPTY_RATINGS,
  allRated,
  overallFromRatings,
  type CriteriaRatings,
} from '../utils/evaluationCriteria'
import type { Evaluation } from '../types/Evaluation'
import type { Intern } from '../types/Intern'
import * as taskApi from '../services/taskApi'
import * as evaluationApi from '../services/evaluationApi'
import { useDialogs } from '../context/dialogState'

type AddEvaluationDialogProps = {
  open: boolean
  handleClose: () => void
  addEvaluation: (evaluation: Evaluation) => void
  selectedEvaluation: Evaluation
  interns: Intern[]
}

function AddEvaluationDialog({
  open,
  handleClose,
  addEvaluation,
  selectedEvaluation,
  interns,
}: AddEvaluationDialogProps) {
  const { notify } = useDialogs()
  const [internId, setInternId] = useState<number | ''>('')
  const [ratings, setRatings] = useState<CriteriaRatings>(EMPTY_RATINGS)
  const [feedback, setFeedback] = useState('')
  const [taskId, setTaskId] = useState<number | ''>('')
  const [internTasks, setInternTasks] = useState<taskApi.TaskDto[]>([])
  const [internEvaluations, setInternEvaluations] = useState<evaluationApi.EvaluationDto[]>([])
  const [evaluationId, setEvaluationId] = useState(0)

  const [prevSelected, setPrevSelected] = useState<Evaluation | null>(null)
  if (prevSelected !== selectedEvaluation) {
    setPrevSelected(selectedEvaluation)
    setInternId(selectedEvaluation.internId ?? '')
    setRatings({
      requirementUnderstanding: selectedEvaluation.requirementUnderstanding,
      technicalKnowledge: selectedEvaluation.technicalKnowledge,
      workQuality: selectedEvaluation.workQuality,
      taskCompletion: selectedEvaluation.taskCompletion,
      taskDemonstration: selectedEvaluation.taskDemonstration,
    })
    setFeedback(selectedEvaluation.feedback || '')
    setTaskId(selectedEvaluation.taskId ?? '')
    setEvaluationId(selectedEvaluation.id)
  }

  useEffect(() => {
    if (!internId) return
    let cancelled = false
    Promise.all([taskApi.listTasks({ internId }), evaluationApi.listEvaluations({ internId })])
      .then(([tasks, evaluations]) => {
        if (cancelled) return
        setInternTasks(tasks.filter((task) => task.status === 'Completed'))
        setInternEvaluations(evaluations)
      })
      .catch(() => {
        if (cancelled) return
        setInternTasks([])
        setInternEvaluations([])
      })
    return () => {
      cancelled = true
    }
  }, [internId])

  const selectedIntern = useMemo(
    () => interns.find((intern) => intern.id === internId),
    [internId, interns],
  )

  // Loads the existing evaluation for the chosen task so it is edited, not duplicated.
  const handleTaskChange = (value: number | '') => {
    setTaskId(value)
    const existing = value === '' ? undefined : internEvaluations.find((e) => e.taskId === value)
    setEvaluationId(existing?.id ?? 0)
    setRatings({
      requirementUnderstanding: existing?.requirementUnderstanding ?? 0,
      technicalKnowledge: existing?.technicalKnowledge ?? 0,
      workQuality: existing?.workQuality ?? 0,
      taskCompletion: existing?.taskCompletion ?? 0,
      taskDemonstration: existing?.taskDemonstration ?? 0,
    })
    setFeedback(existing?.feedback ?? '')
  }

  const handleSave = () => {
    if (!internId) {
      notify('Please select an intern.')
      return
    }
    if (!allRated(ratings)) {
      notify('Please rate every criterion from 1 to 5.')
      return
    }

    addEvaluation({
      id: evaluationId,
      intern: selectedIntern?.name || '',
      internId: internId as number,
      mentor: selectedIntern?.mentor || '',
      mentorId: selectedIntern?.mentorId ?? null,
      taskId: taskId === '' ? null : taskId,
      ...ratings,
      overallRating: overallFromRatings(ratings),
      feedback,
    })
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Evaluation Details</DialogTitle>

      <DialogContent>
        <TextField
          select
          fullWidth
          margin="dense"
          label="Intern"
          value={internId}
          onChange={(e) => {
            setInternId(e.target.value === '' ? '' : Number(e.target.value))
            setTaskId('')
            setInternTasks([])
            setInternEvaluations([])
            setEvaluationId(0)
            setRatings(EMPTY_RATINGS)
            setFeedback('')
          }}
        >
          {interns.map((intern) => (
            <MenuItem key={intern.id} value={intern.id}>
              {intern.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          margin="dense"
          label="Task"
          value={internId ? taskId : ''}
          disabled={!internId}
          onChange={(e) => handleTaskChange(e.target.value === '' ? '' : Number(e.target.value))}
        >
          <MenuItem value="">None</MenuItem>
          {internTasks.map((task) => (
            <MenuItem key={task.id} value={task.id}>
              {task.title}
            </MenuItem>
          ))}
        </TextField>

        <EvaluationFormFields
          ratings={ratings}
          feedback={feedback}
          onRatingsChange={setRatings}
          onFeedbackChange={setFeedback}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddEvaluationDialog
