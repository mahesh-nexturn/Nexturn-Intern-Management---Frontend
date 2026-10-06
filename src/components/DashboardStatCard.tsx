import {
  Card,
  CardContent,
  Typography,
} from "@mui/material";

type Props = {
  title: string;
  value: number;
};

function DashboardStatCard({
  title,
  value,
}: Props) {
  return (
    <Card>
      <CardContent>
        <Typography
          variant="h6"
          color="text.secondary"
        >
          {title}
        </Typography>

        <Typography
          variant="h3"
          sx={{
            mt: 2,
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default DashboardStatCard;