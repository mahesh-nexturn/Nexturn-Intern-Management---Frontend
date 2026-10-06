import { Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { useAuth } from "../context/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;