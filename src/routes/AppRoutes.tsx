import type { ReactElement } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import MentorDashboard from '../pages/MentorDashboard'
import InternDashboard from '../pages/InternDashboard'

import Mentors from '../pages/Mentors'
import Interns from '../pages/Interns'
import Tasks from '../pages/Tasks'
import TaskDetail from '../pages/TaskDetail'
import Meetings from '../pages/Meetings'
import Attendance from '../pages/Attendance'
import Feedback from '../pages/Feedback'
import Documents from '../pages/Documents'
import Training from '../pages/Training'
import Evaluations from '../pages/Evaluations'
import PPOPage from '../pages/PPOPage'
import Announcements from '../pages/Announcements'
import Certificates from '../pages/Certificates'
import Notifications from '../pages/Notifications'
import Reports from '../pages/Reports'
import Settings from '../pages/Settings'
import Profile from '../pages/Profile'
import HrManagement from '../pages/HrManagement'

import MainLayout from '../layouts/MainLayout'
import ProtectedRoute from '../components/ProtectedRoute'

// Pages fetch their own data through RTK Query, so routes only wrap them in the layout.
function protectedPage(page: ReactElement, adminOnly = false) {
  return (
    <ProtectedRoute adminOnly={adminOnly}>
      <MainLayout>{page}</MainLayout>
    </ProtectedRoute>
  )
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
        <Route path="/mentor-dashboard" element={protectedPage(<MentorDashboard />)} />
        <Route path="/intern-dashboard" element={protectedPage(<InternDashboard />)} />
        <Route path="/interns" element={protectedPage(<Interns />)} />
        <Route path="/mentors" element={protectedPage(<Mentors />)} />
        <Route path="/tasks" element={protectedPage(<Tasks />)} />
        <Route path="/tasks/:id" element={protectedPage(<TaskDetail />)} />
        <Route path="/meetings" element={protectedPage(<Meetings />)} />
        <Route path="/attendance" element={protectedPage(<Attendance />)} />
        <Route path="/feedback" element={protectedPage(<Feedback />)} />
        <Route path="/documents" element={protectedPage(<Documents />)} />
        <Route path="/training" element={protectedPage(<Training />)} />
        <Route path="/evaluations" element={protectedPage(<Evaluations />)} />
        <Route path="/ppo" element={protectedPage(<PPOPage />)} />
        <Route path="/announcements" element={protectedPage(<Announcements />)} />
        <Route path="/certificates" element={protectedPage(<Certificates />)} />
        <Route path="/notifications" element={protectedPage(<Notifications />)} />
        <Route path="/reports" element={protectedPage(<Reports />)} />
        <Route path="/hr" element={protectedPage(<HrManagement />, true)} />
        <Route path="/profile" element={protectedPage(<Profile />)} />
        <Route path="/settings" element={protectedPage(<Settings />)} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
