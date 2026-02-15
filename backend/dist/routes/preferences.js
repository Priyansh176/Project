import { Router } from 'express';
import { query } from '../config/db.js';
import { authMiddleware, requireStudent } from '../middleware/auth.js';
const router = Router();
// GET /preferences – current student's preferences with course details
router.get('/', authMiddleware, requireStudent, async (_req, res) => {
    try {
        const locals = res.locals;
        const rollNo = locals.user.sub;
        const prefs = await query('SELECT STUDENT_Roll_No, COURSE_Course_ID, `Rank` FROM PREFERENCE WHERE STUDENT_Roll_No = ? ORDER BY `Rank`', [rollNo]);
        const result = await Promise.all(prefs.map(async (p) => {
            const courses = await query('SELECT Course_ID, Course_Name, Credits, Faculty, Slot FROM COURSE WHERE Course_ID = ?', [p.COURSE_Course_ID]);
            const c = courses[0];
            return {
                course_id: p.COURSE_Course_ID,
                rank: p.Rank,
                course_name: c?.Course_Name ?? null,
                credits: c?.Credits ?? null,
                faculty: c?.Faculty ?? null,
                slot: c?.Slot ?? null,
            };
        }));
        res.json({ preferences: result });
    }
    catch (err) {
        console.error('Get preferences error:', err);
        res.status(500).json({ error: 'Failed to get preferences' });
    }
});
// PUT /preferences – replace full preference list (array of { course_id, rank })
router.put('/', authMiddleware, requireStudent, async (req, res) => {
    try {
        const locals = res.locals;
        const rollNo = locals.user.sub;
        const body = req.body;
        const list = Array.isArray(body.preferences) ? body.preferences : [];
        const seen = new Set();
        for (const p of list) {
            const id = String(p.course_id).trim();
            if (!id || typeof p.rank !== 'number' || p.rank < 1) {
                res.status(400).json({ error: 'Each preference must have course_id and rank (positive number)' });
                return;
            }
            if (seen.has(id)) {
                res.status(400).json({ error: 'Duplicate course in preferences' });
                return;
            }
            seen.add(id);
        }
        const courseIds = list.map((p) => String(p.course_id).trim());
        if (courseIds.length > 0) {
            const placeholders = courseIds.map(() => '?').join(',');
            const existing = await query(`SELECT Course_ID FROM COURSE WHERE Course_ID IN (${placeholders})`, courseIds);
            const validIds = new Set(existing.map((r) => r.Course_ID));
            for (const id of courseIds) {
                if (!validIds.has(id)) {
                    res.status(400).json({ error: `Invalid course_id: ${id}` });
                    return;
                }
            }
        }
        await query('DELETE FROM PREFERENCE WHERE STUDENT_Roll_No = ?', [rollNo]);
        for (let i = 0; i < list.length; i++) {
            await query('INSERT INTO PREFERENCE (STUDENT_Roll_No, COURSE_Course_ID, `Rank`) VALUES (?, ?, ?)', [rollNo, list[i].course_id.trim(), list[i].rank]);
        }
        res.json({ message: 'Preferences updated', count: list.length });
    }
    catch (err) {
        console.error('Put preferences error:', err);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});
export default router;
//# sourceMappingURL=preferences.js.map