import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

type DocumentChartProps = {
  total: number;
  resumes: number;
  certificates: number;
  reports: number;
};

function DocumentChart({
  total,
  resumes,
  certificates,
  reports,
}: DocumentChartProps) {
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
            Total Documents
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="primary.main"
          >
            {resumes}
          </Typography>

          <Typography>
            Resumes
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="success.main"
          >
            {certificates}
          </Typography>

          <Typography>
            Certificates
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            color="warning.main"
          >
            {reports}
          </Typography>

          <Typography>
            Reports
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default DocumentChart;
