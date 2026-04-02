import type { WorkoutStep, FlattenedStep } from '../types/workout';

/**
 * Recursively flatten workout steps, expanding repetitions
 * @param steps Array of workout steps (potentially nested with reps)
 * @returns Flattened array of steps
 */
export function flattenWorkoutSteps(steps: WorkoutStep[]): FlattenedStep[] {
    const flattened: FlattenedStep[] = [];

    for (const step of steps) {
        // If this step has nested steps with repetitions
        if (step.steps && step.reps) {
            const nestedFlattened = flattenWorkoutSteps(step.steps);
            // Repeat the nested steps
            for (let i = 0; i < step.reps; i++) {
                flattened.push(...nestedFlattened);
            }
        }
        // If this step has nested steps but no reps (just execute once)
        else if (step.steps) {
            flattened.push(...flattenWorkoutSteps(step.steps));
        }
        // Regular step with power and duration
        else if (step.power && step.duration) {
            flattened.push({
                percentFtp: step.power.value,
                duration: step.duration,
            });
        }
    }

    return flattened;
}

/**
 * Get difficulty color based on % FTP
 * <60% = green
 * 60-75% = yellow
 * 76-90% = orange
 * 91-105% = red
 * >105% = purple
 */
export function getStepColor(percentFtp: number): string {
    if (percentFtp < 60) return '#10b981'; // green-500
    if (percentFtp < 76) return '#eab308'; // yellow-500
    if (percentFtp < 91) return '#f97316'; // orange-500
    if (percentFtp <= 105) return '#ef4444'; // red-500
    return '#a855f7'; // purple-500
}
