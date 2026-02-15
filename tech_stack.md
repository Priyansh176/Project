# Tech Stack Document  
## College Course Allotment Portal  

Version: 1.0  
Last Updated: 2026  

---

## 1. Architecture Overview

The system will follow a modern full-stack web architecture:

- Frontend: Client-side rendered web application  
- Backend: REST API server  
- Database: Relational database  
- Authentication: JWT-based secure authentication  
- Hosting: Cloud-based deployment  

---

## 2. Frontend Stack

Framework: Next.js (React + TypeScript)  
UI: Tailwind CSS + shadcn/ui  
State Management: TanStack Query  
Forms: React Hook Form + Zod  

Reasons:
- Scalable and industry standard
- Type safety
- Good performance

---

## 3. Backend Stack

Runtime: Node.js  
Framework: NestJS (recommended) or Express.js  
Language: TypeScript  
API Style: REST  

---

## 4. Database

Primary Database: PostgreSQL  
ORM: Prisma  

Reasons:
- Strong relational support
- Easy migrations
- Type-safe queries

---

## 5. Authentication

Method: JWT (Access + Refresh Tokens)  
Password Hashing: bcrypt  
Role-Based Access Control: Student / Admin / Faculty  

---

## 6. Allotment Engine

Dedicated backend module.

Features:
- CGPA-based sorting
- Preference ranking
- Seat capacity checks
- Waitlist generation
- Conflict detection (future)

Testing: Jest unit tests.

---

## 7. Notifications

Email: Nodemailer + SendGrid / AWS SES  
Optional SMS: Twilio  

---

## 8. Hosting & Deployment

Frontend: Vercel / Render  
Backend: Render / Railway / AWS EC2  
Database: Supabase / Neon / AWS RDS  

CI/CD: GitHub Actions  

---

## 9. Testing

Backend: Jest  
Frontend: Playwright  
Load Testing: k6  

---

## 10. Monitoring

Logging: Winston  
Error Tracking: Sentry  

---

## 11. Folder Structure

/frontend  
/backend  
/prisma  
/docs  

---

## 12. Future Improvements

- Redis caching
- WebSockets for live updates
- AI recommendation module
- Horizontal scaling

---

## Summary

Frontend: Next.js + Tailwind  
Backend: Node.js + NestJS  
Database: PostgreSQL + Prisma  
Auth: JWT + bcrypt  
Hosting: Vercel / Render / AWS  

End of tech_stack.md
