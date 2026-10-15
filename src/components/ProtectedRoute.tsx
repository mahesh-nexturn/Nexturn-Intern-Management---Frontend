import { Navigate } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import { useAuth } from '../context/useAuth'

type ProtectedRouteProps = {
  children: React.ReactNode
  adminOnly?: boolean
}

function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/" />
  }

  if (adminOnly && user.backendRole !== 'ADMIN') {
    const home =
      user.role === 'MENTOR'
        ? '/mentor-dashboard'
        : user.role === 'INTERN'
          ? '/intern-dashboard'
          : '/dashboard'
    return <Navigate to={home} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
