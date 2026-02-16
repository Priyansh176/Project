import { Router } from 'express';
import { query } from '../config/db.js';
import { authMiddleware, requireStudent } from '../middleware/auth.js';
const router = Router();
// GET /allotments/me – current student's allotment results with rank info
router.get('/me', authMiddleware, requireStudent, async (_req, res) => {
    try {
        const locals = res.locals;
        const rollNo = locals.user.sub;
        // Get enrollments (allotted + waitlisted)
        const enrollments = await query(`
      SELECT 
        e.COURSE_Course_ID,
        e.Status,
        e.Enrollment_Date,
        c.Course_Name,
        c.Credits,
        c.Faculty,
        c.Slot,
        c.Capacity
      FROM ENROLLMENT e
      JOIN COURSE c ON e.COURSE_Course_ID = c.Course_ID
      WHERE e.STUDENT_Roll_No = ?
      ORDER BY e.Enrollment_Date DESC
    `, [rollNo]);
        // Get original preferences for rank info
        const preferences = await query(`
      SELECT COURSE_Course_ID, \`Rank\`
      FROM PREFERENCE
      WHERE STUDENT_Roll_No = ?
      ORDER BY \`Rank\`
    `, [rollNo]);
        const prefRankMap = new Map(preferences.map((p) => [p.COURSE_Course_ID, p.Rank]));
        const allotted = enrollments
            .filter((e) => e.Status === 'allotted')
            .map((e) => ({
            course_id: e.COURSE_Course_ID,
            course_name: e.Course_Name,
            credits: e.Credits,
            faculty: e.Faculty,
            slot: e.Slot,
            preference_rank: prefRankMap.get(e.COURSE_Course_ID) ?? null,
            capacity: e.Capacity,
        }));
        const waitlisted = enrollments
            .filter((e) => e.Status === 'waitlisted')
            .map((e) => ({
            course_id: e.COURSE_Course_ID,
            course_name: e.Course_Name,
            credits: e.Credits,
            faculty: e.Faculty,
            slot: e.Slot,
            preference_rank: prefRankMap.get(e.COURSE_Course_ID) ?? null,
            capacity: e.Capacity,
        }));
        res.json({
            allotted,
            waitlisted,
            summary: {
                total_allotted: allotted.length,
                total_credits: allotted.reduce((sum, a) => sum + (a.credits ?? 0), 0),
                total_waitlisted: waitlisted.length,
            },
        });
    }
    catch (err) {
        console.error('Get allotments error:', err);
        res.status(500).json({ error: 'Failed to fetch allotments' });
    }
});
export default router;
//# sourceMappingURL=allotments.js.map