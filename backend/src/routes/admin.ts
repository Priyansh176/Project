import { Router, Request, Response } from 'express';
import { query } from '../config/db.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';
import { runAllotment } from '../lib/allotment.js';

const router = Router();

// GET /admin/students – list students with approval status
router.get('/students', authMiddleware, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const students = await query<
      {
        Roll_No: string;
        Name: string;
        Email: string;
        CGPA: number | null;
        Status: string;
        Department_ID: number | null;
      }[]
    >(`
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
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// PATCH /admin/students/:rollNo/approve – approve a student
router.patch('/:rollNo/approve', authMiddleware, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { rollNo } = req.params;

    // Check student exists
    const students = await query<{ Roll_No: string }[]>('SELECT Roll_No FROM STUDENT WHERE Roll_No = ?', [rollNo]);
    if (students.length === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Update status to active
    await query('UPDATE STUDENT SET Status = ? WHERE Roll_No = ?', ['active', rollNo]);

    res.json({ message: 'Student approved', roll_no: rollNo });
  } catch (err) {
    console.error('Approve student error:', err);
    res.status(500).json({ error: 'Failed to approve student' });
  }
});

// PATCH /admin/students/:rollNo/reject – reject a student
router.patch('/:rollNo/reject', authMiddleware, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { rollNo } = req.params;

    // Check student exists
    const students = await query<{ Roll_No: string }[]>('SELECT Roll_No FROM STUDENT WHERE Roll_No = ?', [rollNo]);
    if (students.length === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Update status to inactive
    await query('UPDATE STUDENT SET Status = ? WHERE Roll_No = ?', ['inactive', rollNo]);

    res.json({ message: 'Student rejected', roll_no: rollNo });
  } catch (err) {
    console.error('Reject student error:', err);
    res.status(500).json({ error: 'Failed to reject student' });
  }
});

// DELETE /admin/students/:rollNo – delete a student completely
router.delete('/:rollNo', authMiddleware, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { rollNo } = req.params;

    // Check student exists
    const students = await query<{ Roll_No: string }[]>('SELECT Roll_No FROM STUDENT WHERE Roll_No = ?', [rollNo]);
    if (students.length === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Delete student (cascade deletes preferences and enrollments via foreign keys)
    await query('DELETE FROM STUDENT WHERE Roll_No = ?', [rollNo]);

    res.json({ message: 'Student deleted successfully', roll_no: rollNo });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// PATCH /admin/students/:rollNo/cgpa – update student CGPA
router.patch('/:rollNo/cgpa', authMiddleware, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { rollNo } = req.params;
    const { cgpa } = req.body;

    // Validate CGPA
    if (cgpa === undefined || cgpa === null) {
      res.status(400).json({ error: 'CGPA is required' });
      return;
    }

    const cgpaNum = parseFloat(cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      res.status(400).json({ error: 'CGPA must be between 0 and 10' });
      return;
    }

    // Check student exists
    const students = await query<{ Roll_No: string }[]>('SELECT Roll_No FROM STUDENT WHERE Roll_No = ?', [rollNo]);
    if (students.length === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Update CGPA
    await query('UPDATE STUDENT SET CGPA = ? WHERE Roll_No = ?', [cgpaNum, rollNo]);

    res.json({ message: 'CGPA updated successfully', roll_no: rollNo, cgpa: cgpaNum });
  } catch (err) {
    console.error('Update CGPA error:', err);
    res.status(500).json({ error: 'Failed to update CGPA' });
  }
});

// POST /admin/students/cgpa/bulk – bulk update CGPAs from CSV data
router.post('/students/cgpa/bulk', authMiddleware, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      res.status(400).json({ error: 'Students array is required' });
      return;
    }

    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const student of students) {
      const { roll_no, cgpa } = student;

      if (!roll_no || cgpa === undefined || cgpa === null) {
        failed++;
        errors.push(`Missing roll_no or cgpa for entry: ${JSON.stringify(student)}`);
        continue;
      }

      const cgpaNum = parseFloat(cgpa);
      if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
        failed++;
        errors.push(`Invalid CGPA ${cgpa} for ${roll_no} (must be 0-10)`);
        continue;
      }

      try {
        const result = await query('UPDATE STUDENT SET CGPA = ? WHERE Roll_No = ?', [cgpaNum, roll_no]);
        if ((result as any).affectedRows > 0) {
          updated++;
        } else {
          failed++;
          errors.push(`Student not found: ${roll_no}`);
        }
      } catch (err) {
        failed++;
        errors.push(`Failed to update ${roll_no}: ${err}`);
      }
    }

    res.json({
      message: 'Bulk CGPA update completed',
      updated,
      failed,
      errors: errors.slice(0, 10), // Return first 10 errors only
    });
  } catch (err) {
    console.error('Bulk CGPA update error:', err);
    res.status(500).json({ error: 'Failed to process bulk update' });
  }
});

// GET /admin/allotment/stats – get overall statistics
router.get('/allotment/stats', authMiddleware, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const studentCount = await query<{ count: string }[]>(
      'SELECT COUNT(*) as count FROM STUDENT WHERE Status = "active"'
    );
    const pendingApprovalsCount = await query<{ count: string }[]>(
      'SELECT COUNT(*) as count FROM STUDENT WHERE Status = "inactive"'
    );
    const courseCount = await query<{ count: string }[]>(
      'SELECT COUNT(*) as count FROM COURSE WHERE Status = "active"'
    );
    const totalCapacity = await query<{ total: string | null }[]>(
      'SELECT SUM(Capacity) as total FROM COURSE WHERE Status = "active"'
    );
    const allottedCount = await query<{ count: string }[]>(
      'SELECT COUNT(*) as count FROM ENROLLMENT WHERE Status = "allotted"'
    );
    const waitlistedCount = await query<{ count: string }[]>(
      'SELECT COUNT(*) as count FROM ENROLLMENT WHERE Status = "waitlisted"'
    );

    const totalCap = parseInt(totalCapacity[0]?.total ?? '0', 10);
    const allotted = parseInt(allottedCount[0]?.count ?? '0', 10);
    const utilization = totalCap > 0 ? Math.round((allotted / totalCap) * 100) : 0;

    res.json({
      total_students: parseInt(studentCount[0]?.count ?? '0', 10),
      pending_approvals: parseInt(pendingApprovalsCount[0]?.count ?? '0', 10),
      total_courses: parseInt(courseCount[0]?.count ?? '0', 10),
      total_capacity: totalCap,
      seats_allotted: allotted,
      seats_waitlisted: parseInt(waitlistedCount[0]?.count ?? '0', 10),
      utilization_percent: utilization,
    });
  } catch (err) {
    console.error('Get allotment stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /admin/allotment/run – trigger allotment algorithm
router.post('/allotment/run', authMiddleware, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log('Starting allotment process...');
    
    // Check if all active students have CGPA assigned
    const studentsMissingCGPA = await query<{ Roll_No: string; Name: string }[]>(`
      SELECT Roll_No, Name FROM STUDENT 
      WHERE Status = 'active' AND (CGPA IS NULL OR CGPA = 0)
    `);
    
    if (studentsMissingCGPA.length > 0) {
      res.status(400).json({ 
        error: 'Cannot run allotment: Not all students have CGPA assigned',
        students_missing_cgpa: studentsMissingCGPA.length,
        details: `${studentsMissingCGPA.length} student(s) without CGPA: ${studentsMissingCGPA.map(s => `${s.Roll_No} (${s.Name})`).join(', ')}`
      });
      return;
    }
    
    const result = await runAllotment();
    console.log('Allotment completed:', result);
    res.json({
      message: 'Allotment completed',
      result: {
        students_processed: result.student_count,
        total_allotted: result.allotted_count,
        total_waitlisted: result.waitlisted_count,
        timestamp: result.timestamp,
      },
    });
  } catch (err) {
    console.error('Allotment run error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to run allotment';
    res.status(500).json({ error: errorMessage, details: err instanceof Error ? err.stack : undefined });
  }
});

// POST /admin/allotment/clear – clear all previous allotments
router.post('/allotment/clear', authMiddleware, requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    console.log('Clearing all allotments...');
    
    // Delete all enrollments
    await query('DELETE FROM ENROLLMENT');
    
    console.log('Allotments cleared');
    res.json({
      message: 'All allotments cleared successfully',
    });
  } catch (err) {
    console.error('Clear allotment error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to clear allotments';
    res.status(500).json({ error: errorMessage, details: err instanceof Error ? err.stack : undefined });
  }
});

export default router;
