import { writable, derived } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { userFtp, difficulty } from '../../../stores/userSettings';
import type { Workout } from '../../../types/workout';
import type { GenericWorkout } from '../../../types/genericWorkout';

let initialWorkout: GenericWorkout | undefined = undefined;

if (typeof window !== 'undefined' && window.localStorage) {
    const initialWorkoutString = localStorage.getItem('currentWorkout');
    if (initialWorkoutString) {
        try {
            initialWorkout = JSON.parse(initialWorkoutString);
        } catch {
            initialWorkout = undefined;
        }
    }
}

export const writableCurrentWorkout = writable<GenericWorkout | undefined>(initialWorkout);
writableCurrentWorkout.subscribe((workout) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('currentWorkout', JSON.stringify(workout));
    }
});

export const currentWorkout = derived<
    [Writable<number | undefined>, Writable<number | undefined>, Writable<GenericWorkout | undefined>],
    Workout | undefined
>([userFtp, difficulty, writableCurrentWorkout], ([$userFtp, $difficulty, $currentWorkout]) => {
    if (!$currentWorkout || !$userFtp || !$difficulty) {
        return undefined;
    }

    return {
        date: undefined as any, // Kept for backwards compatibility, can be removed later
        description: $currentWorkout.description || '',
        workoutData: $currentWorkout.intervals.map((interval) => ({
            percentFtp: interval.percentFtp,
            startMs: interval.startMs,
            watts: Math.round((interval.percentFtp / 100) * $userFtp * $difficulty),
        })),
    };
});

let _worker: Worker | null = null;

export function _setWorker(w: Worker | null): void {
    _worker = w;
}

const _currentTimeStore = writable(0);

export function setCurrentTimeMs(ms: number): void {
    _currentTimeStore.set(ms);
}

export const currentTime = {
    subscribe: _currentTimeStore.subscribe,
    start: () => _worker?.postMessage({ type: 'start' }),
    pause: () => _worker?.postMessage({ type: 'pause' }),
    reset: () => _worker?.postMessage({ type: 'reset' }),
    add: (addMs: number) => _worker?.postMessage({ type: 'add', ms: addMs }),
};

export const currentWatts = derived([currentWorkout, currentTime], ([$currentWorkout, $currentTime]) => {
    if (!$currentWorkout) {
        return 0;
    }

    const actives = $currentWorkout.workoutData.filter((data) => data.startMs < $currentTime);

    const currentlyActive = actives.length ? actives[actives.length - 1] : $currentWorkout.workoutData[0];

    return currentlyActive?.watts;
});

export const nextInterval = derived([currentWorkout, currentTime], ([$currentWorkout, $currentTime]) => {
    if (!$currentWorkout) {
        return {
            nextWatts: 0,
            at: 0,
            in: 0,
        };
    }

    const actives = $currentWorkout.workoutData.filter((data) => data.startMs < $currentTime);

    const nextIndex = Math.max(
        actives.length === $currentWorkout.workoutData.length ? actives.length - 1 : actives.length,
        1,
    );

    const nextActive = $currentWorkout.workoutData[nextIndex];

    return {
        nextWatts: nextActive?.watts,
        at: nextActive?.startMs,
        in: Math.max((nextActive?.startMs ?? 0) - $currentTime + 999, 0),
    };
});
