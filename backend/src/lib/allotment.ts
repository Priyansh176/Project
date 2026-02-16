import { query } from '../config/db.js';

export interface StudentPreference {
  roll_no: string;
  cgpa: number | null;
  course_id: string;
  rank: number;
}

export interface AllotmentResult {
  student_count: number;
  allotted_count: number;
  waitlisted_count: number;
  timestamp: string;
}

/**
 * Load all preferences with student CGPA details
 */
async function loadPreferencesWithCGPA(): Promise<StudentPreference[]> {
  const sql = `
    SELECT 
      p.STUDENT_Roll_No as roll_no,
      s.CGPA as cgpa,
      p.COURSE_Course_ID as course_id,
      p.\`Rank\` as \`rank\`
    FROM PREFERENCE p
    JOIN STUDENT s ON p.STUDENT_Roll_No = s.Roll_No
    WHERE s.Status = 'active'
    ORDER BY s.CGPA DESC, p.\`Rank\` ASC
  `;
  return query<StudentPreference[]>(sql);
}

/**
 * Get current enrollment counts per course
 * (Reserved for future use - e.g., checking counts before allotment)
 */
// async function getEnrollmentCounts(): Promise<Map<string, number>> {
//   const rows = await query<{ course_id: string; count: string }[]>(`
//     SELECT COURSE_Course_ID as course_id, COUNT(*) as count
//     FROM ENROLLMENT
//     WHERE Status = 'allotted'
//     GROUP BY COURSE_Course_ID
//   `);
//
//   const counts = new Map<string, number>();
//   rows.forEach((r) => {
//     counts.set(r.course_id, parseInt(r.count, 10));
//   });
//   return counts;
// }

/**
 * Get course capacities
 */
async function getCoursesCapacity(): Promise<Map<string, number>> {
  const courses = await query<{ course_id: string; capacity: number }[]>(`
    SELECT Course_ID as course_id, Capacity as capacity
    FROM COURSE
    WHERE Status = 'active'
  `);

  const capacities = new Map<string, number>();
  courses.forEach((c) => {
    capacities.set(c.course_id, c.capacity);
  });
  return capacities;
}

/**
 * Clear existing enrollments
 */
async function clearEnrollments(): Promise<void> {
  await query('DELETE FROM ENROLLMENT');
}

/**
 * Insert enrollment record
 */
async function insertEnrollment(
  rollNo: string,
  courseId: string,
  status: 'allotted' | 'waitlisted'
): Promise<void> {
  await query(
    'INSERT INTO ENROLLMENT (STUDENT_Roll_No, COURSE_Course_ID, Status) VALUES (?, ?, ?)',
    [rollNo, courseId, status]
  );
}

/**
 * Main allotment algorithm
 * - Sort students by CGPA (descending)
 * - For each student: try to allot courses in preference rank order
 * - If course has capacity, allot; else waitlist
 * - Returns summary statistics
 */
export async function runAllotment(): Promise<AllotmentResult> {
  const prefs = await loadPreferencesWithCGPA();
  const capacities = await getCoursesCapacity();
  const enrollments = new Map<string, number>();

  // Initialize enrollment counts
  capacities.forEach((_, courseId) => {
    enrollments.set(courseId, 0);
  });

  // Clear existing enrollments
  await clearEnrollments();

  // Group preferences by student
  const prefsByStudent = new Map<string, StudentPreference[]>();
  prefs.forEach((p) => {
    if (!prefsByStudent.has(p.roll_no)) {
      prefsByStudent.set(p.roll_no, []);
    }
    prefsByStudent.get(p.roll_no)!.push(p);
  });

  // Sort students by CGPA descending (already sorted from DB query)
  // Process each student's preferences
  let allottedCount = 0;
  let waitlistedCount = 0;

  for (const [rollNo, studentPrefs] of prefsByStudent.entries()) {
    // Track which student got what status
    const studentEnrollments: Array<{ courseId: string; status: 'allotted' | 'waitlisted' }> = [];

    for (const pref of studentPrefs) {
      const courseId = pref.course_id;
      const capacity = capacities.get(courseId) ?? 0;
      const currentEnrollment = enrollments.get(courseId) ?? 0;

      if (currentEnrollment < capacity) {
        // Seat available: allot
        studentEnrollments.push({ courseId, status: 'allotted' });
        enrollments.set(courseId, currentEnrollment + 1);
        allottedCount++;
      } else {
        // No seat: waitlist
        studentEnrollments.push({ courseId, status: 'waitlisted' });
        waitlistedCount++;
      }
    }

    // Batch insert enrollments for this student
    for (const enrollment of studentEnrollments) {
      await insertEnrollment(rollNo, enrollment.courseId, enrollment.status);
    }
  }

  return {
    student_count: prefsByStudent.size,
    allotted_count: allottedCount,
    waitlisted_count: waitlistedCount,
    timestamp: new Date().toISOString(),
  };
}
