import { useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'

import EvaluationFormFields from './EvaluationFormFields'
import { EMPTY_RATINGS, allRated, type CriteriaRatings } from '../utils/evaluationCriteria'

type Props = {
  open: boolean
  taskTitle: string
  saving: boolean
  onCancel: () => void
  onSubmit: (ratings: CriteriaRatings, feedback: string) => void
}

function TaskCompletionEvaluationDialog({ open, taskTitle, saving, onCancel, onSubmit }: Props) {
  const [ratings, setRatings] = useState<CriteriaRatings>(EMPTY_RATINGS)
  const [feedback, setFeedback] = useState('')

  return (
    <Dialog open={open} onClose={saving ? undefined : onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Evaluate Task</DialogTitle>

      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          Rate &quot;{taskTitle}&quot; out of 5 to mark it as completed.
        </Typography>

        <EvaluationFormFields
          ratings={ratings}
          feedback={feedback}
          onRatingsChange={setRatings}
          onFeedbackChange={setFeedback}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={saving || !allRated(ratings)}
          onClick={() => onSubmit(ratings, feedback)}
        >
          Submit & Complete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TaskCompletionEvaluationDialog
