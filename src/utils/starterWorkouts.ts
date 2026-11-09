import type { PlannedWorkout, WorkoutStep } from '../types/workout';

export interface StarterWorkout {
    summary: string;
    workout: PlannedWorkout;
}

const step = (minutes: number, percentFtp: number): WorkoutStep => ({
    duration: Math.round(minutes * 60),
    power: { units: '%ftp', value: percentFtp },
});

const repeat = (reps: number, ...steps: WorkoutStep[]): WorkoutStep => ({ reps, duration: 0, steps });

const warmup = [step(5, 50), step(3, 65), step(2, 75)];
const cooldown = [step(5, 50)];

function totalSeconds(steps: WorkoutStep[]): number {
    return steps.reduce((sum, s) => sum + (s.steps ? totalSeconds(s.steps) * (s.reps ?? 1) : s.duration), 0);
}

function starter(id: number, name: string, summary: string, note: string, steps: WorkoutStep[]): StarterWorkout {
    return {
        summary,
        workout: {
            id: -id,
            name,
            start_date_local: '',
            description: note,
            type: 'Ride',
            category: 'WORKOUT',
            workout_doc: { steps, duration: totalSeconds(steps) },
        },
    };
}

// 1-minute steps from 50% to 158% FTP
const rampSteps = Array.from({ length: 19 }, (_, i) => step(1, 50 + i * 6));

export const STARTER_WORKOUTS: StarterWorkout[] = [
    starter(
        1,
        'FTP ramp test',
        'Find your FTP',
        'Ride until you cannot hold the target, then press Stop. Your FTP is about 75% of the target of the last full minute you finished. Set it in settings.',
        [step(5, 45), ...rampSteps, step(5, 40)],
    ),
    starter(2, 'Easy spin 30', 'Recovery', 'Very easy. Spin your legs and keep breathing relaxed.', [
        step(5, 45),
        step(20, 55),
        step(5, 45),
    ]),
    starter(
        3,
        'Endurance 60',
        'Aerobic base',
        'Steady and conversational. You should be able to talk the whole time.',
        [step(5, 50), step(5, 60), step(40, 68), step(5, 60), step(5, 50)],
    ),
    starter(4, 'Sweet spot 3×10', 'Sweet spot', 'Hard but controlled. Stay seated and keep a steady cadence.', [
        ...warmup,
        repeat(3, step(10, 90), step(5, 55)),
        ...cooldown,
    ]),
    starter(
        5,
        'Threshold 2×20',
        'Threshold',
        'Long efforts near FTP. Start calm: the second half of each block is the hard part.',
        [...warmup, repeat(2, step(20, 97), step(5, 55)), ...cooldown],
    ),
    starter(
        6,
        'Over-unders 3×9',
        'Threshold',
        'Alternate just under and just over FTP. Settle quickly after each surge.',
        [...warmup, repeat(3, repeat(3, step(2, 95), step(1, 108)), step(5, 55)), ...cooldown],
    ),
    starter(
        7,
        'VO2 max 5×3',
        'VO2 max',
        'Hard 3-minute efforts. Breathing gets heavy in the last minute: that is the point.',
        [...warmup, step(1, 100), step(2, 55), repeat(5, step(3, 115), step(3, 55)), ...cooldown],
    ),
    starter(8, '30/30s', 'Anaerobic', 'Short and sharp. Spin fast in the 30-second efforts and recover easy.', [
        ...warmup,
        repeat(2, repeat(10, step(0.5, 120), step(0.5, 50)), step(5, 55)),
        ...cooldown,
    ]),
];
