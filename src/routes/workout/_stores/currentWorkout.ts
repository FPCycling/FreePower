import dayjs from 'dayjs';
import type { Writable } from 'svelte/store';
import { writable, derived } from 'svelte/store';
import { userFtp, difficulty } from '../../../stores/userSettings';
import type { Workout } from '../../../types/workout';
import { WorkoutStatus } from '../../../types/workout';

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

export const writableCurrentWorkout = writable<InnerWorkout | undefined>(initialWorkout);
writableCurrentWorkout.subscribe((workout) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('currentWorkout', JSON.stringify(workout));
    }
});

export const currentWorkout = derived<
    [Writable<number | undefined>, Writable<number | undefined>, Writable<InnerWorkout | undefined>],
    Workout | undefined
>([userFtp, difficulty, writableCurrentWorkout], ([$userFtp, $difficulty, $currentWorkout]) => {
    if (!$currentWorkout || !$userFtp || !$difficulty) {
        return undefined;
    }

    return {
        date: $currentWorkout.date,
        description: $currentWorkout.description,
        workoutData: $currentWorkout.workoutData.map((data) => ({
            percentFtp: data.percentFtp,
            startMs: data.startMs,
            watts: Math.round((data.percentFtp / 100) * $userFtp * $difficulty),
        })),
    };
});

const _workoutStatus = writable<WorkoutStatus>(WorkoutStatus.Initial);

export const workoutStatus = derived([_workoutStatus], ([$_workoutStatus]) => {
    return $_workoutStatus;
});

const _startTime = writable<dayjs.Dayjs>();

export const startTime = derived([_startTime], ([$_startTime]) => {
    return $_startTime;
});

function createCurrentTime() {
    const { subscribe, set, update } = writable(0);
    let interval: NodeJS.Timeout | undefined;
    return {
        subscribe,
        start: () => {
            _startTime.set(dayjs());
            _workoutStatus.set(WorkoutStatus.Started);
            if (!interval) {
                interval = setInterval(() => {
                    update((t) => t + 100);
                }, 100);
            }
        },
        pause: () => {
            _workoutStatus.set(WorkoutStatus.Paused);
            if (interval) {
                clearInterval(interval);
            }
            interval = undefined;
        },
        reset: () => {
            _workoutStatus.set(WorkoutStatus.Initial);
            if (interval) {
                clearInterval(interval);
            }
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

    const nextIndex = Math.max(
        actives.length === $currentWorkout.workoutData.length ? actives.length - 1 : actives.length,
        1,
    );

    const nextActive = $currentWorkout.workoutData[nextIndex];

    return {
        nextWatts: nextActive.watts,
        at: nextActive.startMs,
        in: Math.max(nextActive.startMs - $currentTime + 999, 0),
    };
});

nextInterval.subscribe((next) => {
    if (next.in === 0) {
        _workoutStatus.set(WorkoutStatus.Completed);
    }
});
