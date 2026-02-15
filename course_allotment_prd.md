# Product Requirements Document (PRD)

## Product: College Course Allotment Portal

Version: 1.0\
Owner: Development Team\
Date: 2026

---

## 1. Product Overview

The Course Allotment Portal is a web-based system that allows college students to register, log in, view available courses, submit ranked course preferences, and receive automated course allotments based on defined rules. The system also provides administrative tools for managing students, courses, and allotment processes.

### Problem Statement

Manual course registration processes lead to errors, lack of transparency, overbooking, and administrative overhead.

### Objectives

- Automate course selection and allotment
- Prevent seat overflow and timetable clashes
- Provide transparent allocation results
- Reduce administrative workload

---

## 2. Stakeholders

- Students
- College Administration
- Faculty Members

---

## 3. User Personas

### Student

Needs a simple portal to select and track course allotments.

### Admin

Needs tools to manage courses, students, and run allotment.

### Faculty

Needs access to student enrollment lists.

---

## 4. Scope

### In Scope

- Student signup/login
- Course listing
- Preference selection
- Automated allotment
- Admin dashboard
- Notifications

### Out of Scope

- Payment system
- Mobile app (initial version)
- ERP integration
- AI recommendations

---

## 5. Functional Requirements

### 5.1 Authentication

- Student signup with roll number and email
- Login/logout
- Password reset
- Admin login
- Email verification

### 5.2 Course Management

Admin can:

- Add, edit, delete courses
- Set seat capacity
- Assign faculty

Students can:

- View courses
- Filter courses by department, semester

### 5.3 Course Selection

- Students select and rank preferences
- System shows seat availability
- Edit selections before deadline

### 5.4 Course Allotment

Admin runs allotment process based on CGPA priority.

System ensures:

- Seat capacity respected
- Waitlist creation

### 5.5 Notifications

- Email notifications for allotment results
- Deadline reminders
- Admin alerts

### 5.6 Reports

Admin can generate:

- Course-wise student list
- Student allotment report
- Seat utilization report
- Export CSV/Excel

---

## 6. Non-Functional Requirements

- Secure authentication (bcrypt hashing)
- Handle at least 1000 concurrent users
- Mobile responsive UI
- Allotment process completes under 10 seconds
- Data backup and recovery

---

## 7. Database Schema

### Students

- id
- name
- roll\_no
- email
- department
- semester
- cgpa
- password\_hash

### Courses

- id
- code
- name
- faculty
- credits
- capacity
- slot

### Preferences

- id
- student\_id
- course\_id
- rank

### Allotments

- id
- student\_id
- course\_id
- status

### Admins

- id
- email
- password\_hash

---

## 8. User Flow

### Student

Signup → Login → View Courses → Rank Preferences → Submit → Check Allotment

### Admin

Login → Manage Courses → Approve Students → Run Allotment → Publish Results

---

## 9. Tech Stack (Suggested)

Frontend: React.js\
Backend: Node.js + Express\
Database: MySQL\
Authentication: JWT\
Hosting: AWS / Render / Railway

---

## 10. Development Plan

### Phase 1 – MVP

- Authentication
- Course listing
- Preference selection
- Basic allotment

### Phase 2

- Admin dashboard
- Notifications
- Waitlist system

### Phase 3

- Conflict detection
- Analytics dashboard
- Performance optimization

---

## 11. Testing Plan

- Unit testing for allotment logic
- Load testing with simulated students
- Edge case testing (same CGPA, full capacity, clashes)
- Security testing for authentication

---

## 12. Success Metrics

- Allotment accuracy rate
- System uptime
- Admin processing time reduced
- Student satisfaction feedback

---

## 13. Risks

- Incorrect allotment logic
- Data loss due to server failure
- Admin configuration errors
- High server load during deadlines

---

## 14. Future Enhancements

- Mobile app
- ERP integration
- AI course recommendation
- Multi-college support

---

## 15. Assumptions

- Students have valid college emails
- Course data provided by admin
- CGPA data available for prioritization

---

## 16. Dependencies

- College database for student records
- Email service provider
- Hosting infrastructure

---

## 17. Open Questions

- Which allotment algorithm will be used?
- Can students change preferences after submission?
- Will faculty need grading integration?
- What is maximum expected student load?

---

End of PRD

