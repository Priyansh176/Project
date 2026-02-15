# UI/UX Design Document
**Product:** College Course Allotment Portal  
**Version:** 1.0  
**Reference Style:** Modern Crypto Dashboard UI (Card-based, Minimal, Clean)

---

# 1. Design Goals

## Objectives
- Simple and fast student workflow
- Clear course availability visibility
- Modern dashboard look
- Responsive for mobile and desktop
- Easy admin management tools

## Target Users
- Students
- Admins
- Faculty (view-only)

---

# 2. Global Design System

## Color Palette
| Use | Color |
|------|--------|
| Primary | Indigo/Purple Gradient (#6366F1 → #8B5CF6) |
| Background Light | #F5F7FB |
| Background Dark | #0F172A |
| Card Background | #FFFFFF / #1E293B |
| Success | #22C55E |
| Warning | #F59E0B |
| Error | #EF4444 |

## Typography
- Font: Inter / Poppins
- Headings: Bold
- Body: Regular
- Button text: Medium

## Spacing System
- Base spacing: 8px grid
- Card padding: 16–24px
- Section spacing: 32px

## UI Components
- Sidebar Navigation
- Header Bar
- Cards
- Tables with sorting/filter
- Progress bars
- Badge tags
- Modal dialogs

---

# 3. Login Page Design

## Layout
Two-column layout:
- Left: Illustration / gradient background
- Right: Login card

## Components
- Portal logo + name
- Roll No / Email field
- Password field
- Login button
- Forgot password link
- Signup link
- Error message area

## UX Rules
- Inline validation
- Loading spinner during login
- Auto redirect based on role (student/admin)

## API
POST /auth/login

## Edge Cases
- Invalid password
- Unapproved student
- Email not verified

---

# 4. Signup Page Design

## Layout
Centered signup card

## Fields
- Full Name
- Roll Number
- Email
- Department dropdown
- Semester dropdown
- Password
- Confirm Password

## Features
- Real-time validation
- Password strength meter
- Email verification notice

## Flow
Signup → Email Verify → Admin Approval → Login

## API
POST /auth/signup

---

# 5. Student Dashboard Design

## Layout Structure

### Sidebar
- Dashboard
- Available Courses
- My Preferences
- Allotment Result
- Profile
- Logout

### Header Bar
- Search
- Notifications
- Student avatar + name

---

## Dashboard Cards
1. Profile Summary
   - Name
   - Roll No
   - Department
   - CGPA

2. Allotment Status
   - Not Started / Submitted / Allotted

3. Deadline Countdown

---

## Course Listing Page
Table Columns:
- Course Code
- Course Name
- Faculty
- Credits
- Seats Available
- Slot
- Add Preference Button

Features:
- Seat availability progress bar
- Filters by department/semester
- Search course

---

## Preference Ranking Page
- Drag-and-drop ranking list
- Edit rank
- Remove course
- Submit button
- Lock after deadline

---

## Allotment Result Page
- Allotted course card
- Waitlisted courses
- Rank info
- Download PDF option

---

# 6. Admin Dashboard Design

## Sidebar
- Students
- Courses
- Allotment
- Reports
- Settings

## Dashboard Cards
- Total Students
- Total Courses
- Seat Utilization %
- Pending Approvals

---

## Student Management Page
Table Columns:
- Name
- Roll No
- Email
- CGPA
- Approval Status
- Actions (Approve / Reject)

---

## Course Management Page
Features:
- Add/Edit/Delete course
- Set seat capacity
- Assign faculty
- View enrolled students

---

## Allotment Page
- Run Allotment button
- Preview results
- Publish results
- Generate waitlist

---

## Reports Page
Download options:
- Course-wise student list
- Student allotment report
- Seat utilization report
- Export CSV/Excel

---

# 7. Responsive Design

Mobile Adjustments:
- Sidebar → Hamburger menu
- Tables → Scrollable cards
- Ranking → Up/down buttons
- Cards stacked vertically

---

# 8. Accessibility

- Keyboard navigation support
- Color contrast compliant
- ARIA labels for forms
- Readable error messages

---

# 9. Tech Implementation Notes

Frontend:
- React.js
- Tailwind CSS
- shadcn UI components

Backend:
- Node.js + Express
- JWT authentication

State Management:
- Redux or React Query

Reusable Components:
- AuthCard
- CourseTable
- PreferenceRanker
- DashboardStats
- NotificationToast

---

# 10. UX Flow Summary

Student Flow:
Signup → Login → Dashboard → Select Courses → Submit Preferences → View Result

Admin Flow:
Login → Approve Students → Manage Courses → Run Allotment → Publish Results

---

# 11. Design Constraints

- Max load: 1000 concurrent users
- Mobile friendly
- Dark + Light theme support
- Fast load time (<2s per page)

---

# 12. Future Improvements

- Dark mode toggle
- Course timetable clash visualization
- Analytics dashboard
- AI course recommendation

---

**End of Design Document**