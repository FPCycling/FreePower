/**
 * Generic workout format - agnostic of source (MRC, Intervals.icu, Zwift, etc.)
 * This is the internal format used by the application for workout execution
 */

export interface GenericWorkout {
    /** Workout metadata */
    name: string;
    description?: string;

    /** Workout intervals - each representing a power target over time */
    intervals: WorkoutInterval[];
}

export interface WorkoutInterval {
    /** Start time in milliseconds from workout start */
    startMs: number;

    /** Target power as percentage of FTP (e.g., 100 = 100% FTP) */
    percentFtp: number;
}

/**
 * Source types for workout data
 */
export type WorkoutSource = 'mrc' | 'intervals-icu' | 'zwift';
