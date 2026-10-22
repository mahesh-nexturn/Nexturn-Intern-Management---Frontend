import { Box, Paper, Typography } from '@mui/material'

import { EVALUATION_CRITERIA, type CriterionKey } from '../utils'

type EvaluationChartProps = {
  total: number
  averages: Record<CriterionKey | 'overall', number>
}

function EvaluationChart({ total, averages }: EvaluationChartProps) {
  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 3,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4">{total}</Typography>

          <Typography>Total Evaluations</Typography>
        </Box>

        {EVALUATION_CRITERIA.map((criterion) => (
          <Box key={criterion.key} sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main">
              {averages[criterion.key].toFixed(1)}
            </Typography>

            <Typography>{criterion.label} Avg</Typography>
          </Box>
        ))}

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="success.main">
            {averages.overall.toFixed(1)}
          </Typography>

          <Typography>Overall Avg</Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default EvaluationChart
