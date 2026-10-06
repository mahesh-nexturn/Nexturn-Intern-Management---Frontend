import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

type CertificateChartProps = {
  total: number;
  active: number;
  expired: number;
  issuedThisMonth: number;
};

function CertificateChart({
  total,
  active,
  expired,
  issuedThisMonth,
}: CertificateChartProps) {
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
            Total Certificates
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="success.main"
          >
            {active}
          </Typography>

          <Typography>
            Active
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="error.main"
          >
            {expired}
          </Typography>

          <Typography>
            Expired
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="primary.main"
          >
            {issuedThisMonth}
          </Typography>

          <Typography>
            Issued This Month
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default CertificateChart;