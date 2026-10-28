import { describe, expect, it } from 'vitest';
import type { PowerZone, WorkoutStep } from '../types/workout';
import { flattenWorkoutSteps } from './workoutUtils';

// Trimmed from workout_doc.zoneTimes of a real Intervals.icu event
const zones: PowerZone[] = [
    { id: 'Z1', zone: 1, max: 55 },
    { id: 'Z2', zone: 2, max: 75 },
    { id: 'Z3', zone: 3, max: 90 },
    { id: 'Z4', zone: 4, max: 105 },
    { id: 'SS', zone: 8, min: 84, max: 97, gap: true },
];

describe('flattenWorkoutSteps', () => {
    it('reads %ftp values as-is', () => {
        const steps: WorkoutStep[] = [{ power: { units: '%ftp', value: 88 }, duration: 600 }];

        expect(flattenWorkoutSteps(steps)).toEqual([{ percentFtp: 88, duration: 600 }]);
    });

    it('uses the midpoint of %ftp ranges and ramps', () => {
        const steps: WorkoutStep[] = [
            { power: { units: '%ftp', start: 65, end: 75 }, duration: 3300 },
            { power: { units: '%ftp', start: 50, end: 65 }, ramp: true, duration: 600 },
        ];

        expect(flattenWorkoutSteps(steps)).toEqual([
            { percentFtp: 70, duration: 3300 },
            { percentFtp: 57.5, duration: 600 },
        ]);
    });

    it('converts power_zone targets to %ftp using the workout zones', () => {
        const steps: WorkoutStep[] = [
            { power: { units: 'power_zone', value: 1 }, duration: 600 },
            {
                reps: 2,
                steps: [
                    { power: { units: 'power_zone', value: 2 }, duration: 300 },
                    { power: { units: 'power_zone', value: 4 }, duration: 60 },
                ],
                duration: 720,
            },
        ];

        expect(flattenWorkoutSteps(steps, zones)).toEqual([
            { percentFtp: 50, duration: 600 },
            { percentFtp: 65.5, duration: 300 },
            { percentFtp: 98, duration: 60 },
            { percentFtp: 65.5, duration: 300 },
            { percentFtp: 98, duration: 60 },
        ]);
    });

    it('falls back to default zones when the workout has none', () => {
        const steps: WorkoutStep[] = [{ power: { units: 'power_zone', value: 2 }, duration: 600 }];

        expect(flattenWorkoutSteps(steps)).toEqual([{ percentFtp: 65.5, duration: 600 }]);
    });
});
