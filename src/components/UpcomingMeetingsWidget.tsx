import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Divider,
} from "@mui/material";

type Meeting = {
  title: string;
  date: string;
  time: string;
};

type Props = {
  meetings: Meeting[];
};

function UpcomingMeetingsWidget({
  meetings,
}: Props) {
  return (
    <Card sx={{ minWidth: 350 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Upcoming Meetings
        </Typography>

        <List>
          {meetings.map((meeting, index) => (
            <div key={index}>
              <ListItem
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "bold",
                  }}
                >
                  {meeting.title}
                </Typography>

                <Typography variant="body2">
                  {meeting.date}
                </Typography>

                <Typography variant="body2">
                  {meeting.time}
                </Typography>
              </ListItem>

              {index !== meetings.length - 1 && (
                <Divider />
              )}
            </div>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default UpcomingMeetingsWidget;