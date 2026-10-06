import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import MentorDashboard from "../pages/MentorDashboard";
import InternDashboard from "../pages/InternDashboard";

import Mentors from "../pages/Mentors";
import Interns from "../pages/Interns";
import Tasks from "../pages/Tasks";
import Meetings from "../pages/Meetings";
import Attendance from "../pages/Attendance";
import Feedback from "../pages/Feedback";
import Documents from "../pages/Documents";
import Training from "../pages/Training";
import Evaluations from "../pages/Evaluations";
import PPOPage from "../pages/PPOPage";
import Announcements from "../pages/Announcements";
import Certificates from "../pages/Certificates";
import Notifications from "../pages/Notifications";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import type { Mentor } from "../types/Mentor";
import type { Intern } from "../types/Intern";
import type { Task } from "../types/Task";
import type { Attendance as AttendanceType } from "../types/Attendance";
import type { Meeting } from "../types/Meeting";
import type { Document } from "../types/Document";
import type { Training as TrainingType } from "../types/Training";
import type { Evaluation } from "../types/Evaluation";
import type { Notification } from "../types/Notification";
import type { PPO as PPOType } from "../types/PPO";
import type { Report } from "../types/Report";
import type { Announcement } from "../types/Announcement";
import type { Certificate } from "../types/Certificate";

type AppRoutesProps = {
  mentors: Mentor[];
  setMentors: React.Dispatch<React.SetStateAction<Mentor[]>>;

  interns: Intern[];
  setInterns: React.Dispatch<React.SetStateAction<Intern[]>>;

  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;

  attendance: AttendanceType[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceType[]>>;

  meetings: Meeting[];
  setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;

  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;

  trainings: TrainingType[];
  setTrainings: React.Dispatch<React.SetStateAction<TrainingType[]>>;

  evaluations: Evaluation[];
  setEvaluations: React.Dispatch<React.SetStateAction<Evaluation[]>>;

  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;

  ppoData: PPOType[];
  setPPOData: React.Dispatch<React.SetStateAction<PPOType[]>>;

  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;

  certificates: Certificate[];
  setCertificates: React.Dispatch<React.SetStateAction<Certificate[]>>;

  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
};

function AppRoutes({
  mentors,
  setMentors,
  interns,
  setInterns,
  tasks,
  setTasks,
  attendance,
  setAttendance,
  meetings,
  setMeetings,
  documents,
  setDocuments,
  trainings,
  setTrainings,
  evaluations,
  setEvaluations,
  notifications,
  setNotifications,
  ppoData,
  setPPOData,
  announcements,
  setAnnouncements,
  certificates,
  setCertificates,
  reports,
}: AppRoutesProps) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <MainLayout>
        <Dashboard
          interns={interns}
          attendance={attendance}
          meetings={meetings}
          documents={documents}
          trainings={trainings}
          evaluations={evaluations}
          notifications={notifications}
        />
      </MainLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/mentor-dashboard"
  element={
    <ProtectedRoute>
      <MainLayout>
        <MentorDashboard
          interns={interns}
          meetings={meetings}
          tasks={tasks}
          evaluations={evaluations}
        />
      </MainLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/intern-dashboard"
  element={
    <ProtectedRoute>
      <MainLayout>
        <InternDashboard
          tasks={tasks}
          meetings={meetings}
          attendance={attendance}
          evaluations={evaluations}
        />
      </MainLayout>
    </ProtectedRoute>
  }
/>

        <Route
          path="/interns"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Interns interns={interns} setInterns={setInterns} mentors={mentors} />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
  path="/mentors"
  element={
    <ProtectedRoute>
      <MainLayout>
        <Mentors
          mentors={mentors}
          setMentors={setMentors}
        />
      </MainLayout>
    </ProtectedRoute>
  }
/>


        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Tasks tasks={tasks} setTasks={setTasks} interns={interns} />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/meetings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Meetings
                  meetings={meetings}
                  setMeetings={setMeetings}
                  interns={interns}
                  mentors={mentors}
                />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Attendance
                  attendance={attendance}
                  setAttendance={setAttendance}
                  interns={interns}
                  mentors={mentors}
                />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Feedback />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Documents documents={documents} setDocuments={setDocuments} />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/training"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Training
                  trainings={trainings}
                  setTrainings={setTrainings}
                  interns={interns}
                  mentors={mentors}
                />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/evaluations"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Evaluations
                  evaluations={evaluations}
                  setEvaluations={setEvaluations}
                />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ppo"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PPOPage ppoData={ppoData} setPPOData={setPPOData} />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/announcements"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Announcements
                  announcements={announcements}
                  setAnnouncements={setAnnouncements}
                />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/certificates"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Certificates
                  certificates={certificates}
                  setCertificates={setCertificates}
                />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Notifications
                  notifications={notifications}
                  setNotifications={setNotifications}
                />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Reports reports={reports} />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;