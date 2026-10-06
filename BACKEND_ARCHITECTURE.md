# Suggested Backend Architecture – Java Spring Boot + PostgreSQL

Based on the domains and screen-level behavior documented in
`ARCHITECTURE_ANALYSIS.md` and `UI_FEATURE_ANALYSIS.md`, here is a proposed
backend to replace the in-memory mock state in `App.tsx`. Entity fields,
enums, and role rules below are taken directly from the frontend's
TypeScript types (`src/types/*.ts`) and verified screen behavior, so the API
is a drop-in replacement for the current mock data.

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Language / Framework | Java 17+, Spring Boot 3.x |
| Web | Spring Web (REST), springdoc-openapi (Swagger UI) |
| Security | Spring Security + JWT (access + refresh token) |
| Persistence | Spring Data JPA + Hibernate |
| Database | PostgreSQL |
| Migration | Flyway (or Liquibase) |
| Validation | Jakarta Bean Validation (`@Valid`) |
| Mapping | MapStruct (Entity ↔ DTO) |
| Build | Maven or Gradle |
| Docs | OpenAPI/Swagger auto-generated |

## 2. Layered Package Structure

```
com.nexturn.internmanagement
├── config/            # SecurityConfig, CorsConfig, OpenApiConfig, JwtConfig
├── security/           # JwtFilter, JwtService, UserDetailsServiceImpl
├── common/             # Global exception handler, ApiResponse<T>, PageResponse<T>
├── auth/               # AuthController, AuthService, RefreshToken entity
├── user/               # User entity (shared: HR/Mentor/Intern login identity), Role enum
├── mentor/             # Controller, Service, Repository, Entity, DTOs
├── intern/
├── task/
├── attendance/
├── meeting/
├── document/
├── training/
├── evaluation/
├── notification/
├── ppo/
├── announcement/
├── certificate/
├── report/
├── feedback/         # future module — page not yet built in current UI
└── settings/         # future module — page not yet built in current UI
```

Each domain module follows the same 4-file pattern:
`XController.java` → `XService.java` (+`XServiceImpl`) → `XRepository.java` (JPA) → `X.java` (entity) + `XRequestDto` / `XResponseDto`.

## 3. Authentication & Authorization

- **Login flow**: `POST /api/auth/login` → validates credentials against `users`
  table (BCrypt-hashed passwords) → issues a **JWT access token** (short-lived,
  e.g. 15 min) + **refresh token** (stored hashed in DB, e.g. 7 days).
- **Roles** (single `role` enum on `users`, matches existing 3 dashboards):
  - `ADMIN` (HR) – full access to all modules.
  - `MENTOR` – scoped to assigned interns' tasks/meetings/evaluations.
  - `INTERN` – scoped to own tasks/attendance/meetings/evaluations.
- **Authorization**: `@PreAuthorize("hasRole('ADMIN')")` (or custom
  `@PreAuthorize` expressions checking ownership, e.g. mentor can only edit
  their own interns) on controller methods; Spring Security `SecurityFilterChain`
  validates the JWT on every request via a `OncePerRequestFilter`.
- **Password reset / change password**: optional additional endpoints.
- This replaces the frontend's 3 duplicated auth implementations
  (`AuthContext`, `authService`, `ProtectedRoute`) with **one real source of
  truth**: the JWT + `/api/auth/me` endpoint.

### Auth Endpoints (5)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Authenticate, issue tokens |
| POST | `/api/auth/refresh` | Exchange refresh token for new access token |
| POST | `/api/auth/logout` | Revoke refresh token |
| GET | `/api/auth/me` | Return current logged-in user + role |
| POST | `/api/auth/change-password` | Update password |

## 4. REST API Inventory (by Domain)

Standard CRUD = 5 endpoints (List, Get by ID, Create, Update, Delete). Some
domains need extra endpoints (filters, stats for charts, file upload). Role
rules below are confirmed from the current frontend (`UI_FEATURE_ANALYSIS.md`)
so authorization matches existing behavior exactly.

| # | Domain | Endpoints | Count | Role Rules | Notes |
|---|---|---|---|---|---|
| 1 | Auth | see above | 5 | Public (login), authenticated (rest) | JWT login/refresh/logout/me |
| 2 | Users | CRUD + `/users/{id}/role` | 6 | ADMIN only | Underlies mentor/intern login identity |
| 3 | Mentors | CRUD + `/mentors/{id}/interns` | 6 | ADMIN manages; all roles can read | List interns per mentor |
| 4 | Interns | CRUD + `/interns/{id}/dashboard` | 6 | ADMIN manages; MENTOR sees own interns; INTERN sees only self | Aggregated intern dashboard data |
| 5 | Tasks | CRUD + `/tasks/stats` | 6 | ADMIN & MENTOR manage; INTERN read-only (own tasks) | Chart data (Pending/In Progress/Completed counts) |
| 6 | Attendance | CRUD + `/attendance/calendar`, `/attendance/stats` | 7 | ADMIN & MENTOR manage; INTERN read-only | Upsert-by-(intern,date) semantics; calendar grid + chart |
| 7 | Meetings | CRUD + `/meetings/upcoming` | 6 | ADMIN & MENTOR manage; INTERN read-only (own meetings) | Widget data |
| 8 | Documents | CRUD + `/documents/upload`, `/documents/{id}/download`, `/documents/latest` | 8 | ADMIN, MENTOR, INTERN all manage their own uploads; ADMIN sees all | Real multipart upload + file streaming (currently a non-functional icon in the UI) |
| 9 | Training | CRUD + `/training/stats` | 6 | ADMIN & MENTOR manage; INTERN read-only (own trainings) | |
| 10 | Evaluations | CRUD + `/evaluations/stats` | 6 | ADMIN & MENTOR manage; INTERN read-only (own evaluations) | 4 rating fields: technical, communication, problemSolving, overall |
| 11 | Notifications | CRUD + `/notifications/{id}/mark-read` | 6 | ADMIN only manages; all roles read notifications targeted to their role or "All" | `recipient` enum: HR / Mentor / Intern / All |
| 12 | PPO | CRUD + `/ppo/stats` | 6 | ADMIN & MENTOR manage; INTERN read-only (own record) | Attendance %, training %, 3 scores, 2 recommendation flags |
| 13 | Announcements | CRUD + `/announcements/stats` | 6 | ADMIN only manages; all roles read announcements targeted to their role or "All" | `targetAudience` enum: All / HR / Mentor / Intern |
| 14 | Certificates | CRUD + `/certificates/stats` | 6 | ADMIN only manages; MENTOR/INTERN read-only, scoped to their interns/self | "Issued this month" stat = count where `issueDate` month == current month |
| 15 | Reports | `/reports` (GET, aggregated read-only), `/reports/export` | 2 | ADMIN sees all; MENTOR/INTERN auto-scoped | `export` returns a generated Excel/PDF file (currently just a placeholder `alert()` in the UI) |
| 16 | Feedback | CRUD | 5 | TBD (page is currently an unimplemented placeholder) | Build only once the frontend defines real fields/flow |
| 17 | Settings | GET/PUT `/settings/me` | 2 | Authenticated user, self only | Page is currently an unimplemented placeholder (e.g. theme/profile/password prefs) |
| 18 | Dashboard (aggregation) | `/dashboard/admin`, `/dashboard/mentor`, `/dashboard/intern` | 3 | Role-specific | One call per role instead of N calls |

**Total: ~95 REST endpoints** across 18 controllers (plus Swagger/OpenAPI docs
auto-generated at `/swagger-ui.html`).

> This directly replaces the 40+ props drilled through `AppRoutes.tsx` — the
> frontend would instead call these APIs via a `services/api/*` layer (e.g.
> React Query) per feature, one hook per domain.

## 5. PostgreSQL Schema (High Level)

Field names below intentionally mirror the existing frontend TypeScript types
(`src/types/*.ts`) so the API contract is a drop-in replacement for the mock
data shapes already used by the UI.

```
users(id, email, password_hash, role ENUM('ADMIN','MENTOR','INTERN'), name, created_at, updated_at)

mentors(
  id, user_id FK -> users, name, email, department, designation,
  status ENUM('Active','Inactive')
)

interns(
  id, user_id FK -> users, mentor_id FK -> mentors, name, email, department,
  status VARCHAR   -- 'Active'/'Inactive' (kept loose to match current frontend)
)

tasks(
  id, title, description, assigned_to_intern_id FK -> interns,
  mentor_id FK -> mentors, priority ENUM('High','Medium','Low'), due_date,
  status ENUM('Pending','In Progress','Completed'), progress SMALLINT CHECK (0-100)
)

meetings(
  id, title, agenda, mentor_id FK -> mentors, intern_id FK -> interns,
  meeting_date, meeting_time, status ENUM('Scheduled','Completed','Cancelled')
)

attendance(
  id, intern_id FK -> interns, mentor_id FK -> mentors, attendance_date,
  status ENUM('Present','Absent','Leave','Holiday','WFH'),
  UNIQUE(intern_id, attendance_date)   -- matches the frontend's upsert-by-date behavior
)

documents(
  id, file_name, file_url, document_type ENUM('Resume','Certificate','Offer Letter','Report','Other'),
  uploaded_by_user_id FK -> users, upload_date
)

trainings(
  id, title, assigned_to_intern_id FK -> interns, mentor_id FK -> mentors,
  start_date, end_date, status ENUM('Not Started','In Progress','Completed'),
  progress SMALLINT CHECK (0-100)
)

evaluations(
  id, intern_id FK -> interns, mentor_id FK -> mentors,
  technical_rating, communication_rating, problem_solving_rating, overall_rating,
  feedback TEXT
)

notifications(
  id, title, message, recipient ENUM('HR','Mentor','Intern','All'),
  created_by_user_id FK -> users, notification_date,
  status ENUM('Unread','Read')
)

ppo(
  id, intern_id FK -> interns, mentor_id FK -> mentors,
  attendance_pct, training_completion_pct, technical_score, communication_score, overall_score,
  mentor_recommendation ENUM('Yes','No'), hr_recommendation ENUM('Yes','No'),
  status ENUM('Eligible','Not Eligible','Offered')
)

announcements(
  id, title, description, created_by_user_id FK -> users,
  publish_date, expiry_date, priority ENUM('High','Medium','Low'),
  target_audience ENUM('All','HR','Mentor','Intern')
)

certificates(
  id, intern_id FK -> interns, mentor_id FK -> mentors, certificate_name,
  issued_by, issue_date, expiry_date, status ENUM('Active','Expired')
)

-- Reports has no dedicated table: it's a read-only aggregation view/query
-- joining interns + attendance + tasks + trainings + evaluations + ppo,
-- matching the Report shape (attendance %, completedTasks, pendingTasks,
-- trainingProgress %, evaluationScore, ppoStatus).

feedback(id, from_user_id FK -> users, message, created_at)   -- future module, page not yet built in UI
refresh_tokens(id, user_id FK -> users, token_hash, expires_at, revoked)
```

- Foreign keys enforce **mentor ↔ intern**, **intern ↔ task/attendance/meeting/etc.** relationships.
- All tables use a surrogate `id BIGSERIAL`/`UUID` primary key — this replaces
  the frontend's fragile practice of matching rows by field values
  (e.g. `title + date`) to find the "actual index" to edit/delete.
- Flyway migration scripts (`V1__init.sql`, `V2__...`) manage schema versioning.
- Indexes on `interns.mentor_id`, `tasks.assigned_to_intern_id`,
  `attendance.intern_id`, `notifications.recipient`,
  `announcements.target_audience` for query performance and role-filtering.

## 6. Cross-Cutting Concerns

- **CORS**: allow the Vite frontend origin (`http://localhost:5173` in dev).
- **Global exception handler** (`@ControllerAdvice`) → consistent `ApiResponse` error shape (replaces silent frontend mock failures).
- **Pagination & filtering**: list endpoints (interns, tasks, attendance, documents, etc.) accept `page`, `size`, `sort`, and filter query params (`status`, `mentorId`, `dateRange`).
- **File storage**: documents/certificates uploads → local disk (dev) or S3-compatible bucket (prod), storing only the URL in Postgres.
- **Auditing**: `created_at`/`updated_at` via `@CreatedDate`/`@LastModifiedDate` (Spring Data auditing) on all entities.

## 7. Suggested Delivery Order

1. `auth` + `user` modules (JWT login, roles) — unblocks everything else.
2. `mentor`, `intern` (core relationship).
3. `task`, `attendance`, `meeting` (daily-use modules, matches dashboards).
4. `evaluation`, `training`, `document`, `certificate`.
5. `announcement`, `notification`, `ppo`, `feedback`.
6. `reports` + role-specific `dashboard` aggregation endpoints last, once
   underlying data exists to aggregate.

## 8. Step-by-Step: Creating the New Spring Boot Project

### Step 0 – Prerequisite Packages/Tools on Windows

Install these before generating the project (PowerShell, run as Administrator
where noted). Using **winget** (built into Windows 10/11) is the quickest path;
**Chocolatey** commands are given as an alternative.

| Tool | Why it's needed | winget install command |
|---|---|---|
| **JDK 17** (Eclipse Temurin/Adoptium) | Compile & run Spring Boot 3.x | `winget install EclipseAdoptium.Temurin.17.JDK` |
| **Apache Maven** | Build tool (skip if using the wrapper `mvnw.cmd`) | `winget install Apache.Maven` |
| **Git** | Version control, cloning repos | `winget install Git.Git` |
| **PostgreSQL** | Local database server (skip if using Docker) | `winget install PostgreSQL.PostgreSQL` |
| **Docker Desktop** | Run Postgres/app in containers (recommended) | `winget install Docker.DockerDesktop` |
| **IntelliJ IDEA Community** (or VS Code + Java/Spring extensions) | IDE with Spring Boot support | `winget install JetBrains.IntelliJIDEA.Community` |
| **Postman** (optional) | Manually test REST APIs | `winget install Postman.Postman` |
| **DBeaver** (optional) | GUI for browsing the Postgres database | `winget install dbeaver.dbeaver` |

Chocolatey equivalents (if you prefer `choco` over `winget`):
```powershell
choco install temurin17 maven git postgresql docker-desktop -y
```

#### Verify installations
```powershell
java -version        # should print 17.x
mvn -version          # should print Maven 3.9+ and point to the JDK above
git --version
docker --version       # if using Docker for Postgres
psql --version         # if PostgreSQL installed natively (not via Docker)
```

#### Set `JAVA_HOME` (if not set automatically by the installer)
```powershell
[Environment]::SetEnvironmentVariable(
  "JAVA_HOME",
  "C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot",
  "User"
)
# Then reopen PowerShell and confirm:
echo $env:JAVA_HOME
```

> Note: You do **not** need to install Maven separately if you generate the
> project with the Maven Wrapper included (`mvnw.cmd` on Windows) — Spring
> Initializr includes it by default, and `./mvnw` in later steps becomes
> `mvnw.cmd` on Windows (e.g. `mvnw.cmd clean install`).

### Step 1 – Generate the project (Spring Initializr)
Use [start.spring.io](https://start.spring.io) or the CLI:

```bash
curl https://start.spring.io/starter.zip \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=3.3.4 \
  -d baseDir=intern-management-backend \
  -d groupId=com.nexturn \
  -d artifactId=intern-management-backend \
  -d name=intern-management-backend \
  -d packageName=com.nexturn.internmanagement \
  -d javaVersion=17 \
  -d dependencies=web,data-jpa,postgresql,validation,security,flyway,lombok,devtools \
  -o intern-management-backend.zip

unzip intern-management-backend.zip -d intern-management-backend
cd intern-management-backend
```

Selected starters: **Spring Web, Spring Data JPA, PostgreSQL Driver,
Validation, Spring Security, Flyway Migration, Lombok, DevTools**.
Add `springdoc-openapi-starter-webmvc-ui`, `jjwt` (or `spring-security-oauth2-jose`
for JWT), and `mapstruct` manually to `pom.xml` afterward.

### Step 2 – Open and verify the project
```bash
cd intern-management-backend
./mvnw clean install
./mvnw spring-boot:run
```
Confirm it starts on `http://localhost:8080` with the default Spring Boot banner.

### Step 3 – Set up PostgreSQL
```bash
# via Docker (recommended for local dev)
docker run --name intern-mgmt-db -e POSTGRES_DB=intern_management \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d postgres:16
```

### Step 4 – Configure `application.yml`
Replace `src/main/resources/application.properties` with:
```yaml
spring:
  application:
    name: intern-management-backend
  datasource:
    url: jdbc:postgresql://localhost:5432/intern_management
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: validate      # Flyway owns schema, JPA only validates
    properties:
      hibernate:
        format_sql: true
  flyway:
    enabled: true
    locations: classpath:db/migration

server:
  port: 8080

jwt:
  secret: ${JWT_SECRET:change-me-in-prod}
  access-token-expiry-ms: 900000      # 15 min
  refresh-token-expiry-ms: 604800000  # 7 days
```

### Step 5 – Create the package structure
Inside `src/main/java/com/nexturn/internmanagement/`, create the packages
listed in **Section 2** (`config`, `security`, `common`, `auth`, `user`,
`mentor`, `intern`, `task`, ... `feedback`).

### Step 6 – Write the first Flyway migration
`src/main/resources/db/migration/V1__init_users.sql`:
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN','MENTOR','INTERN')),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
```
Add subsequent `V2__...`, `V3__...` scripts per domain table (mentors, interns,
tasks, etc.) as each module is built.

### Step 7 – Implement Security (JWT)
1. `User` entity implementing `UserDetails` (or a separate `UserPrincipal`).
2. `JwtService` — generate/parse/validate tokens (signing key from `jwt.secret`).
3. `JwtAuthFilter extends OncePerRequestFilter` — reads `Authorization: Bearer <token>`, sets `SecurityContextHolder`.
4. `SecurityConfig` — `SecurityFilterChain` bean: permit `/api/auth/**` and
   Swagger paths, require auth + role checks on everything else; register
   `JwtAuthFilter` before `UsernamePasswordAuthenticationFilter`.
5. `AuthController` — `/api/auth/login`, `/refresh`, `/logout`, `/me`.

### Step 8 – Build the first domain module end-to-end (`auth` → `mentor`/`intern`)
For each module: `Entity` → `Repository` (`extends JpaRepository`) →
`Dto` (request/response) → `Mapper` (MapStruct) → `Service`/`ServiceImpl` →
`Controller` (`@RestController`, `@RequestMapping("/api/<domain>")`).
Repeat this pattern for every domain in Section 4's table.

### Step 9 – Add global exception handling
`common/GlobalExceptionHandler.java` with `@RestControllerAdvice`, handling
`MethodArgumentNotValidException`, `EntityNotFoundException`,
`AccessDeniedException` → consistent JSON error response shape.

### Step 10 – Add OpenAPI/Swagger
Add dependency `springdoc-openapi-starter-webmvc-ui`; browse
`http://localhost:8080/swagger-ui.html` to explore/test all endpoints as they're built.

### Step 11 – Enable CORS for the frontend
```java
@Bean
CorsConfigurationSource corsConfigurationSource() {
  CorsConfiguration config = new CorsConfiguration();
  config.setAllowedOrigins(List.of("http://localhost:5173"));
  config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
  config.setAllowedHeaders(List.of("*"));
  UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
  source.registerCorsConfiguration("/**", config);
  return source;
}
```

### Step 12 – Write tests
- Unit tests per service (Mockito).
- `@SpringBootTest` + Testcontainers (Postgres) for repository/integration tests.
- `@WebMvcTest` for controller-layer tests with mocked services.

### Step 13 – Seed data & run locally end-to-end
Add a `CommandLineRunner`/Flyway `V2__seed_admin_user.sql` to insert one
`ADMIN` user, then log in via `/api/auth/login`, copy the JWT, and call a
protected endpoint (e.g. `/api/interns`) with `Authorization: Bearer <token>`
to confirm the full auth flow works before wiring the frontend.

### Step 14 – Connect the React frontend
Replace `App.tsx`'s mock `useState` calls with API calls (e.g. Axios/React
Query) pointing at `http://localhost:8080/api/...`, starting with
`/api/auth/login` in `Login.tsx` and `AuthContext`.

### Step 15 – Containerize & deploy (optional, later)
Add a `Dockerfile` (multi-stage Maven build → JRE runtime image) and a
`docker-compose.yml` combining the Spring Boot app + PostgreSQL for one-command
local/prod startup.
