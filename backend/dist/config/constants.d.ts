/**
 * Preference submission deadline (ISO 8601 string or null for no deadline)
 * Format: "YYYY-MM-DDTHH:mm:ss.sssZ" (UTC)
 * Example: "2026-02-28T23:59:59.000Z"
 * If not set, defaults to null (no deadline)
 */
export declare const PREFERENCE_DEADLINE: string | null;
/**
 * Check if preferences can still be submitted
 * Returns true if deadline has not passed or no deadline is set
 */
export declare function canSubmitPreferences(): boolean;
/**
 * Get time remaining until deadline (if any)
 * Returns null if no deadline or deadline has passed
 */
export declare function getTimeUntilDeadline(): {
    ms: number;
    formatted: string;
} | null;
//# sourceMappingURL=constants.d.ts.map