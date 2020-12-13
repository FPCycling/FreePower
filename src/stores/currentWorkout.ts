import type dayjs from 'dayjs';
import { writable, derived, Writable } from 'svelte/store';
import type { Workout } from '../types/workout';
import { userFtp } from './userSettings';

export interface InnerWorkout {
    date: dayjs.Dayjs;
    description: string;
    workoutData: InnerWorkoutData[];
}

export interface InnerWorkoutData {
    startMs: number;
    percentFtp: number;
}

let initialWorkout = undefined;

if (typeof window !== 'undefined' && window.localStorage) {
    const initialWorkoutString = localStorage.getItem('currentWorkout');
    initialWorkout = initialWorkoutString ? JSON.parse(initialWorkoutString) : undefined;
}

const innerCurrentWorkout = writable<InnerWorkout | undefined>(initialWorkout);
innerCurrentWorkout.subscribe((workout) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('currentWorkout', JSON.stringify(workout));
    }
});

export const currentWorkout = derived<[Writable<number>, Writable<InnerWorkout>], Workout | undefined>(
    [userFtp, innerCurrentWorkout],
    ([$userFtp, $currentWorkout]) => {
        if (!$currentWorkout) {
            return undefined;
        }

        return {
            date: $currentWorkout.date,
            description: $currentWorkout.description,
            workoutData: $currentWorkout.workoutData.map((data) => ({
                percentFtp: data.percentFtp,
                startMs: data.startMs,
                watts: Math.round((data.percentFtp / 100) * $userFtp),
            })),
        };
    },
);

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

export const currentWatts = derived([currentWorkout, currentTime], ([$currentWorkout, $currentTime]) => {
    if (!$currentWorkout) {
        return 0;
    }

    const actives = $currentWorkout.workoutData.filter((data) => data.startMs < $currentTime);

    const currentlyActive = actives.length ? actives[actives.length - 1] : $currentWorkout.workoutData[0];

    return currentlyActive.watts;
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

    const nextIndex = actives.length === $currentWorkout.workoutData.length ? actives.length - 1 : actives.length;

    const nextActive = $currentWorkout.workoutData[nextIndex];

    return {
        nextWatts: nextActive.watts,
        at: nextActive.startMs,
        in: nextActive.startMs - $currentTime,
    };
});
