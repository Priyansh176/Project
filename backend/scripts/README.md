# Database setup

1. **Install and start MySQL** (if not already):
   - Install from https://dev.mysql.com/downloads/installer/ (Windows) or use another MySQL-compatible server.
   - Ensure the MySQL service is running.

2. **Configure credentials** in `backend/.env`:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=course_allotment`

3. **Run the setup script** from the `backend` folder:
   ```bash
   cd backend
   npx tsx scripts/setup-db.ts
   ```
   This creates the `course_allotment` database and all tables (students, admins, courses, preferences, allotments).

4. **(Optional) Create an admin user** so you can log in as admin:
   - Generate a password hash (in Node):
     ```bash
     node -e "require('bcrypt').hash('YourPassword', 10).then(h=>console.log(h))"
     ```
   - In MySQL (or any client), run:
     ```sql
     USE course_allotment;
     INSERT INTO admins (email, password_hash) VALUES ('admin@college.edu', '<paste-the-hash>');
     ```
   - Then log in with that email and the password you hashed.

5. **Approve a student** (if you sign up as student): set `approved = 1` for that row in the `students` table, then you can log in.
