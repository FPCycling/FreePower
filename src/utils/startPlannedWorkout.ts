import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { PlannedWorkout } from '../types/workout';
import { mapIntervalsIcuWorkout } from './mappers/intervalsIcuMapper';
import { writableCurrentWorkout } from '../routes/workout/_stores/currentWorkout';

/** Set a planned Intervals.icu workout as the current workout and open it */
export function startPlannedWorkout(workout: PlannedWorkout) {
    try {
        writableCurrentWorkout.set(mapIntervalsIcuWorkout(workout));
        goto(resolve('/workout'));
    } catch (error) {
        console.error('Failed to load workout:', error);
    }
}
