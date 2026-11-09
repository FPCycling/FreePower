import { describe, expect, it } from 'vitest';
import { STARTER_WORKOUTS } from './starterWorkouts';
import { mapIntervalsIcuWorkout } from './mappers/intervalsIcuMapper';

describe('STARTER_WORKOUTS', () => {
    it.each(STARTER_WORKOUTS.map((s) => [s.workout.name, s.workout] as const))(
        '%s maps to a rideable workout',
        (_, workout) => {
            const mapped = mapIntervalsIcuWorkout(workout);
            const end = mapped.intervals[mapped.intervals.length - 1]!;

            expect(end.startMs).toBe(workout.workout_doc!.duration * 1000);
            expect(mapped.coachNote).toBe(workout.description);
        },
    );

    it('expands repeats in the duration', () => {
        const sweetSpot = STARTER_WORKOUTS.find((s) => s.workout.name === 'Sweet spot 3×10')!;

        expect(sweetSpot.workout.workout_doc!.duration).toBe(60 * 60);
    });

    it('has unique ids that cannot clash with Intervals.icu events', () => {
        const ids = STARTER_WORKOUTS.map((s) => s.workout.id);

        expect(new Set(ids).size).toBe(ids.length);
        expect(ids.every((id) => id < 0)).toBe(true);
    });
});
