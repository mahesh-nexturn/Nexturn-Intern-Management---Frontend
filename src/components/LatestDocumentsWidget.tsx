import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Divider,
  Chip,
} from "@mui/material";

type Document = {
  name: string;
  fileName: string;
};

type Props = {
  documents: Document[];
};

function LatestDocumentsWidget({
  documents,
}: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Latest Documents
        </Typography>

        <List>
          {documents.map((doc, index) => (
            <div key={index}>
              <ListItem
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Typography
                    sx={{ fontWeight: "bold" }}
                  >
                    {doc.name}
                  </Typography>

                  <Typography variant="body2">
                    {doc.fileName}
                  </Typography>
                </div>

                <Chip
                  label="Uploaded"
                  color="success"
                  size="small"
                />
              </ListItem>

              {index !== documents.length - 1 && (
                <Divider />
              )}
            </div>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default LatestDocumentsWidget;