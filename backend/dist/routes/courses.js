import { Router } from 'express';
import pool, { query } from '../config/db.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';
const router = Router();
async function getSeatsAllotted(courseId) {
    const rows = await query("SELECT COUNT(*) AS cnt FROM ENROLLMENT WHERE COURSE_Course_ID = ? AND Status = 'allotted'", [courseId]);
    return rows[0]?.cnt ?? 0;
}
function mapCourse(row, seatsAllotted, departmentName) {
    const seatsAvailable = Math.max(0, row.Capacity - seatsAllotted);
    return {
        course_id: row.Course_ID,
        course_name: row.Course_Name,
        credits: row.Credits,
        department_id: row.Department_ID,
        department_name: departmentName ?? null,
        semester: row.Semester,
        status: row.Status,
        capacity: row.Capacity,
        seats_available: seatsAvailable,
        seats_allotted: seatsAllotted,
        slot: row.Slot,
        faculty: row.Faculty,
        course_type: row.Course_Type,
        elective_slot: row.Elective_Slot,
        max_choices: row.Max_Choices,
    };
}
// GET /courses – list courses (filters by student's semester/dept if authenticated)
router.get('/', async (req, res) => {
    try {
        const dept = req.query.department;
        const sem = req.query.semester;
        let sql = 'SELECT Course_ID, Course_Name, Credits, Department_ID, Semester, Status, Capacity, Slot, Faculty, Course_Type, Elective_Slot, Max_Choices FROM COURSE WHERE Status = ?';
        const params = ['active'];
        // If authenticated, filter by student's semester and department
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const jwt = await import('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET ?? '');
                if (decoded.rollNo) {
                    const student = await query('SELECT Semester, Department_ID FROM STUDENT WHERE Roll_No = ?', [decoded.rollNo]);
                    if (student[0]) {
                        if (student[0].Semester != null) {
                            sql += ' AND Semester = ?';
                            params.push(student[0].Semester);
                        }
                        if (student[0].Department_ID != null) {
                            sql += ' AND Department_ID = ?';
                            params.push(student[0].Department_ID);
                        }
                    }
                }
            }
            catch {
                // Invalid token, proceed without filtering
            }
        }
        // Admin can still use manual filters
        if (dept) {
            sql += ' AND Department_ID = (SELECT Department_ID FROM DEPARTMENT WHERE Department_Name = ?)';
            params.push(dept);
        }
        if (sem !== undefined && sem !== '') {
            sql += ' AND Semester = ?';
            params.push(Number(sem));
        }
        sql += ' ORDER BY Elective_Slot, Course_ID';
        const rows = await query(sql, params);
        const result = await Promise.all(rows.map(async (r) => {
            const allotted = await getSeatsAllotted(r.Course_ID);
            let departmentName = null;
            if (r.Department_ID) {
                const d = await query('SELECT Department_Name FROM DEPARTMENT WHERE Department_ID = ?', [r.Department_ID]);
                if (d.length > 0)
                    departmentName = d[0].Department_Name;
            }
            return mapCourse(r, allotted, departmentName);
        }));
        res.json({ courses: result });
    }
    catch (err) {
        console.error('List courses error:', err);
        res.status(500).json({ error: 'Failed to list courses' });
    }
});
// GET /courses/:courseId – single course with seat availability
router.get('/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const rows = await query('SELECT Course_ID, Course_Name, Credits, Department_ID, Semester, Status, Capacity, Slot, Faculty, Course_Type, Elective_Slot, Max_Choices FROM COURSE WHERE Course_ID = ?', [courseId]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        const r = rows[0];
        const allotted = await getSeatsAllotted(r.Course_ID);
        let departmentName = null;
        if (r.Department_ID) {
            const d = await query('SELECT Department_Name FROM DEPARTMENT WHERE Department_ID = ?', [r.Department_ID]);
            if (d.length > 0)
                departmentName = d[0].Department_Name;
        }
        res.json(mapCourse(r, allotted, departmentName));
    }
    catch (err) {
        console.error('Get course error:', err);
        res.status(500).json({ error: 'Failed to get course' });
    }
});
// POST /courses – add course (admin only)
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { course_id, course_name, credits, department_id, semester, capacity, slot, faculty, course_type, elective_slot, max_choices } = req.body;
        if (!course_id || !course_name || typeof credits !== 'number' || capacity == null) {
            res.status(400).json({ error: 'Required: course_id, course_name, credits, capacity' });
            return;
        }
        const id = String(course_id).trim();
        const existing = await query('SELECT Course_ID FROM COURSE WHERE Course_ID = ?', [id]);
        if (existing.length > 0) {
            res.status(409).json({ error: 'Course ID already exists' });
            return;
        }
        const courseType = course_type === 'elective' ? 'elective' : 'core';
        const electiveSlot = courseType === 'elective' && elective_slot ? String(elective_slot) : null;
        const maxChoices = courseType === 'elective' && max_choices != null ? Number(max_choices) : null;
        await query(`INSERT INTO COURSE (Course_ID, Course_Name, Credits, Department_ID, Semester, Status, Capacity, Slot, Faculty, Course_Type, Elective_Slot, Max_Choices)
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)`, [
            id,
            String(course_name),
            Number(credits),
            department_id != null ? Number(department_id) : null,
            semester != null ? Number(semester) : null,
            Number(capacity),
            slot != null ? String(slot) : 'TBA',
            faculty != null ? String(faculty) : 'TBA',
            courseType,
            electiveSlot,
            maxChoices,
        ]);
        res.status(201).json({ message: 'Course created', course_id: id });
    }
    catch (err) {
        console.error('Create course error:', err);
        res.status(500).json({ error: 'Failed to create course' });
    }
});
// PATCH /courses/:courseId – edit course (admin only)
router.patch('/:courseId', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { courseId } = req.params;
        const { course_name, credits, department_id, semester, capacity, slot, faculty, status, course_type, elective_slot, max_choices } = req.body;
        const rows = await query('SELECT Course_ID FROM COURSE WHERE Course_ID = ?', [courseId]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        const updates = [];
        const params = [];
        if (course_name !== undefined) {
            updates.push('Course_Name = ?');
            params.push(course_name);
        }
        if (credits !== undefined) {
            updates.push('Credits = ?');
            params.push(Number(credits));
        }
        if (department_id !== undefined) {
            updates.push('Department_ID = ?');
            params.push(department_id == null ? null : Number(department_id));
        }
        if (semester !== undefined) {
            updates.push('Semester = ?');
            params.push(semester == null ? null : Number(semester));
        }
        if (capacity !== undefined) {
            updates.push('Capacity = ?');
            params.push(Number(capacity));
        }
        if (slot !== undefined) {
            updates.push('Slot = ?');
            params.push(slot);
        }
        if (faculty !== undefined) {
            updates.push('Faculty = ?');
            params.push(faculty);
        }
        if (status !== undefined && ['active', 'inactive', 'archived'].includes(String(status))) {
            updates.push('Status = ?');
            params.push(status);
        }
        if (course_type !== undefined && ['core', 'elective'].includes(String(course_type))) {
            updates.push('Course_Type = ?');
            params.push(course_type);
        }
        if (elective_slot !== undefined) {
            updates.push('Elective_Slot = ?');
            params.push(elective_slot || null);
        }
        if (max_choices !== undefined) {
            updates.push('Max_Choices = ?');
            params.push(max_choices != null ? Number(max_choices) : null);
        }
        if (updates.length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }
        params.push(courseId);
        await query(`UPDATE COURSE SET ${updates.join(', ')} WHERE Course_ID = ?`, params);
        res.json({ message: 'Course updated' });
    }
    catch (err) {
        console.error('Update course error:', err);
        res.status(500).json({ error: 'Failed to update course' });
    }
});
// DELETE /courses/:courseId – delete course (admin only; FK cascade will clean ENROLLMENT, PREFERENCE, ADM_IN_ACCESS)
router.delete('/:courseId', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { courseId } = req.params;
        const [header] = await pool.execute('DELETE FROM COURSE WHERE Course_ID = ?', [courseId]);
        if (header.affectedRows === 0) {
            res.status(404).json({ error: 'Course not found' });
            return;
        }
        res.json({ message: 'Course deleted' });
    }
    catch (err) {
        console.error('Delete course error:', err);
        res.status(500).json({ error: 'Failed to delete course' });
    }
});
export default router;
//# sourceMappingURL=courses.js.map