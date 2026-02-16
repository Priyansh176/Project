export interface StudentPreference {
    roll_no: string;
    cgpa: number | null;
    course_id: string;
    rank: number;
    course_type?: string | null;
    elective_slot?: string | null;
}
export interface AllotmentResult {
    student_count: number;
    allotted_count: number;
    waitlisted_count: number;
    timestamp: string;
}
/**
 * Main allotment algorithm
 * - Sort students by CGPA (descending)
 * - For each student: try to allot courses in preference rank order
 * - For elective courses: ensure only 1 course per elective slot per student
 * - If course has capacity, allot; else waitlist
 * - Returns summary statistics
 */
export declare function runAllotment(): Promise<AllotmentResult>;
//# sourceMappingURL=allotment.d.ts.map