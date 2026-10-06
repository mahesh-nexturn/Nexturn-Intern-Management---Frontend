# Nexturn Intern Management – UI & Feature Analysis

## App Overview
**Nexturn Intern Management** is a role-based (HR/Admin, Mentor, Intern) React + MUI
single-page app for managing an internship program. All data is currently mock/in-memory
(`useState` in `App.tsx`) — there is no backend/API integration yet.

## Screens (Routes) & Features

| Route | Screen | Purpose |
|---|---|---|
| `/` | **Login** | Auth entry point (hardcoded demo users in `utils/users.ts`) |
| `/dashboard` | **HR/Admin Dashboard** | Org-wide stats: interns, attendance, meetings, docs, trainings, evaluations, notifications (617 lines) |
| `/mentor-dashboard` | **Mentor Dashboard** | Mentor's assigned interns, meetings, tasks, evaluations (544 lines) |
| `/intern-dashboard` | **Intern Dashboard** | Intern's own tasks, meetings, attendance, evaluations (569 lines) |
| `/interns` | **Interns** | Full CRUD table of interns (largest page, 735 lines) |
| `/mentors` | **Mentors** | CRUD table of mentors |
| `/tasks` | **Tasks** | Task assignment/tracking + chart |
| `/meetings` | **Meetings** | Scheduling + upcoming-meetings widget |
| `/attendance` | **Attendance** | Calendar grid, filters, legend, chart |
| `/feedback` | **Feedback** | Feedback form/list |
| `/documents` | **Documents** | Upload/list + "latest documents" widget + chart |
| `/training` | **Training** | Training programs + chart |
| `/evaluations` | **Evaluations** | Intern performance evaluations + chart |
| `/ppo` | **PPO** (Pre-Placement Offer) | PPO tracking + chart |
| `/announcements` | **Announcements** | Org announcements + chart |
| `/certificates` | **Certificates** | Certificate issuance/tracking + chart |
| `/notifications` | **Notifications** | Notification center + widget/chart |
| `/reports` | **Reports** | Aggregated reporting + chart |
| `/settings` | **Settings** | App/user settings |

## Sidebar Navigation (Role-Based Menu)

- **HR**: Dashboard, Mentors, Interns, Tasks, Meetings, Attendance, Training, Evaluations, Documents, Certificates, Announcements, Notifications, Reports, Settings (full 14 items).
- **Mentor**: Dashboard, My Interns, Tasks, Meetings, Evaluations, Reports, Settings (7 items).
- **Intern**: Dashboard, Tasks, Meetings, Training, Documents, Certificates, Notifications, Settings (8 items).

## Detailed Screen-by-Screen Breakdown

### 1. Login (`/`)
**Features:** Email + password text fields, a Role dropdown (HR / Mentor / Intern), "Sign In" button, and a visible "Demo Credentials" panel listing all seeded accounts.
**Operations:**
- Enter email, password, select role → click **Sign In**.
- `loginUser()` checks credentials/role against the hardcoded list in `utils/users.ts`.
- On success, redirects by role: HR → `/dashboard`, Mentor → `/mentor-dashboard`, Intern → `/intern-dashboard`.
- On failure, shows a browser `alert("Invalid credentials")`.
- No "forgot password", no real session/token — role/name are written to `localStorage` for later screens to read.

### 2. HR/Admin Dashboard (`/dashboard`)
**Features:** Org-wide stat cards and charts aggregating interns, attendance, meetings, documents, trainings, evaluations, and notifications (read-only, no add/edit here).
**Operations:** View-only overview; navigation to detail screens happens via the sidebar.

### 3. Mentor Dashboard (`/mentor-dashboard`)
**Features:** Scoped view of the mentor's own interns, their tasks, meetings, and evaluations.
**Operations:** View-only aggregated widgets/charts; data is pre-filtered to the logged-in mentor.

### 4. Intern Dashboard (`/intern-dashboard`)
**Features:** Scoped view of the intern's own tasks, meetings, attendance, and evaluations.
**Operations:** View-only aggregated widgets/charts filtered to the logged-in intern.

### 5. Interns (`/interns`)
**Features:** Stat row (Total / Active / Inactive / Departments), search box, Department + Status filters, a data table (Name, Email, Department, Mentor, Status), and an Add/Edit dialog.
**Fields (Add/Edit dialog):** Name, Email, Department, Mentor, Status (Active/Inactive).
**Operations:**
- **HR only** sees "Add Intern" button and Edit/Delete icons (role-gated via `canManageInterns = isHr`).
- **Mentor** view auto-filters to interns where `mentor === loggedInUser`.
- **Intern** view auto-filters to just their own record.
- Search filters by name/email (case-insensitive); Department/Status dropdowns filter the table.
- Delete asks `window.confirm()` before removing.
- Validation: Name and Department are required before Save.

### 6. Mentors (`/mentors`)
**Features:** Stat row (Total / Active / Inactive / Departments), search, Department + Status filters, table (Name, Email, Department, Designation, Status), Add/Edit dialog.
**Fields:** Name, Email, Department, Designation, Status.
**Operations:**
- **HR only** can Add/Edit/Delete (`isHr` gate); other roles get a read-only table.
- Validation requires all 4 text fields filled before saving.
- Delete confirms via `window.confirm()`.

### 7. Tasks (`/tasks`)
**Features:** `TaskChart` (Total/Pending/In Progress/Completed), search, Status + Priority filters, table (Title, Assigned To, Mentor, Priority chip, Due Date, Status chip, Progress bar), Add/Edit dialog (`AddTaskDialog`).
**Fields:** Title, Description, Assigned To, Mentor, Priority (High/Medium/Low), Due Date, Status (Pending/In Progress/Completed), Progress (%).
**Operations:**
- **HR & Mentor** can manage (add/edit/delete); **Intern** sees only tasks assigned to them, read-only.
- Mentor view is auto-scoped to `task.mentor === loggedInUser`; Intern view to `task.assignedTo === loggedInUser`.
- Progress shown as a `LinearProgress` bar + percentage text.
- Priority/Status rendered as color-coded Chips (red/orange/green, blue/orange/green respectively).

### 8. Meetings (`/meetings`)
**Features:** `MeetingChart` (Total/Scheduled/Completed/Cancelled), search, Status filter, table (Title, Intern, Mentor, Date, Time, Status chip), Add/Edit dialog.
**Fields:** Title, Agenda, Mentor, Intern, Date, Time, Status (Scheduled/Completed/Cancelled).
**Operations:**
- **HR & Mentor** can add/edit/delete; **Intern** view is read-only and scoped to meetings where they're the invitee.
- Status Chip colors: Completed=green, Scheduled=blue, Cancelled=red.

### 9. Attendance (`/attendance`)
**Features:** A calendar-style view (`AttendanceCalendar`) rather than a plain table, plus an Add/Edit dialog (`AddAttendanceDialog`).
**Fields:** Intern, Mentor, Date, Status (Present/Absent/etc.).
**Operations:**
- Adding a record for an intern+date that already exists **updates** the existing entry instead of duplicating it (dedup by `intern` + `date`).
- Calendar renders per-intern attendance visually (grid/legend components support this).

### 10. Feedback (`/feedback`)
**Features:** Currently a placeholder — renders only an `<h1>Feedback Page</h1>`. **Not implemented yet.**

### 11. Documents (`/documents`)
**Features:** `DocumentChart` (Total/Resumes/Certificates/Reports), search, Type filter (Resume/Certificate/Offer Letter/Report/Other), table (File Name, Type chip, Uploaded By, Upload Date), Add/Edit dialog (`AddDocumentDialog`), and per-row Download/Edit/Delete icons.
**Operations:**
- All 3 roles can manage their own uploads (`canManageDocuments = isHr || isMentor || isIntern`); HR sees all documents, others see only their own uploads.
- **Download icon is present but not wired to an actual file** — no real file storage/upload backend yet.

### 12. Training (`/training`)
**Features:** `TrainingChart` (Total/Not Started/In Progress/Completed), search, Status filter, table (Title, Assigned To, Mentor, Start/End Date, Status chip, Progress bar), Add/Edit dialog.
**Operations:** HR & Mentor manage; Intern sees only their own assigned trainings, read-only. Progress shown with `LinearProgress`.

### 13. Evaluations (`/evaluations`)
**Features:** `EvaluationChart` (averages for Technical/Communication/Overall), search by intern, table (Intern, Mentor, Technical/Communication/Problem-Solving/Overall ratings, Feedback text), Add/Edit dialog.
**Operations:** HR & Mentor manage; Intern view is read-only, scoped to their own evaluations. No 1–5/1–10 scale validation visible in the list page (handled in the Add dialog).

### 14. PPO – Pre-Placement Offer (`/ppo`)
**Features:** `PPOChart` (Total/Eligible/Not Eligible/Offered), search, Status filter, table (Intern, Mentor, Attendance %, Training %, Technical/Communication/Overall scores, Status chip), Add/Edit dialog.
**Fields:** Attendance %, Training Completion %, Technical Score, Communication Score, Overall Score, Mentor Recommendation (Yes/No), HR Recommendation (Yes/No), Status (Eligible/Not Eligible/Offered).
**Operations:** HR & Mentor manage; Intern sees only their own PPO record, read-only.

### 15. Announcements (`/announcements`)
**Features:** `AnnouncementChart` (Total/High/Medium/Low priority), search, Priority filter, table (Title, Description, Created By, Publish/Expiry Date, Priority chip, Target Audience), Add/Edit dialog.
**Operations:**
- **HR only** can manage (`canManageAnnouncements = isHr`).
- Visibility for all roles is filtered by `targetAudience === "All" || targetAudience === role` — i.e., announcements can be targeted to a specific role.

### 16. Certificates (`/certificates`)
**Features:** `CertificateChart` (Total/Active/Expired/Issued This Month), search, Status filter (Active/Expired), table (Intern, Mentor, Certificate Name, Issued By, Issue/Expiry Date, Status chip), Add/Edit dialog.
**Operations:**
- **HR only** can manage; Mentor sees only certificates for their interns; Intern sees only their own — all read-only for non-HR.
- "Issued This Month" stat computed by comparing `issueDate`'s month to the current month.

### 17. Notifications (`/notifications`)
**Features:** `NotificationChart` (Total/Unread/Read/Today), search, Status filter (Unread/Read), table (Title, Message, Recipient, Created By, Date, Status chip), Add/Edit dialog.
**Operations:**
- **HR only** can manage; visibility for all roles filtered by `recipient === "All" || recipient === role`.
- No explicit "mark as read" action wired in the table (status is only set via the Add/Edit dialog).

### 18. Reports (`/reports`)
**Features:** `ReportChart` (Total/Avg Attendance/Avg Evaluation/PPO Offered), search by intern, PPO-Status filter, read-only table (Intern, Mentor, Attendance %, Completed/Pending Tasks, Training %, Evaluation Score, PPO status chip), and an **"Export Report"** button (HR only).
**Operations:**
- No create/edit/delete — this is a pure aggregation/reporting screen.
- **Export button only shows a placeholder `alert()`** ("Export functionality can be integrated with Excel/PDF") — not actually implemented.
- Mentor/Intern views are auto-scoped to their own data.

### 19. Settings (`/settings`)
**Features:** Currently a placeholder — renders only an `<h1>Settings Page</h1>`. **Not implemented yet.**

## Recurring UI/Operation Patterns Across Screens

- **Role-based visibility, not route-based**: Every list page (Interns, Tasks, Meetings, Training, Evaluations, PPO, Certificates, Documents, Notifications, Announcements) independently reads `localStorage.getItem("role")`/`"name"` and filters its own data — the same 3-way `isHr/isMentor/isIntern` branching logic is duplicated in ~12 files.
- **Add/Edit via the same dialog**: Every domain reuses one dialog component for both create and edit, keyed off an `editIndex` (`null` = add, otherwise = edit); Save button label switches between "Save/Add" and "Update".
- **Delete confirmation**: Most delete actions use a plain `window.confirm()` (no custom confirmation modal).
- **Client-side only filtering**: Search + dropdown filters (status/priority/department/type) are computed in-memory via `.filter()` — no server-side pagination or search.
- **Identity matching by field values, not IDs**: Several screens (Tasks, Meetings, Training, Evaluations, PPO, Certificates, Announcements, Notifications) find the "actual index" to edit/delete by matching multiple field values (e.g., title+date) instead of using a stable unique ID — risk of mismatched rows if two records share the same values.
- **Charts are decorative stat summaries**: Each `*Chart` component receives pre-computed counts/averages as props and renders them (not raw data), so charts are simple visual summaries, not interactive drill-downs.
- **Not-yet-implemented screens**: `Feedback` and `Settings` are placeholder stubs with no real UI.
- **No pagination**: All tables render every filtered row directly — could be slow with large datasets.

## UI Composition Patterns

- **Layout**: `MainLayout` = `Navbar` + `Sidebar`, wrapping every protected page.
- **Access control**: `ProtectedRoute` gates all routes except `/`, but it reads
  `localStorage` directly, bypassing `AuthContext`.
- **CRUD pattern**: Each domain (Interns, Tasks, Meetings, Attendance, Documents,
  Training, Evaluations, PPO, Announcements, Certificates, Notifications) consists of a
  table/list page plus a matching `Add*Dialog` modal for create/edit.
- **Visualization**: Nearly every domain has a dedicated `*Chart.tsx` (11 chart
  components) shown on its list page and/or dashboards.
- **Widgets**: Dashboard-only reusable pieces — `StatCard` / `DashboardStatCard`,
  `UpcomingMeetingsWidget`, `LatestDocumentsWidget`, `NotificationWidget`.
- **Styling**: No theme/design system — styling relies entirely on per-component MUI
  `sx` props, with hardcoded hex colors repeated across pages. Two CSS files
  (`App.css`, `index.css`) exist but are dead/unused (never imported).

## Key Structural Observations

1. **State ownership** — `App.tsx` holds all 13 domain slices as `useState` and
   prop-drills 40+ props through `AppRoutes.tsx` into pages; there is no
   context/query layer per feature.
2. **Auth is fragmented** — three separate implementations exist
   (`AuthContext`, `authService`, and `ProtectedRoute`'s direct `localStorage` read)
   that don't talk to each other; login doesn't actually populate `AuthContext`.
3. **No data/API layer** — everything is in-memory mock state; there are no
   loading/error states anywhere in the app.
4. **Repeated anti-pattern** — all 12 `Add*Dialog` components use the same
   `useEffect(() => setState(...), [selected])` sync pattern; a single reusable
   hook would fix all 12 related lint errors at once.
5. **Oversized pages** — the 4 dashboard/list pages mix fetch + filter + table +
   dialog + chart logic in a single file (600–735 lines each).

## Suggested Direction

This aligns with `ARCHITECTURE_ANALYSIS.md`'s recommended restructure:
- Reorganize into `features/<domain>/` folders with a colocated page, dialog, chart,
  and data hook per domain.
- Consolidate auth into a single `AuthContext` source of truth.
- Introduce a real theme (`ThemeProvider` + `CssBaseline`) and remove dead CSS files.
- Extract a shared `useEditableForm`-style hook to eliminate the repeated dialog
  anti-pattern.
- Add a real API/data-fetching layer once a backend is available.

## Backend Mapping

See `BACKEND_ARCHITECTURE.md` for the proposed Java Spring Boot + PostgreSQL
backend that replaces this mock state. It maps 1:1 to the screens/fields
documented above (exact entity fields per domain, role-scoped API rules for
Mentors/Interns/HR, and dedicated endpoints to make the currently-placeholder
**Documents download**, **Reports export**, and **Notifications mark-read**
actions actually work).
