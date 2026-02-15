# College Course Allotment Portal – Todo List

Features broken down into steps from:
- **tech_stack.md** – Architecture, stack, deployment
- **design_doc.md** – UI/UX, pages, components
- **course_allotment_prd.md** – Requirements, schema, flows

---

## Phase 1 – Foundation & Setup

### 1.1 Project structure & tooling
- [ ] Create `/frontend`, `/backend`, `/prisma`, `/docs` folder structure
- [ ] Initialize frontend: Next.js + TypeScript + Tailwind CSS
- [ ] Initialize backend: Node.js + NestJS (or Express) + TypeScript
- [ ] Set up Prisma with PostgreSQL (Supabase/Neon/AWS RDS)
- [ ] Configure ESLint, Prettier, and shared TypeScript config
- [ ] Set up GitHub repo and basic CI (GitHub Actions)

### 1.2 Design system (design_doc.md)
- [ ] Define color palette: Primary gradient (#6366F1 → #8B5CF6), backgrounds (#F5F7FB, #0F172A), success/warning/error
- [ ] Set up typography: Inter or Poppins, heading/body/button weights
- [ ] Implement 8px spacing grid; card padding 16–24px; section spacing 32px
- [ ] Add shadcn/ui and create base components: Sidebar, Header Bar, Cards, Tables, Progress bars, Badges, Modals
- [ ] Support dark + light theme (design constraint)

---

## Phase 2 – Authentication

### 2.1 Auth backend
- [ ] Implement JWT (access + refresh tokens)
- [ ] Password hashing with bcrypt
- [ ] Role-based access: Student / Admin / Faculty
- [ ] `POST /auth/signup` – name, roll_no, email, department, semester, password
- [ ] `POST /auth/login` – roll no/email + password
- [ ] Password reset flow
- [ ] Email verification flow (signup → verify → admin approval → login)

### 2.2 Auth frontend – Login
- [ ] Login page: two-column layout (left: illustration/gradient; right: login card)
- [ ] Fields: Roll No/Email, Password; Login button; Forgot password; Signup link
- [ ] Inline validation and loading spinner
- [ ] Auto redirect by role (student → dashboard, admin → admin dashboard)
- [ ] Handle: invalid password, unapproved student, email not verified

### 2.3 Auth frontend – Signup
- [ ] Signup page: centered card
- [ ] Fields: Full Name, Roll Number, Email, Department dropdown, Semester dropdown, Password, Confirm Password
- [ ] Real-time validation and password strength meter
- [ ] Email verification notice and flow messaging

---

## Phase 3 – Database & Core Models

### 3.1 Prisma schema (PRD §7 + tech_stack)
- [ ] **Students**: id, name, roll_no, email, department, semester, cgpa, password_hash, approval_status, email_verified
- [ ] **Courses**: id, code, name, faculty, credits, capacity, slot
- [ ] **Preferences**: id, student_id, course_id, rank
- [ ] **Allotments**: id, student_id, course_id, status (allotted / waitlisted)
- [ ] **Admins**: id, email, password_hash
- [ ] Run migrations and seed script for dev

---

## Phase 4 – Student Experience

### 4.1 Student dashboard layout (design_doc §5)
- [ ] Sidebar: Dashboard, Available Courses, My Preferences, Allotment Result, Profile, Logout
- [ ] Header: Search, Notifications, Student avatar + name
- [ ] Mobile: Sidebar → Hamburger menu; cards stacked vertically

### 4.2 Dashboard cards
- [ ] Profile Summary card: Name, Roll No, Department, CGPA
- [ ] Allotment Status card: Not Started / Submitted / Allotted
- [ ] Deadline countdown card

### 4.3 Course listing page
- [ ] Table: Course Code, Course Name, Faculty, Credits, Seats Available, Slot, Add Preference
- [ ] Seat availability progress bar per course
- [ ] Filters: department, semester
- [ ] Search course
- [ ] API: list courses with availability; student can view only

### 4.4 Preference ranking page
- [ ] Drag-and-drop ranking list (or up/down on mobile)
- [ ] Edit rank, remove course
- [ ] Submit button; lock after deadline
- [ ] API: save/update preferences (student_id, course_id, rank)

### 4.5 Allotment result page
- [ ] Allotted course card(s)
- [ ] Waitlisted courses with rank info
- [ ] Download PDF option

### 4.6 Student profile page
- [ ] View/edit profile (within allowed fields)
- [ ] Keyboard nav and ARIA labels (accessibility)

---

## Phase 5 – Admin Experience

### 5.1 Admin dashboard layout (design_doc §6)
- [ ] Sidebar: Students, Courses, Allotment, Reports, Settings
- [ ] Dashboard cards: Total Students, Total Courses, Seat Utilization %, Pending Approvals

### 5.2 Student management
- [ ] Table: Name, Roll No, Email, CGPA, Approval Status, Actions (Approve / Reject)
- [ ] Approve/reject students (post email verification)
- [ ] API: list students, update approval status

### 5.3 Course management
- [ ] Add / Edit / Delete course
- [ ] Set seat capacity and assign faculty
- [ ] View enrolled students per course
- [ ] API: CRUD courses

### 5.4 Allotment admin page
- [ ] “Run Allotment” button
- [ ] Preview results before publish
- [ ] Publish results
- [ ] Generate waitlist
- [ ] API: trigger allotment, preview, publish

### 5.5 Reports page
- [ ] Course-wise student list (download)
- [ ] Student allotment report (download)
- [ ] Seat utilization report (download)
- [ ] Export CSV/Excel
- [ ] API: report generation endpoints

### 5.6 Settings (admin)
- [ ] Deadlines configuration (preference submit, allotment publish)
- [ ] Basic system settings as needed

---

## Phase 6 – Allotment Engine (tech_stack §6)

### 6.1 Core logic
- [ ] Dedicated backend module (e.g. `AllotmentService`)
- [ ] CGPA-based sorting (higher CGPA higher priority)
- [ ] Preference ranking: process in rank order per student
- [ ] Seat capacity checks per course
- [ ] Waitlist generation when capacity full
- [ ] (Future) Conflict detection (e.g. slot clash)

### 6.2 Testing
- [ ] Jest unit tests: same CGPA, full capacity, waitlist, edge cases
- [ ] Load testing with k6 (target: allotment &lt; 10s, ~1000 concurrent users)

---

## Phase 7 – Notifications (tech_stack §7 + PRD §5.5)

### 7.1 Email
- [ ] Integrate Nodemailer + SendGrid or AWS SES
- [ ] Allotment result email to students
- [ ] Deadline reminder emails
- [ ] Admin alerts (e.g. allotment complete, errors)
- [ ] Optional: Email verification emails via same provider

### 7.2 Optional SMS
- [ ] Twilio integration for critical reminders (optional)

---

## Phase 8 – Quality & UX

### 8.1 Responsive & accessibility (design_doc §7–8)
- [ ] Mobile: tables → scrollable cards; ranking → up/down buttons
- [ ] Keyboard navigation
- [ ] Color contrast (WCAG)
- [ ] ARIA labels for forms; readable error messages
- [ ] Target: fast load &lt; 2s per page

### 8.2 Reusable components (design_doc §9)
- [ ] AuthCard
- [ ] CourseTable
- [ ] PreferenceRanker
- [ ] DashboardStats
- [ ] NotificationToast

### 8.3 Frontend stack (tech_stack)
- [ ] State: TanStack Query (React Query)
- [ ] Forms: React Hook Form + Zod
- [ ] Ensure type safety end-to-end

---

## Phase 9 – Testing & Security

### 9.1 Testing (tech_stack §9 + PRD §11)
- [ ] Backend: Jest for API and allotment logic
- [ ] Frontend: Playwright for critical flows (login, preference submit, result view)
- [ ] Load testing: k6 for 1000 concurrent users and allotment duration
- [ ] Security: auth tests, bcrypt verification, JWT validation

### 9.2 Monitoring (tech_stack §10)
- [ ] Logging: Winston
- [ ] Error tracking: Sentry
- [ ] Data backup and recovery strategy (PRD NFR)

---

## Phase 10 – Deployment (tech_stack §8)

### 10.1 Hosting
- [ ] Frontend: Vercel or Render
- [ ] Backend: Render, Railway, or AWS EC2
- [ ] Database: Supabase, Neon, or AWS RDS (PostgreSQL)

### 10.2 CI/CD
- [ ] GitHub Actions: lint, test, build
- [ ] Deploy frontend and backend on merge to main (or release branch)
- [ ] Environment variables for API URLs, DB, JWT secrets, email

---

## Phase 11 – Future Improvements (from all three docs)

- [ ] Redis caching
- [ ] WebSockets for live updates
- [ ] Conflict detection (timetable clashes) in allotment
- [ ] Dark mode toggle (design_doc)
- [ ] Course timetable clash visualization
- [ ] Analytics dashboard
- [ ] AI course recommendation module
- [ ] Horizontal scaling
- [ ] Mobile app, ERP integration, multi-college support (PRD)

---

## Summary Checklist

| Phase              | Focus                    |
|--------------------|--------------------------|
| 1                  | Foundation & setup       |
| 2                  | Authentication           |
| 3                  | Database & models        |
| 4                  | Student experience       |
| 5                  | Admin experience         |
| 6                  | Allotment engine         |
| 7                  | Notifications            |
| 8                  | Quality & UX             |
| 9                  | Testing & monitoring     |
| 10                 | Deployment               |
| 11                 | Future improvements      |

*Last updated from tech_stack.md, design_doc.md, course_allotment_prd.md.*
