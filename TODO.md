# College Course Allotment Portal – Todo List

This file breaks down features from the PRD, design doc, and tech stack into actionable implementation steps.

> **STATUS:** Phase 2 Development Started (Phase 1 MVP Complete ✅)

---

## Phase 1 – MVP (COMPLETE)

### 1. Project Setup & Infrastructure

- [x] **1.1** Create repo structure: `/frontend`, `/backend`, `/docs`
- [x] **1.2** Initialize frontend: React + TypeScript + Vite
- [x] **1.3** Add Tailwind CSS and shadcn/ui to frontend
- [x] **1.4** Initialize backend: Node.js + Express + TypeScript
- [x] **1.5** Set up MySQL database (local + connection config)
- [x] **1.6** Add environment variables (.env.example for frontend and backend)
- [x] **1.7** Configure ESLint/Prettier for frontend and backend

---

### 2. Authentication

#### 2.1 Backend Auth

- [x] **2.1.1** Create `Students` table (id, name, roll_no, email, department, semester, cgpa, password_hash)
- [x] **2.1.2** Create `Admins` table (id, email, password_hash)
- [x] **2.1.3** Implement bcrypt password hashing utility
- [x] **2.1.4** Implement JWT access + refresh token generation/validation
- [x] **2.1.5** POST `/auth/signup` – validate, hash password, insert student, optional email verification
- [x] **2.1.6** POST `/auth/login` – validate credentials, return JWT, role-based response
- [x] **2.1.7** POST `/auth/logout` or blacklist refresh token (if using refresh tokens)
- [x] **2.1.8** POST `/auth/forgot-password` – trigger password reset flow
- [x] **2.1.9** Middleware: verify JWT and attach user/role to request
- [x] **2.1.10** Role-based guards: Student-only and Admin-only routes

#### 2.2 Frontend Auth

- [x] **2.2.1** Design system: set up color palette, typography (Inter/Poppins), 8px spacing grid
- [x] **2.2.2** Build reusable `AuthCard` component
- [x] **2.2.3** Login page: two-column layout (left gradient/illustration, right login card)
- [x] **2.2.4** Login form: Roll No/Email, Password, Login button, Forgot password, Signup link
- [x] **2.2.5** Inline validation and loading spinner on login
- [x] **2.2.6** Signup page: Full Name, Roll No, Email, Department, Semester, Password, Confirm Password
- [x] **2.2.7** Real-time validation and password strength meter on signup
- [x] **2.2.8** Store JWT (e.g. httpOnly cookie or secure storage), redirect by role (student/admin)
- [x] **2.2.9** Handle edge cases: invalid password, unapproved student, email not verified (error messages)
- [x] **2.2.10** Protected route wrapper – redirect unauthenticated users to login

---

### 3. Course Management (Backend)

- [x] **3.1** Create `Courses` table (id, code, name, faculty, credits, capacity, slot) — now COURSE table
- [x] **3.2** GET `/courses` – list courses with optional filters (department, semester)
- [x] **3.3** GET `/courses/:id` – single course with seat availability
- [x] **3.4** Admin: POST `/courses` – add course (validate, insert)
- [x] **3.5** Admin: PATCH `/courses/:id` – edit course
- [x] **3.6** Admin: DELETE `/courses/:id` – delete course (consider constraints)
- [x] **3.7** Compute and expose “seats available” from capacity and allotments

---

### 4. Course Listing (Student Frontend)

- [x] **4.1** Student dashboard layout: Sidebar (Dashboard, Available Courses, My Preferences, Allotment Result, Profile, Logout)
- [x] **4.2** Header bar: Search, Notifications placeholder, Student avatar + name
- [x] **4.3** Dashboard cards: Profile Summary (name, roll no, department, CGPA), Allotment Status, Deadline countdown placeholder
- [x] **4.4** Course listing page: table with columns – Course Code, Name, Faculty, Credits, Seats Available, Slot, Add Preference
- [x] **4.5** Seat availability progress bar component
- [x] **4.6** Filters: department, semester dropdowns
- [x] **4.7** Search course (client or API-backed)
- [x] **4.8** “Add to preferences” action from course list (navigate or open modal)

---

### 5. Preference Selection

#### 5.1 Backend

- [x] **5.1.1** Create `Preferences` table (id, student_id, course_id, rank) — now PREFERENCE table
- [x] **5.1.2** GET `/preferences` – current user’s preferences with course details
- [x] **5.1.3** POST/PUT `/preferences` – submit or replace ranked list (validate deadline, no duplicates, valid course ids)
- [ ] **5.1.4** Validate preference window (configurable deadline) before allowing submit/edit

#### 5.2 Frontend

- [x] **5.2.1** “My Preferences” page with ranked list
- [x] **5.2.2** Drag-and-drop ranking component (e.g. PreferenceRanker) — up/down buttons for reorder
- [x] **5.2.3** Edit rank, remove course from list
- [x] **5.2.4** Submit button – call API, show success/error (auto-save on reorder/remove)
- [x] **5.2.5** Lock or disable editing after deadline (use deadline from API or config)

---

### 6. Basic Allotment Engine

- [x] **6.1** Create `Allotments` table (id, student_id, course_id, status e.g. allotted/waitlisted) — ENROLLMENT table (exists)
- [x] **6.2** Allotment module: load all preferences and student CGPAs
- [x] **6.3** Sort students by CGPA (descending) for priority
- [x] **6.4** For each student in order: try to allot courses in preference rank order
- [x] **6.5** Enforce seat capacity per course; mark overflow as waitlist
- [x] **6.6** Write allotment and waitlist results to `Allotments` table
- [x] **6.7** Admin-only endpoint: POST `/allotment/run` – trigger allotment run
- [x] **6.8** Unit tests (Jest): same CGPA, full capacity, multiple preferences, waitlist logic

---

### 7. Allotment Result (Student Frontend)

- [x] **7.1** GET `/allotments/me` or `/students/me/allotments` – current student's allotment result
- [x] **7.2** Allotment Result page: allotted course card(s), waitlisted courses, rank info
- [ ] **7.3** Optional: Download PDF for allotment result

---

### 8. Admin – Basic Flow

- [x] **8.1** Admin login and redirect to admin dashboard
- [x] **8.2** Admin layout: Sidebar – Students, Courses, Allotment (Reports/Settings Phase 2)
- [x] **8.3** Dashboard cards: Total Students, Total Courses, Seat Utilization %, Allotment summary
- [x] **8.4** Student management: table – Name, Roll No, Email, CGPA, Approval Status, Actions (Approve/Reject)
- [x] **8.5** Backend: student approval flag and PATCH `/admin/students/:id/approve` 
- [x] **8.6** Course management page: view courses, capacity, faculty, enrollment tracking
- [x] **8.7** Allotment page: "Run Allotment" button, results preview, "Publish results"

---

## Phase 2 (CURRENT FOCUS)

### 9. Admin Dashboard Completion

- [x] **9.1** Wire dashboard stats to real API (total students, courses, seat utilization, pending approvals)
- [x] **9.2** Pagination and search on student and course tables
- [x] **9.3** View enrolled students per course from course management

---

### 10. Notifications

- [ ] **10.1** Backend: integrate Nodemailer + SendGrid or AWS SES
- [ ] **10.2** Email on allotment result (allotted + waitlist) to each student
- [ ] **10.3** Deadline reminder emails (e.g. 24h before preference deadline)
- [ ] **10.4** Admin alerts (e.g. allotment completed, errors)
- [ ] **10.5** Frontend: notification area in header (list recent notifications if API exists)

---

### 11. Waitlist System

- [ ] **11.1** Expose waitlist in API and student Allotment Result page (already in basic allotment; ensure UI shows it)
- [ ] **11.2** Admin: view waitlist per course; optional “promote from waitlist” if seats free up
- [ ] **11.3** Optional: email when moved from waitlist to allotted

---

## Phase 3 (BACKLOG)

### 12. Conflict Detection

- [ ] **12.1** Define “slot” or timetable model (e.g. slot IDs per course)
- [ ] **12.2** During allotment, reject or skip preference if it would create a slot clash for the student
- [ ] **12.3** Unit tests: two preferences same slot, only one allotted
- [ ] **12.4** Design: course timetable clash visualization (design doc future improvement)

---

### 13. Reports

- [ ] **13.1** GET `/reports/course-wise-students` – course-wise student list (export CSV/Excel)
- [ ] **13.2** GET `/reports/student-allotments` – all students and their allotments
- [ ] **13.3** GET `/reports/seat-utilization` – per-course utilization %
- [ ] **13.4** Reports page in admin: download buttons for each report (CSV/Excel)
- [ ] **13.5** Use a library (e.g. exceljs) for Excel export if needed

---

### 14. Analytics Dashboard & Performance

- [ ] **14.1** Analytics dashboard: charts for seat utilization, applications per course, etc.
- [ ] **14.2** Ensure allotment process completes in &lt;10 seconds (optimize queries, batch inserts)
- [ ] **14.3** Load testing with k6 for ~1000 concurrent users
- [ ] **14.4** Frontend: lazy loading, code splitting; aim &lt;2s load per page

---

---

## Cross-Cutting & Polish (BACKLOG)

### 15. Design System & Responsive

- [ ] **15.1** Implement sidebar → hamburger menu on mobile
- [ ] **15.2** Tables → scrollable or card layout on small screens
- [ ] **15.3** Preference ranking: up/down buttons on mobile (alternative to drag-and-drop)
- [ ] **15.4** Dark + light theme (design constraint): theme toggle and CSS variables
- [ ] **15.5** Accessibility: keyboard navigation, ARIA labels, color contrast, readable errors

---

### 16. Testing & Quality

- [ ] **16.1** Backend: Jest unit tests for allotment engine and critical API routes
- [ ] **16.2** Frontend: Playwright e2e for login, signup, preference submit, view result
- [ ] **16.3** Edge cases: same CGPA, full capacity, slot clashes, invalid tokens
- [ ] **16.4** Security: auth tests, bcrypt verification, JWT expiry

---

### 17. DevOps & Deployment

- [ ] **17.1** Database: migrations (e.g. Knex/TypeORM) for all tables
- [ ] **17.2** CI/CD: GitHub Actions – lint, test, build frontend and backend
- [ ] **17.3** Deploy frontend to Vercel/Render; backend to Render/Railway/AWS
- [ ] **17.4** Database: Supabase/Neon/AWS RDS – configure and connect
- [ ] **17.5** Logging: Winston in backend; optional error tracking (Sentry)
- [ ] **17.6** Data backup and recovery procedure (document or automate)

---

## Reference

- **PRD:** `course_allotment_prd.md` – scope, user flows, schema, phases
- **Design:** `design_doc.md` – UI/UX, components, pages, flows
- **Tech:** `tech_stack.md` – stack, folder structure, testing, hosting

---

*Last updated: Feb 2026*
