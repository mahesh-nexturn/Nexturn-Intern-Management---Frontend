import { useEffect, useState } from "react";

import AppRoutes from "./routes/AppRoutes";
import { useAuth } from "./context/AuthContext";
import * as mentorApi from "./services/mentorApi";
import * as internApi from "./services/internApi";
import * as attendanceApi from "./services/attendanceApi";
import * as meetingApi from "./services/meetingApi";
import * as documentApi from "./services/documentApi";
import * as trainingApi from "./services/trainingApi";
import * as evaluationApi from "./services/evaluationApi";
import * as notificationApi from "./services/notificationApi";
import * as taskApi from "./services/taskApi";
import { toUiAttendance } from "./pages/Attendance";
import { toUiMeeting } from "./pages/Meetings";
import { toUiDocument } from "./pages/Documents";
import { toUiTraining } from "./pages/Training";
import { toUiEvaluation } from "./pages/Evaluations";
import { toUiNotification } from "./pages/Notifications";
import { toUiTask } from "./pages/Tasks";

import type { Mentor } from "./types/Mentor";
import type { Intern } from "./types/Intern";
import type { Attendance } from "./types/Attendance";
import type { Meeting } from "./types/Meeting";
import type { Document } from "./types/Document";
import type { Training } from "./types/Training";
import type { Evaluation } from "./types/Evaluation";
import type { Notification } from "./types/Notification";
import type { Task } from "./types/Task";
import type { PPO } from "./types/PPO";
import type { Report } from "./types/Report";
import type { Certificate } from "./types/Certificate";
import type { Announcement } from "./types/Announcement";

function App() {
  const { user } = useAuth();

  const [mentors, setMentors] = useState<Mentor[]>([]);

  const [interns, setInterns] = useState<Intern[]>([]);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [attendance, setAttendance] = useState<Attendance[]>([]);

  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [ppoData, setPPOData] = useState<PPO[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Mentors/interns are reference data needed by almost every page's dropdowns
  // (assignee pickers, ownership scoping, etc.), so load them once globally
  // right after login rather than waiting for the user to visit those pages.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadDashboardData = async () => {
      const [mentorResult, internResult] = await Promise.allSettled([
        mentorApi.listMentors(),
        internApi.listInterns(),
      ]);

      const mentorList =
        mentorResult.status === "fulfilled"
          ? mentorResult.value.map((m) => ({
              id: m.id,
              name: m.name,
              email: m.email,
              department: m.department ?? "",
              designation: m.designation ?? "",
              status: (m.status as "Active" | "Inactive") ?? "Active",
            }))
          : [];

      const internList =
        internResult.status === "fulfilled"
          ? internResult.value.map((i) => ({
              id: i.id,
              name: i.name,
              email: i.email,
              department: i.department ?? "",
              mentor: i.mentorName ?? "",
              mentorId: i.mentorId,
              status: i.status ?? "Active",
              userId: i.userId,
            }))
          : [];

      if (cancelled) return;

      if (mentorResult.status === "fulfilled") {
        setMentors(mentorList);
      }

      if (internResult.status === "fulfilled") {
        setInterns(internList);
      }

      attendanceApi
        .listAttendance()
        .then((list) => {
          if (!cancelled) {
            setAttendance(list.map((item) => toUiAttendance(item, internList, mentorList)));
          }
        })
        .catch(() => {
          /* individual pages surface their own load errors */
        });

      meetingApi
        .listMeetings()
        .then((list) => {
          if (!cancelled) {
            setMeetings(list.map((item) => toUiMeeting(item, internList, mentorList)));
          }
        })
        .catch(() => {
          /* individual pages surface their own load errors */
        });

      documentApi
        .listDocuments()
        .then((list) => {
          if (!cancelled) {
            setDocuments(list.map(toUiDocument));
          }
        })
        .catch(() => {
          /* individual pages surface their own load errors */
        });

      trainingApi
        .listTrainings()
        .then((list) => {
          if (!cancelled) {
            setTrainings(list.map((item) => toUiTraining(item, internList, mentorList)));
          }
        })
        .catch(() => {
          /* individual pages surface their own load errors */
        });

      evaluationApi
        .listEvaluations()
        .then((list) => {
          if (!cancelled) {
            setEvaluations(list.map((item) => toUiEvaluation(item, internList)));
          }
        })
        .catch(() => {
          /* individual pages surface their own load errors */
        });

      notificationApi
        .listNotifications()
        .then((list) => {
          if (!cancelled) {
            setNotifications(list.map(toUiNotification));
          }
        })
        .catch(() => {
          /* individual pages surface their own load errors */
        });

      taskApi
        .listTasks()
        .then((list) => {
          if (!cancelled) {
            setTasks(list.map((item) => toUiTask(item, internList)));
          }
        })
        .catch(() => {
          /* individual pages surface their own load errors */
        });
    };

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <AppRoutes
      mentors={mentors}
      setMentors={setMentors}
      interns={interns}
      setInterns={setInterns}
      tasks={tasks}
      setTasks={setTasks}
      attendance={attendance}
      setAttendance={setAttendance}
      meetings={meetings}
      setMeetings={setMeetings}
      documents={documents}
      setDocuments={setDocuments}
      trainings={trainings}
      setTrainings={setTrainings}
      evaluations={evaluations}
      setEvaluations={setEvaluations}
      notifications={notifications}
      setNotifications={setNotifications}
      ppoData={ppoData}
      setPPOData={setPPOData}
      reports={reports}
      setReports={setReports}
      certificates={certificates}
      setCertificates={setCertificates}
      announcements={announcements}
      setAnnouncements={setAnnouncements}
    />
  );
}

export default App;