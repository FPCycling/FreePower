import { writable, derived } from 'svelte/store';
import type { Workout } from '../types/workout';
import { userFtp } from './userSettings';

let initialWorkout = undefined;

if (typeof window !== 'undefined' && window.localStorage) {
    const initialWorkoutString = localStorage.getItem('currentWorkout');
    initialWorkout = initialWorkoutString ? JSON.parse(initialWorkoutString) : undefined;
}

export const currentWorkout = writable<Workout | undefined>(initialWorkout);

currentWorkout.subscribe((workout) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('currentWorkout', JSON.stringify(workout));
    }
});

function createCurrentTime() {
    const { subscribe, set, update } = writable(0);
    let interval: NodeJS.Timeout;
    return {
        subscribe,
        start: () => {
            if (!interval) {
                interval = setInterval(() => {
                    update((t) => t + 100);
                }, 100);
            }
        },
        pause: () => {
            clearInterval(interval);
            interval = undefined;
        },
        reset: () => {
            clearInterval(interval);
            interval = undefined;
            set(0);
        },
        add: (addMs: number) => {
            update((t) => t + addMs);
        },
    };
}

export const currentTime = createCurrentTime();

export const currentFtpValue = derived(
    [userFtp, currentWorkout, currentTime],
    ([$userFtp, $currentWorkout, $currentTime]) => {
        if (!$currentWorkout) {
            return 0;
        }

        const actives = $currentWorkout.workoutData.filter((data) => data.startMs < $currentTime);

        const currentlyActive = actives.length ? actives[actives.length - 1] : $currentWorkout.workoutData[0];

        return (currentlyActive.percentFtp / 100) * $userFtp;
    },
);

export const nextInterval = derived(
    [userFtp, currentWorkout, currentTime],
    ([$userFtp, $currentWorkout, $currentTime]) => {
        if (!$currentWorkout) {
            return {
                nextFtp: 0,
                at: 0,
                in: 0,
            };
        }

        const actives = $currentWorkout.workoutData.filter((data) => data.startMs < $currentTime);

        const nextIndex = actives.length === $currentWorkout.workoutData.length ? actives.length - 1 : actives.length;

        const nextActive = $currentWorkout.workoutData[nextIndex];

        return {
            nextFtp: (nextActive.percentFtp / 100) * $userFtp,
            at: nextActive.startMs,
            in: nextActive.startMs - $currentTime,
        };
    },
);
