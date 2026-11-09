import type { GenericWorkout, WorkoutInterval } from '../../types/genericWorkout';
import type { PlannedWorkout } from '../../types/workout';
import { flattenWorkoutSteps } from '../workoutUtils';

/**
 * Convert Intervals.icu planned workout to generic workout format
 */
export function mapIntervalsIcuWorkout(plannedWorkout: PlannedWorkout): GenericWorkout {
    if (!plannedWorkout.workout_doc?.steps) {
        throw new Error('Workout does not contain workout data');
    }

    // Flatten the nested workout steps
    const flatSteps = flattenWorkoutSteps(plannedWorkout.workout_doc.steps, plannedWorkout.workout_doc.zoneTimes);

    // Convert to intervals with cumulative start times
    const intervals: WorkoutInterval[] = [];
    let currentTimeMs = 0;

    for (const step of flatSteps) {
        intervals.push({
            startMs: currentTimeMs,
            percentFtp: step.percentFtp,
        });
        currentTimeMs += step.duration * 1000; // Convert seconds to milliseconds
    }

    // Add end marker so the last interval has a known end time.
    // This mirrors the MRC format where the last line marks the workout's total duration,
    // which is required for the chart x-axis domain and the interval countdown timer.
    if (flatSteps.length > 0) {
        intervals.push({
            startMs: currentTimeMs,
            percentFtp: flatSteps[flatSteps.length - 1]!.percentFtp,
        });
    }

    // Remove duplicate consecutive intervals (same power level),
    // but always keep the first and last entries (last = end marker).
    const dedupedIntervals = intervals.filter((interval, index, array) => {
        if (index === 0 || index === array.length - 1) return true;
        const prevInterval = array[index - 1];
        return prevInterval ? interval.percentFtp !== prevInterval.percentFtp : true;
    });

    return {
        name: plannedWorkout.name,
        description: plannedWorkout.description,
        coachNote: extractCoachNote(plannedWorkout.description),
        intervals: dedupedIntervals,
    };
}

/**
 * Free text written above the step lines of an Intervals.icu description.
 * Paragraphs are kept until the first one that contains a step ("- 10m 60%").
 */
export function extractCoachNote(description?: string): string | undefined {
    if (!description) return undefined;

    const noteParagraphs: string[] = [];
    for (const paragraph of description.trim().split(/\n\s*\n/)) {
        if (/^\s*-/m.test(paragraph)) break;
        noteParagraphs.push(paragraph.trim());
    }

    return noteParagraphs.join('\n\n') || undefined;
}
