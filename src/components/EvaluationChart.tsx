import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

type EvaluationChartProps = {
  total: number;
  technicalAverage: number;
  communicationAverage: number;
  overallAverage: number;
};

function EvaluationChart({
  total,
  technicalAverage,
  communicationAverage,
  overallAverage,
}: EvaluationChartProps) {
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
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4">
            {total}
          </Typography>

          <Typography>
            Total Evaluations
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="primary.main"
          >
            {technicalAverage.toFixed(1)}
          </Typography>

          <Typography>
            Technical Avg
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="warning.main"
          >
            {communicationAverage.toFixed(1)}
          </Typography>

          <Typography>
            Communication Avg
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="success.main"
          >
            {overallAverage.toFixed(1)}
          </Typography>

          <Typography>
            Overall Avg
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default EvaluationChart;