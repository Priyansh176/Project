import { Router, Request, Response } from 'express';
import { query } from '../config/db.js';
import { authMiddleware, requireStudent, type AuthLocals } from '../middleware/auth.js';

const router = Router();

interface EnrollmentRow {
  COURSE_Course_ID: string;
  Status: 'allotted' | 'waitlisted';
  Enrollment_Date: string;
  Course_Name: string;
  Credits: number;
  Faculty: string;
  Slot: string;
  Capacity: number;
  Course_Type?: string;
  Elective_Slot?: string | null;
  Max_Choices?: number | null;
}

interface PrefRow {
  COURSE_Course_ID: string;
  Rank: number;
}

// GET /allotments/me – current student's allotment results with rank info
router.get('/me', authMiddleware, requireStudent, async (_req: Request, res: Response): Promise<void> => {
  try {
    const locals = (res as Response & { locals: AuthLocals }).locals;
    const rollNo = locals.user.sub;

    // Get enrollments (allotted + waitlisted)
    const enrollments = await query<EnrollmentRow[]>(`
      SELECT 
        e.COURSE_Course_ID,
        e.Status,
        e.Enrollment_Date,
        c.Course_Name,
        c.Credits,
        c.Faculty,
        c.Slot,
        c.Capacity,
        c.Course_Type,
        c.Elective_Slot,
        c.Max_Choices
      FROM ENROLLMENT e
      JOIN COURSE c ON e.COURSE_Course_ID = c.Course_ID
      WHERE e.STUDENT_Roll_No = ?
      ORDER BY e.Enrollment_Date DESC
    `, [rollNo]);

    // Get original preferences for rank info
    const preferences = await query<PrefRow[]>(`
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
        course_type: e.Course_Type ?? 'core',
        elective_slot: e.Elective_Slot ?? null,
        max_choices: e.Max_Choices ?? null,
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
        course_type: e.Course_Type ?? 'core',
        elective_slot: e.Elective_Slot ?? null,
        max_choices: e.Max_Choices ?? null,
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
  } catch (err) {
    console.error('Get allotments error:', err);
    res.status(500).json({ error: 'Failed to fetch allotments' });
  }
});

export default router;
