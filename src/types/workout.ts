import type dayjs from 'dayjs';

export interface Workout {
    date: dayjs.Dayjs;
    description: string;
    workoutData: WorkoutData[];
}

export interface WorkoutData {
    startMs: number;
    percentFtp: number;
}

export enum WorkoutStatus {
    Initial,
    Started,
    Paused,
    Completed,
}
