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
 * Main allotment algorithm
 * - Sort students by CGPA (descending)
 * - For each student: try to allot courses in preference rank order
 * - If course has capacity, allot; else waitlist
 * - Returns summary statistics
 */
export declare function runAllotment(): Promise<AllotmentResult>;
//# sourceMappingURL=allotment.d.ts.map