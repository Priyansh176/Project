import { Router } from 'express';
import { query } from '../config/db.js';
import { hashPassword, comparePassword, signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/auth.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
// POST /auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, roll_no, email, department, semester, password } = req.body;
        if (!name || !roll_no || !email || !department || typeof semester !== 'number' || !password) {
            res.status(400).json({ error: 'Missing or invalid fields: name, roll_no, email, department, semester, password' });
            return;
        }
        const existing = await query('SELECT id FROM students WHERE email = ? OR roll_no = ?', [email, roll_no]);
        if (existing.length > 0) {
            res.status(409).json({ error: 'Email or roll number already registered' });
            return;
        }
        const password_hash = await hashPassword(String(password));
        await query('INSERT INTO students (name, roll_no, email, department, semester, password_hash) VALUES (?, ?, ?, ?, ?, ?)', [String(name), String(roll_no), String(email), String(department), Number(semester), password_hash]);
        res.status(201).json({ message: 'Signup successful. Await admin approval.' });
    }
    catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Signup failed' });
    }
});
// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { email_or_roll, password } = req.body;
        if (!email_or_roll || !password) {
            res.status(400).json({ error: 'email_or_roll and password required' });
            return;
        }
        const students = await query('SELECT id, name, roll_no, email, department, semester, cgpa, password_hash, approved, email_verified FROM students WHERE email = ? OR roll_no = ?', [String(email_or_roll), String(email_or_roll)]);
        if (students.length > 0) {
            const student = students[0];
            const ok = await comparePassword(String(password), student.password_hash);
            if (!ok) {
                res.status(401).json({ error: 'Invalid password' });
                return;
            }
            if (!student.approved) {
                res.status(403).json({ error: 'Account pending approval' });
                return;
            }
            const access = signAccessToken({ sub: String(student.id), role: 'student' });
            const refresh = signRefreshToken({ sub: String(student.id), role: 'student' });
            res.json({ role: 'student', accessToken: access, refreshToken: refresh, user: { id: student.id, name: student.name, roll_no: student.roll_no, email: student.email, department: student.department, semester: student.semester, cgpa: student.cgpa } });
            return;
        }
        const admins = await query('SELECT id, email, password_hash FROM admins WHERE email = ?', [String(email_or_roll)]);
        if (admins.length > 0) {
            const admin = admins[0];
            const ok = await comparePassword(String(password), admin.password_hash);
            if (!ok) {
                res.status(401).json({ error: 'Invalid password' });
                return;
            }
            const access = signAccessToken({ sub: String(admin.id), role: 'admin' });
            const refresh = signRefreshToken({ sub: String(admin.id), role: 'admin' });
            res.json({ role: 'admin', accessToken: access, refreshToken: refresh, user: { id: admin.id, email: admin.email } });
            return;
        }
        res.status(401).json({ error: 'Invalid email or roll number' });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});
// POST /auth/refresh
router.post('/refresh', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({ error: 'refreshToken required' });
        return;
    }
    try {
        const payload = verifyRefreshToken(refreshToken);
        const access = signAccessToken({ sub: payload.sub, role: payload.role });
        res.json({ accessToken: access });
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});
// POST /auth/logout - client discards tokens; optional server blacklist not implemented here
router.post('/logout', (_req, res) => {
    res.json({ message: 'Logged out' });
});
// GET /auth/me - current user (requires auth)
router.get('/me', authMiddleware, (_req, res) => {
    const locals = res.locals;
    res.json({ user: locals.user });
});
// POST /auth/forgot-password - placeholder; Phase 2: send reset email
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: 'Email required' });
        return;
    }
    res.json({ message: 'If this email is registered, you will receive a reset link.' });
});
export default router;
//# sourceMappingURL=auth.js.map