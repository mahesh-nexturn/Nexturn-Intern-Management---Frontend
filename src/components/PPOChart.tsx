import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

type PPOChartProps = {
  total: number;
  eligible: number;
  notEligible: number;
  offered: number;
};

function PPOChart({
  total,
  eligible,
  notEligible,
  offered,
}: PPOChartProps) {
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
            Total Interns
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="success.main"
          >
            {eligible}
          </Typography>

          <Typography>
            Eligible
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="error.main"
          >
            {notEligible}
          </Typography>

          <Typography>
            Not Eligible
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="primary.main"
          >
            {offered}
          </Typography>

          <Typography>
            PPO Offered
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default PPOChart;