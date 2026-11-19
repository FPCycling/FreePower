import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { Workout } from '../types/workout';
import { getWorkoutEndMs, hasReachedWorkoutEnd } from './workoutEnd';

const workout = (startTimes: number[]): Workout => ({
    date: dayjs(0),
    description: '',
    workoutData: startTimes.map((startMs) => ({ startMs, percentFtp: 50, watts: 100 })),
});

describe('getWorkoutEndMs', () => {
    it('returns the start of the end marker', () => {
        expect(getWorkoutEndMs(workout([0, 60_000, 120_000]))).toBe(120_000);
    });

    it('returns 0 without a workout', () => {
        expect(getWorkoutEndMs(undefined)).toBe(0);
        expect(getWorkoutEndMs(workout([]))).toBe(0);
    });
});

describe('hasReachedWorkoutEnd', () => {
    it('is true when the clock crosses the end', () => {
        expect(hasReachedWorkoutEnd(119_900, 120_000, 120_000)).toBe(true);
        expect(hasReachedWorkoutEnd(119_900, 125_000, 120_000)).toBe(true);
    });

    it('is false before the end and after it', () => {
        expect(hasReachedWorkoutEnd(100_000, 110_000, 120_000)).toBe(false);
        expect(hasReachedWorkoutEnd(120_000, 120_100, 120_000)).toBe(false);
    });

    it('is false without a workout', () => {
        expect(hasReachedWorkoutEnd(0, 100, 0)).toBe(false);
    });
});
