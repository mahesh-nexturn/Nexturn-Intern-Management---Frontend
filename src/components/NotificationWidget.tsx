import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Divider,
  Chip,
} from "@mui/material";

type Notification = {
  message: string;
  priority: string;
};

type Props = {
  notifications: Notification[];
};

function NotificationWidget({
  notifications,
}: Props) {
  return (
    <Card sx={{ minWidth: 350 }}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
        >
          Recent Notifications
        </Typography>

        <List>
          {notifications.map((item, index) => (
            <div key={index}>
              <ListItem
                sx={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                }}
              >
                <Typography>
                  {item.message}
                </Typography>

                <Chip
                  label={item.priority}
                  color={
                    item.priority === "High"
                      ? "error"
                      : item.priority ===
                        "Medium"
                      ? "warning"
                      : "success"
                  }
                  size="small"
                />
              </ListItem>

              {index !==
                notifications.length - 1 && (
                <Divider />
              )}
            </div>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default NotificationWidget;