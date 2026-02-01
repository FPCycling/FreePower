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
    const flatSteps = flattenWorkoutSteps(plannedWorkout.workout_doc.steps);

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

    // Remove duplicate consecutive intervals (same power level)
    const dedupedIntervals = intervals.filter((interval, index, array) => {
        if (index === 0) return true;
        const prevInterval = array[index - 1];
        return prevInterval ? interval.percentFtp !== prevInterval.percentFtp : true;
    });

    return {
        name: plannedWorkout.name,
        description: plannedWorkout.description,
        intervals: dedupedIntervals,
    };
}
