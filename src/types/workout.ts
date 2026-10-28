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
// Ranges and ramps use start/end instead of value
export interface StepPower {
    units: string; // '%ftp' | 'power_zone' | ...
    value?: number;
    start?: number;
    end?: number;
}

export interface WorkoutStep {
    power?: StepPower;
    duration: number;
    ramp?: boolean;
    reps?: number;
    text?: string;
    steps?: WorkoutStep[];
}

// Entry of workout_doc.zoneTimes; min/max are %FTP
export interface PowerZone {
    id: string;
    zone: number;
    max: number;
    min?: number;
    gap?: boolean; // overlay zone like Sweet Spot, not part of the zone ladder
}

export interface WorkoutDoc {
    steps: WorkoutStep[];
    duration: number;
    zoneTimes?: PowerZone[];
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
