import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);

      switch (user.role) {
        case "HR":
          navigate("/dashboard");
          break;
        case "MENTOR":
          navigate("/mentor-dashboard");
          break;
        case "INTERN":
          navigate("/intern-dashboard");
          break;
        default:
          setError("Unknown role.");
      }
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f5f7fb",
        px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 450,
          p: 4,
          borderRadius: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            fontWeight: 700,
            mb: 1,
          }}
        >
          InternTrack
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            textAlign: "center",
            mb: 3,
          }}
        >
          Sign in to continue
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <TextField
          fullWidth
          type="password"
          label="Password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <Button
          fullWidth
          variant="contained"
          disabled={submitting}
          sx={{
            mt: 3,
            py: 1.4,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
          onClick={handleLogin}
        >
          {submitting ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
        </Button>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1,
              fontWeight: 600,
            }}
          >
            Demo Credentials
          </Typography>

          <Typography variant="body2">
            <strong>HR / Admin</strong> : admin@nexturn.com / Admin@123
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Mentors</strong> and <strong>Interns</strong> use the accounts
            created via the HR &rarr; Mentors / Interns pages.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;