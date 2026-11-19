import type { Workout } from '../types/workout';

export type WorkoutCue = 'countdown' | 'powerUp' | 'powerDown' | 'finish';

const COUNTDOWN_SECONDS = [3, 2, 1];
// The clock ticks every 100 ms. A bigger step or a step back is a seek, so no cue plays.
const MAX_TICK_MS = 2000;

/**
 * Returns the cues to play when the clock moves from previousMs to currentMs.
 * The last interval is the end marker, so the last change is the workout end.
 */
export function getWorkoutCues(workout: Workout | undefined, previousMs: number, currentMs: number): WorkoutCue[] {
    const intervals = workout?.workoutData ?? [];
    if (currentMs <= previousMs || currentMs - previousMs > MAX_TICK_MS) return [];

    const crossed = (ms: number) => previousMs < ms && ms <= currentMs;
    const cues: WorkoutCue[] = [];

    for (let i = 1; i < intervals.length; i++) {
        const previous = intervals[i - 1]!;
        const current = intervals[i]!;
        const changeMs = current.startMs;

        // Pips are skipped if the interval is too short for the full countdown.
        if (changeMs - previous.startMs > COUNTDOWN_SECONDS[0]! * 1000) {
            for (const seconds of COUNTDOWN_SECONDS) {
                if (crossed(changeMs - seconds * 1000)) cues.push('countdown');
            }
        }

        if (crossed(changeMs)) {
            if (i === intervals.length - 1) cues.push('finish');
            else cues.push(current.watts < previous.watts ? 'powerDown' : 'powerUp');
        }
    }

    return cues;
}
