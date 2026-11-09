# Nexturn Intern Management – Demo Guide

Module-by-module demo script. Each module lists what to show, the steps, and the expected result.
Suggested total time: about 35–40 minutes. Demo in the order below, because each module builds on
data created in the previous ones.

## 0. Before You Start

| Item        | Value                                                                              |
| ----------- | ---------------------------------------------------------------------------------- |
| Backend     | Spring Boot API running at `http://localhost:8080/api` (`VITE_API_BASE_URL`)       |
| Frontend    | `npm run dev` then open `http://localhost:5173`                                    |
| Admin login | `admin@nexturn.com` / `Admin@123` (seeded dev account; change before production)   |
| Browser     | Use one normal window for ADMIN and a private window per extra role                |
| Tip         | Login is stored per tab (`sessionStorage`), so two tabs can be two different users |

Demo accounts to prepare (create them in modules 3–5, or reuse existing ones):

- 1 ADMIN (seeded), 1 HR, 1 Mentor, 2 Interns.
- Mentor and intern login accounts are created automatically with the default passwords set by the
  backend. Ask the team for the current default.

## 1. Login and Session

**Show:** secure login, role-based redirect, auto token refresh, logout.

1. Open `/`. Sign in as ADMIN. You land on `/dashboard`.
2. Refresh the page. You stay signed in, because the session is restored from `GET /auth/user`.
3. Wrong password. A clear "Invalid email or password." message appears.
4. Click logout in the Navbar. You return to `/` and no previous data is cached for the next user.

**Talking point:** JWT access and refresh tokens, with a silent refresh when a token expires.

## 2. Dashboards (Role-Based)

**Show:** each role sees its own dashboard.

1. **ADMIN `/dashboard`:** stat cards, charts, upcoming meetings, latest documents, notifications.
   Point out the **HR count card**, visible to ADMIN only.
2. **HR user:** the same dashboard, but without the HR card and scoped to their own mentors and interns.
3. **Mentor `/mentor-dashboard`:** own interns, meetings, tasks.
4. **Intern `/intern-dashboard`:** own tasks, meetings, attendance, evaluations.

**Talking point:** each dashboard loads only the APIs it needs (RTK Query cache).

## 3. HR Management (ADMIN only)

**Show:** `/hr`, hidden from every other role.

1. Open **HR Management** in the sidebar. The page shows stats (total HRs, assigned mentors/interns).
2. **Add HR:** name, email, password. The new HR appears in the table.
3. **Edit HR:** change the name (password is optional).
4. **Manage assignments:** pick mentors and interns in the multi-selects, then save.
5. Log in as that HR. The HR sees only the assigned mentors and interns.
6. As an HR user, try to open `/hr`. You are redirected to `/dashboard`.

## 4. Mentors

**Show:** `/mentors`.

1. Stats row (Total / Active / Inactive / Departments), search, Department and Status filters.
2. **Add Mentor:** name, email, department, designation, status. ADMIN also sees an **HR** select.
3. Edit and delete (a confirmation dialog appears).
4. As a mentor or intern, the page is read-only or not shown.

## 5. Interns

**Show:** `/interns` (shown as **My Interns** for mentors).

1. Stats, search, filters, table with Name, Email, Department, Mentor, Status.
2. **Add Intern:** name, email, department, mentor, status, end date.
3. Edit and delete.
4. **End date:** an intern whose end date has passed and who is still "Active" shows as **Completed**.
5. Log in as a mentor. Only that mentor's interns are shown.

## 6. Tasks and Task Detail

**Show:** `/tasks` and `/tasks/:id`.

1. Task chart (Total / Pending / In Progress / Completed), search, Status and Priority filters.
2. **Create a task** as HR or mentor: title, description, intern, priority, due date.
3. Open the task detail page. Update status and progress ("work update").
4. **Comments:** add a comment, edit a comment (shows "edited").
5. Mark the task **Completed**. The completion evaluation prompt appears (see module 10).
6. As the intern: only own tasks are visible, and they can update their work and comment.

## 7. Meetings

**Show:** `/meetings`.

1. Chart (Total / Scheduled / Completed / Cancelled), search, status filter, calendar view.
2. **Schedule a meeting:** title, agenda, mentor, intern, date, time.
3. Change status to Completed or Cancelled.
4. Show the **Upcoming Meetings** widget on the dashboards.
5. Intern view is read-only.

## 8. Attendance and Leave

**Show:** `/attendance`.

1. **Intern:** use the **check-in/out card**. Check in, then check out, and the worked time appears.
2. **Intern:** **Apply leave** (type, from/to dates, reason).
3. **HR:** the **Leave Requests panel** lists pending requests. **Approve** or **Reject**.
   Approving updates attendance automatically.
4. Calendar and monthly grid with legend. Use filters (date range, status).
5. HR can add or edit an attendance record manually.

## 9. Training

**Show:** `/training`.

1. Chart (Not Started / In Progress / Completed), search, status filter.
2. **Add training:** title, intern, mentor, start and end dates, status, progress.
3. Intern sees only own trainings, read-only.

## 10. Evaluations

**Show:** `/evaluations`.

1. Chart of averages, search by intern.
2. **Add evaluation:** pick an intern, optionally a **completed task**, then rate each criterion.
   The overall score is calculated from the ratings.
3. Edit and delete.
4. Show the evaluation prompt that appears when completing a task (module 6).
5. Intern sees only their own evaluations.

## 11. PPO (Pre-Placement Offer)

**Show:** `/ppo`.

1. Chart (Eligible / Not Eligible / Offered), search, status filter.
2. **Add PPO:** attendance %, training %, scores, mentor and HR recommendations, status.
3. Intern sees only their own PPO record.

## 12. Documents

**Show:** `/documents`.

1. Chart by type, search, type filter.
2. **Upload** a file with a type (Resume, Certificate, Offer Letter, Report, Other).
3. **Download** the file you uploaded.
4. Delete. HR sees all documents; other roles see their own.
5. The **Latest Documents** widget appears on the dashboard.

## 13. Certificates

**Show:** `/certificates`.

1. Chart (Total / Active / Expired / Issued This Month).
2. **Issue a certificate** (HR): intern, name, issue and expiry dates.
3. Mentor sees certificates of their interns; intern sees their own, read-only.

## 14. Notifications

**Show:** `/notifications` and the Navbar bell.

1. **Create a notification** (HR): title, message, recipient.
2. Log in as the recipient. The bell shows an **unread count** (refreshes every minute).
3. Click a notification. It is **marked read** and the count drops.
4. Edit and delete from `/notifications`.

## 15. Announcements

**Show:** `/announcements` (the sidebar entry is currently commented out, so open the URL directly).

1. Chart by priority.
2. **Create an announcement:** title, description, publish and expiry dates, priority, target audience.
3. Log in as a different role. Only announcements for "All" or that role are visible.

## 16. Feedback

**Show:** `/feedback`.

1. A user submits feedback.
2. HR sees all feedback; other roles see only their own.
3. Delete a feedback entry.

## 17. Reports

**Show:** `/reports`.

1. Chart (Total / Avg Attendance / Avg Evaluation / PPO Offered).
2. Search by intern and filter by PPO status.
3. Click **Export** to download the **Excel** report.
4. Mentor sees reports for their own interns only.

## 18. Profile and Settings

**Show:** `/profile` and `/settings`.

1. **Profile:** upload an avatar.
2. **Settings:** toggle email and push notifications, theme and phone, then save.
3. **Change password:** enter the current and new password, then sign in again with the new one.

## 19. Technical Highlights (Closing Slide)

| Topic        | Point to make                                                                    |
| ------------ | -------------------------------------------------------------------------------- |
| Data layer   | **RTK Query**: caching, automatic refetch after changes, no manual state         |
| Loading      | Pages fetch only their own data; a global loader shows pending requests          |
| Security     | JWT with silent refresh, role-based routes (`ProtectedRoute`, `adminOnly`)       |
| Role scoping | Backend filters data by role; UI hides manage actions                            |
| Code quality | TypeScript strict, ESLint, Prettier, Husky pre-commit, circular-dependency check |
| Stack        | React 19, Vite, MUI, Chart.js/Recharts, FullCalendar; Spring Boot + PostgreSQL   |

For the full technical reference see `UI_FEATURE_ANALYSIS.md`.

## 20. Demo Checklist

- [ ] Backend and frontend running; admin login works
- [ ] At least 1 HR, 1 mentor and 2 interns created
- [ ] One task, one meeting and one training ready for each intern
- [ ] One pending leave request prepared for the approval demo
- [ ] A sample file ready for the Documents upload
- [ ] Browser windows opened for ADMIN, mentor and intern
