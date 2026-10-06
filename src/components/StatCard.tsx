import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

type StatCardProps = {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
};

function StatCard({
  title,
  value,
  subtitle,
  color = "#2563eb",
  icon,
}: StatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        height: "100%",
        borderTop: `5px solid ${color}`,
        border: "1px solid #E5E7EB",
        boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
        transition: "0.3s",

        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 16px 35px rgba(0,0,0,0.12)",
        },
      }}
    >
      <CardContent>
       <Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
          <Box>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 1,
                fontWeight: 700,
              }}
            >
              {value}
            </Typography>

            {subtitle && (
              <Typography
                sx={{
                  mt: 1,
                  fontSize: 12,
                  color: color,
                  fontWeight: 600,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              width: 55,
              height: 55,
              borderRadius: "50%",
              bgcolor: color,
              color: "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 26,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default StatCard;