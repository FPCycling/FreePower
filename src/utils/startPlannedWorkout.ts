import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { GenericWorkout } from '../types/genericWorkout';
import type { PlannedWorkout } from '../types/workout';
import { mapIntervalsIcuWorkout } from './mappers/intervalsIcuMapper';
import { currentTime, writableCurrentWorkout } from '../routes/workout/_stores/currentWorkout';
import { getActiveRide, resetRecording } from '../routes/workout/_stores/workoutRecording';

/** Set a workout as the current workout and open it */
export function openWorkout(workout: GenericWorkout) {
    // A paused ride continues only on its own plan. On a different plan, it goes to the ride history.
    const ridePlan = getActiveRide()?.plan;
    if (ridePlan && JSON.stringify(ridePlan) !== JSON.stringify(workout)) {
        currentTime.reset();
        resetRecording();
    }

    writableCurrentWorkout.set(workout);
    return goto(resolve('/workout'));
}

/** Set a planned Intervals.icu workout as the current workout and open it */
export function startPlannedWorkout(workout: PlannedWorkout) {
    try {
        openWorkout(mapIntervalsIcuWorkout(workout));
    } catch (error) {
        console.error('Failed to load workout:', error);
    }
}
