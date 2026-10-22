import { Box, Rating, TextField, Typography } from '@mui/material'

import { EVALUATION_CRITERIA, type CriteriaRatings } from '../utils'

type Props = {
  ratings: CriteriaRatings
  feedback: string
  onRatingsChange: (ratings: CriteriaRatings) => void
  onFeedbackChange: (feedback: string) => void
}

function EvaluationFormFields({ ratings, feedback, onRatingsChange, onFeedbackChange }: Props) {
  return (
    <>
      {EVALUATION_CRITERIA.map((criterion) => (
        <Box
          key={criterion.key}
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1.5 }}
        >
          <Typography>{criterion.label}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating
              max={5}
              value={ratings[criterion.key] || null}
              onChange={(_, value) => onRatingsChange({ ...ratings, [criterion.key]: value ?? 0 })}
            />
            <Typography variant="body2" sx={{ width: 30 }}>
              {ratings[criterion.key] || 0}/5
            </Typography>
          </Box>
        </Box>
      ))}

      <TextField
        fullWidth
        multiline
        rows={4}
        margin="dense"
        label="Add Feedback"
        value={feedback}
        onChange={(e) => onFeedbackChange(e.target.value)}
      />
    </>
  )
}

export default EvaluationFormFields
