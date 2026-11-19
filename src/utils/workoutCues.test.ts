import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { Workout } from '../types/workout';
import { getWorkoutCues } from './workoutCues';

// 0-60 s at 100 W, 60-120 s at 200 W, 120-122 s at 150 W, end at 122 s.
const workout: Workout = {
    date: dayjs(0),
    description: '',
    workoutData: [
        { startMs: 0, percentFtp: 50, watts: 100 },
        { startMs: 60_000, percentFtp: 100, watts: 200 },
        { startMs: 120_000, percentFtp: 75, watts: 150 },
        { startMs: 122_000, percentFtp: 75, watts: 150 },
    ],
};

describe('getWorkoutCues', () => {
    it('plays the countdown pips 3, 2 and 1 s before a change', () => {
        expect(getWorkoutCues(workout, 56_950, 57_050)).toEqual(['countdown']);
        expect(getWorkoutCues(workout, 57_950, 58_050)).toEqual(['countdown']);
        expect(getWorkoutCues(workout, 58_950, 59_050)).toEqual(['countdown']);
    });

    it('plays powerUp or powerDown on a change', () => {
        expect(getWorkoutCues(workout, 59_950, 60_050)).toEqual(['powerUp']);
        expect(getWorkoutCues(workout, 119_950, 120_050)).toEqual(['powerDown']);
    });

    it('plays finish at the end marker, without a countdown for a short last interval', () => {
        expect(getWorkoutCues(workout, 118_950, 119_050)).toEqual(['countdown']);
        expect(getWorkoutCues(workout, 120_950, 121_050)).toEqual([]);
        expect(getWorkoutCues(workout, 121_950, 122_050)).toEqual(['finish']);
    });

    it('plays nothing between cues', () => {
        expect(getWorkoutCues(workout, 30_000, 30_100)).toEqual([]);
    });

    it('plays nothing on a seek or a reset', () => {
        expect(getWorkoutCues(workout, 50_000, 60_000)).toEqual([]);
        expect(getWorkoutCues(workout, 70_000, 60_000)).toEqual([]);
        expect(getWorkoutCues(workout, 70_000, 0)).toEqual([]);
    });

    it('plays nothing without a workout', () => {
        expect(getWorkoutCues(undefined, 0, 100)).toEqual([]);
    });
});
