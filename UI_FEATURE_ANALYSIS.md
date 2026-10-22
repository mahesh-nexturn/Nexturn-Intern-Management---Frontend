# Nexturn Intern Management – Frontend Guide

One-file reference for how the frontend is built, what it does and which packages it uses.
Last updated: 2026-10-22.

## 1. App Overview

**Nexturn Intern Management** is a role-based single-page app for running an internship
program. It talks to a Spring Boot REST API (`VITE_API_BASE_URL`, default
`http://localhost:8082/api`) and uses JWT login with automatic token refresh.

| Backend role | UI role  | What they can do                                                          |
| ------------ | -------- | ------------------------------------------------------------------------- |
| `ADMIN`      | `HR`     | Everything, plus HR Management and the HR-count dashboard card            |
| `HR`         | `HR`     | Manage their own mentors/interns (the backend scopes the data)            |
| `MENTOR`     | `MENTOR` | Manage tasks, meetings, evaluations for their interns                     |
| `INTERN`     | `INTERN` | See own tasks, meetings, attendance, trainings; check in/out; apply leave |

The UI role `HR` covers both `ADMIN` and `HR`. The exact role is kept in
`sessionStorage.backendRole`. Use `isAdminUser()` / `isHrUser()` from `services` to tell them apart.

## 2. Tech Stack and Packages

| Package                                                                | Used for                                                   |
| ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| `react` 19, `react-dom`                                                | UI                                                         |
| `typescript` 6, `vite` 8, `@vitejs/plugin-react`                       | Language, dev server, build                                |
| `@reduxjs/toolkit`, `react-redux`                                      | **RTK Query**: server-data fetching, caching, invalidation |
| `axios`                                                                | HTTP client (token header, 401/403 refresh, global loader) |
| `react-router-dom` 7                                                   | Routing                                                    |
| `@mui/material`, `@mui/icons-material`, `@emotion/*`                   | Component library and icons                                |
| `chart.js`, `react-chartjs-2`, `recharts`                              | Charts                                                     |
| `@fullcalendar/*`, `react-calendar`                                    | Calendars (meetings, attendance)                           |
| `jspdf`                                                                | PDF generation                                             |
| `eslint` (+ react-hooks, react-refresh, typescript-eslint), `prettier` | Linting and formatting                                     |
| `husky`, `lint-staged`                                                 | Pre-commit checks                                          |
| `madge`                                                                | Circular dependency check                                  |
| `knip`                                                                 | Unused file/export detection                               |

Scripts: `npm run dev`, `build` (`tsc -b && vite build`), `lint`, `format`, `format:check`,
`circular`, `knip`, `audit`.

Install note: `.npmrc` sets `legacy-peer-deps=true`, so plain `npm install` works. It is needed
because `madge` has an optional peer on TypeScript 5 while the app uses TypeScript 6.

## 3. Project Structure (`src/`)

```
main.tsx            Provider(store) > AuthProvider > DialogProvider > App + GlobalLoader
App.tsx             Renders AppRoutes only (no data/state)
routes/AppRoutes    All routes, wrapped by ProtectedRoute + MainLayout
store/              RTK Query: baseApi.ts, index.ts (store + hook re-exports), endpoints/*
hooks/useAppData.ts UI-mapped data hooks (useInterns, useTasks, ...)
services/           Axios API modules + barrel (index.ts) + api.ts (axios instance)
utils/              Mappers DTO -> UI, evaluation criteria, upcoming meetings (barrel index.ts)
types/              UI types (barrel index.ts)
context/            AuthContext, DialogProvider (confirm dialogs), useAuth
pages/              One file per screen
components/         Dialogs (Add*Dialog), charts (*Chart), widgets, Navbar, Sidebar, ...
layouts/            MainLayout (Navbar + Sidebar)
```

Barrels: import from `'../services'`, `'../types'`, `'../utils'`, `'../store'` instead of individual files.

## 4. Data Flow (RTK Query)

```
Page/Component
  -> hook (useAppData.ts or a store hook)  e.g. useInterns(), useCreateTaskMutation()
  -> RTK Query endpoint (store/endpoints/*)
  -> service function (services/*Api.ts)
  -> axios instance (services/api.ts)  -> Spring Boot API
```

- **One API slice** (`store/baseApi.ts`) with `fakeBaseQuery`. Each endpoint's `queryFn` calls the
  existing service function through `run()`, which converts failures to `{ status?, message }`.
- **Caching**: every list query is fetched on first use, then served from the cache and shared
  by all pages. Components that mount together share one request. Opening `/dashboard` only loads
  what the dashboard needs.
- **Invalidation**: queries `provide` tags (`Task`, `Intern`, `Report`, ...) and mutations
  `invalidate` them, so lists refetch on their own. There is no manual `setState` after saving.
  Mentor/intern/HR changes invalidate every resource that shows their names.
- **Endpoint files**: `people.ts` (mentors, interns, HRs and assignments), `work.ts` (tasks,
  comments, evaluations, trainings, meetings, attendance, leaves), `content.ts` (announcements,
  certificates, documents, notifications, PPO, reports, feedback, settings), `auth.ts`.
- **UI mapping**: the cache stores raw DTOs. `hooks/useAppData.ts` maps them with `utils/mappers/*`
  inside `useMemo` and joins names from the intern/mentor caches.
- **Usage**:
  ```ts
  const { interns } = useInterns()
  const [createTask] = useCreateTaskMutation()
  await createTask(payload).unwrap() // errors are { status?, message }
  ```
- **Session safety**: login and logout dispatch `baseApi.util.resetApiState()`, so one user's
  cached data never shows for the next user.
- **Not in the cache**: document download (binary blob stays a direct `documentApi` call).
  Report Excel export is a mutation that returns nothing.
- **Redux store**: only the API slice. The serializable check ignores mutation args (the `File` in
  document upload).

## 5. Authentication

- `AuthContext` logs in via the `login` endpoint, stores tokens in `sessionStorage`
  (`accessToken`, `refreshToken`) and user info (`role`, `backendRole`, `name`, `email`, `userId`).
- On page load, if a token exists, `GET /api/auth/user` re-hydrates the session.
- `services/api.ts` adds the `Authorization` header. On 401/403 it refreshes the token once
  (a shared in-flight refresh), retries the request, and otherwise sends the user to `/`.
- `ProtectedRoute` guards pages; `adminOnly` restricts `/hr` to `ADMIN`.
- `GlobalLoader` shows a spinner while any axios request is pending (`loadingStore.ts`).

## 6. Screens (Routes)

| Route               | Screen             | Notes                                                                           |
| ------------------- | ------------------ | ------------------------------------------------------------------------------- |
| `/`                 | Login              | Email and password; redirects by role                                           |
| `/dashboard`        | HR/Admin dashboard | Stat cards and charts; **HR count card visible to ADMIN only**                  |
| `/mentor-dashboard` | Mentor dashboard   | Own interns, meetings, tasks                                                    |
| `/intern-dashboard` | Intern dashboard   | Own tasks, meetings, attendance, evaluations                                    |
| `/interns`          | Interns            | CRUD, search/filters, HR column/select for ADMIN                                |
| `/mentors`          | Mentors            | CRUD, search/filters, HR column/select for ADMIN                                |
| `/tasks`            | Tasks              | CRUD, status/priority filters, progress                                         |
| `/tasks/:id`        | Task detail        | Work updates, comments (add/edit), completion evaluation                        |
| `/meetings`         | Meetings           | Scheduling, calendar and upcoming widget                                        |
| `/attendance`       | Attendance         | Calendar and week table, intern check-in/out card, apply leave, leave approvals |
| `/feedback`         | Feedback           | HR sees all feedback, others see their own; create/delete                       |
| `/documents`        | Documents          | Upload (multipart), download, delete                                            |
| `/training`         | Training           | CRUD with progress                                                              |
| `/evaluations`      | Evaluations        | Criteria ratings and overall score                                              |
| `/ppo`              | PPO                | HR/mentor list; intern sees own PPO                                             |
| `/announcements`    | Announcements      | Target audience and priority (menu item currently commented out in Sidebar)     |
| `/certificates`     | Certificates       | Issue/track, scoped by role                                                     |
| `/notifications`    | Notifications      | Create/edit/delete, mark read                                                   |
| `/reports`          | Reports            | Aggregated table and **Excel export**                                           |
| `/hr`               | HR Management      | **ADMIN only**: HR CRUD and mentor/intern assignment                            |
| `/profile`          | Profile            | Avatar upload dialog                                                            |
| `/settings`         | Settings           | Notification toggles, theme, phone, change password                             |

Sidebar menus: **HR/Admin** gets Dashboard, Mentors, Interns, Tasks, Meetings, Attendance, Training,
Evaluations, Documents, Certificates, Notifications, Reports, Settings (+ HR Management for ADMIN).
**Mentor** gets Dashboard, My Interns, Tasks, Meetings, Evaluations, Notifications, Reports, Settings.
**Intern** gets Dashboard, Tasks, Meetings, Attendance, Training, Documents, Certificates,
Notifications, Settings. The Navbar shows a notification bell (unread count, polled every 60 s).

## 7. Key Features

- **Role-scoped data**: the backend filters data per role. The UI additionally hides manage actions
  (`isHr`, `isMentor`, `isIntern` checks).
- **Attendance**: interns check in/out (`AttendanceCheckInCard`), see worked time, apply for leave
  (`ApplyLeaveDialog`); HR approves or rejects in `LeaveRequestsPanel`; approval updates attendance.
- **Tasks**: progress, status flow, discussion comments, and an evaluation prompt on completion.
- **HR Management** (ADMIN): HR users with assigned mentors/interns (`HrAssignmentsDialog`).
- **Reports**: aggregate table, charts and Excel export.
- **Confirm dialogs**: `DialogProvider` and `useDialogs().confirm` replace `window.confirm`.
- **Settings**: profile info, notification preferences, password change.

## 8. API Endpoints Used (Backend `/api`)

`auth` (login, refresh, logout, `user`, change-password) · `mentors` · `interns` · `hr`
(+ `/{id}/mentors|interns`) · `tasks` (+ `/{id}/work`, `/{id}/comments`) · `meetings` · `attendance`
(+ `today`, `check-in`, `check-out`) · `leaves` (+ approve/reject) · `training` · `evaluations` ·
`ppo` (+ `my`) · `certificates` · `documents` (+ upload/download) · `announcements` ·
`notifications` (+ mark-read) · `reports` (+ export) · `feedback` (+ my) · `settings/user` ·
`users` · `dashboard`.

Backend stack: Spring Boot, Spring Security with JWT (jjwt), JPA, Flyway, PostgreSQL (H2 for dev),
Apache POI (Excel), springdoc OpenAPI. See `BACKEND_ARCHITECTURE.md`.

## 9. Code Conventions

- Barrel imports (`services`, `types`, `utils`, `store`); services keep importing each other directly.
- `verbatimModuleSyntax` and `erasableSyntaxOnly` are on: use `import type`, no TS enums.
- Pages hold only UI state (dialogs, filters, toasts). Server data comes from RTK Query hooks.
- Page-level "failed to load" toasts are driven by query `isError`.
- Before committing: `npx prettier --write src`, `npx tsc -b`, `npx eslint src`, `npm run circular`.

## 10. How to Add a New Resource

1. Add `services/fooApi.ts` (DTOs, payload, HTTP functions) and export it from `services/index.ts`.
2. Add a tag to `tagTypes` in `store/baseApi.ts`.
3. Add query and mutation endpoints in the matching `store/endpoints/*.ts` (`queryFn: () => run(...)`,
   `providesTags`/`invalidatesTags`) and export the hooks.
4. If the UI needs mapped data, add a mapper in `utils/mappers/` and a hook in `hooks/useAppData.ts`.
5. Build the page in `pages/`, add the route in `routes/AppRoutes.tsx` and a Sidebar entry.

## 11. Known Gaps and Ideas

- Hooks in `useAppData.ts` return `isLoading` but not `isError`.
- `toUiIntern` and `toUiMentor` do not map `hrId`/`hrName`, so Interns and Mentors keep local mappers.
- No pagination: tables render all filtered rows client-side.
- No theme/design system: styling is per-component MUI `sx` with repeated hex colors.
- `App.css` and `index.css` are unused.
- Possible next step: split `pages/` into `features/<domain>/` folders; optimistic updates and
  optional polling via RTK Query `pollingInterval` for notifications and attendance.
