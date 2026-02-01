import type dayjs from 'dayjs';

export interface Workout {
    date: dayjs.Dayjs;
    description: string;
    workoutData: WorkoutData[];
}

export interface WorkoutData {
    startMs: number;
    percentFtp: number;
    watts: number;
}

export enum WorkoutStatus {
    Initial,
    Started,
    Paused,
    Completed,
}

// Intervals.icu workout step structure
export interface WorkoutStep {
    power?: {
        units: string;
        value: number;
    };
    duration: number;
    reps?: number;
    text?: string;
    steps?: WorkoutStep[];
}

export interface WorkoutDoc {
    steps: WorkoutStep[];
    duration: number;
}

// Planned workout from Intervals.icu API
export interface PlannedWorkout {
    id: number;
    name: string;
    start_date_local: string;
    description?: string;
    workout_doc?: WorkoutDoc;
    type: string;
    category?: string;
    icu_training_load?: number;
}

// Flattened workout step for visualization
export interface FlattenedStep {
    percentFtp: number;
    duration: number; // in seconds
}
