import type { Workout } from '../types/workout';

/** The last interval is the end marker, so its start is the workout's total duration. */
export function getWorkoutEndMs(workout: Workout | undefined): number {
    return workout?.workoutData.at(-1)?.startMs ?? 0;
}

export function hasReachedWorkoutEnd(previousMs: number, currentMs: number, endMs: number): boolean {
    return endMs > 0 && previousMs < endMs && currentMs >= endMs;
}
