import { Router } from 'express';
import { query } from '../config/db.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';
import { runAllotment } from '../lib/allotment.js';
const router = Router();
// GET /admin/students – list students with approval status
router.get('/students', authMiddleware, requireAdmin, async (_req, res) => {
    try {
        const students = await query(`
      SELECT Roll_No, Name, Email, CGPA, Status, Department_ID FROM STUDENT
      ORDER BY Roll_No
    `);
        res.json({
            students: students.map((s) => ({
                roll_no: s.Roll_No,
                name: s.Name,
                email: s.Email,
                cgpa: s.CGPA,
                status: s.Status,
                department_id: s.Department_ID,
            })),
        });
    }
    catch (err) {
        console.error('Get students error:', err);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});
// PATCH /admin/students/:rollNo/approve – approve a student
router.patch('/:rollNo/approve', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { rollNo } = req.params;
        // Check student exists
        const students = await query('SELECT Roll_No FROM STUDENT WHERE Roll_No = ?', [rollNo]);
        if (students.length === 0) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        // Update status to active
        await query('UPDATE STUDENT SET Status = ? WHERE Roll_No = ?', ['active', rollNo]);
        res.json({ message: 'Student approved', roll_no: rollNo });
    }
    catch (err) {
        console.error('Approve student error:', err);
        res.status(500).json({ error: 'Failed to approve student' });
    }
});
// PATCH /admin/students/:rollNo/reject – reject a student
router.patch('/:rollNo/reject', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { rollNo } = req.params;
        // Check student exists
        const students = await query('SELECT Roll_No FROM STUDENT WHERE Roll_No = ?', [rollNo]);
        if (students.length === 0) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        // Update status to inactive
        await query('UPDATE STUDENT SET Status = ? WHERE Roll_No = ?', ['inactive', rollNo]);
        res.json({ message: 'Student rejected', roll_no: rollNo });
    }
    catch (err) {
        console.error('Reject student error:', err);
        res.status(500).json({ error: 'Failed to reject student' });
    }
});
// GET /admin/allotment/stats – get overall statistics
router.get('/allotment/stats', authMiddleware, requireAdmin, async (_req, res) => {
    try {
        const studentCount = await query('SELECT COUNT(*) as count FROM STUDENT WHERE Status = "active"');
        const courseCount = await query('SELECT COUNT(*) as count FROM COURSE WHERE Status = "active"');
        const totalCapacity = await query('SELECT SUM(Capacity) as total FROM COURSE WHERE Status = "active"');
        const allottedCount = await query('SELECT COUNT(*) as count FROM ENROLLMENT WHERE Status = "allotted"');
        const waitlistedCount = await query('SELECT COUNT(*) as count FROM ENROLLMENT WHERE Status = "waitlisted"');
        const totalCap = parseInt(totalCapacity[0]?.total ?? '0', 10);
        const allotted = parseInt(allottedCount[0]?.count ?? '0', 10);
        const utilization = totalCap > 0 ? Math.round((allotted / totalCap) * 100) : 0;
        res.json({
            total_students: parseInt(studentCount[0]?.count ?? '0', 10),
            total_courses: parseInt(courseCount[0]?.count ?? '0', 10),
            total_capacity: totalCap,
            seats_allotted: allotted,
            seats_waitlisted: parseInt(waitlistedCount[0]?.count ?? '0', 10),
            utilization_percent: utilization,
        });
    }
    catch (err) {
        console.error('Get allotment stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});
// POST /admin/allotment/run – trigger allotment algorithm
router.post('/allotment/run', authMiddleware, requireAdmin, async (_req, res) => {
    try {
        const result = await runAllotment();
        res.json({
            message: 'Allotment completed',
            result: {
                students_processed: result.student_count,
                total_allotted: result.allotted_count,
                total_waitlisted: result.waitlisted_count,
                timestamp: result.timestamp,
            },
        });
    }
    catch (err) {
        console.error('Allotment run error:', err);
        res.status(500).json({ error: 'Failed to run allotment' });
    }
});
export default router;
//# sourceMappingURL=admin.js.map