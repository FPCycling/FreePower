import { derived, writable, get } from 'svelte/store';
import { trainerMetrics } from './trainer';
import { heartRate } from './heartRate';
import { currentTime, startTime } from './currentWorkout';

const currentRecord = derived([currentTime], ([$currentTime]) => {
    const startTimeValue = get(startTime);
    if ($currentTime % 1000 === 0 && startTimeValue) {
        const trainerMetric = get(trainerMetrics);
        return {
            time: get(startTime).add($currentTime, 'ms').toISOString(),
            heartRate: Math.max(get(heartRate), 0),
            power: Math.max(trainerMetric.power, 0),
            cadence: Math.max(trainerMetric.cadence, 0),
            speed: Math.max(trainerMetric.speed, 0),
            distance: Math.max(trainerMetric.distance, 0),
        };
    }
    return null;
});

export interface Record {
    time: string;
    heartRate: number;
    power: number;
    cadence: number;
    speed: number;
    distance: number;
}

export const recordings = writable<Record[]>([]);

currentRecord.subscribe((record) => {
    if (record) {
        recordings.update((records) => {
            return [...records, record];
        });
    }
});

export function getStats() {
    const records = get(recordings);
    const distance = records.map((record) => record.distance);
    const speed = records.map((record) => record.speed);
    const heartRate = records.map((record) => record.heartRate);
    return {
        startTime: get(startTime).toISOString(),
        totalTimeInSeconds: records.length,
        totalDistance: distance.reduce((a, b) => a + b, 0),
        maximumSpeed: Math.max.apply(null, speed),
        heartRate: {
            max: Math.max.apply(null, heartRate),
            avg: heartRate.reduce((a, b) => a + b, 0) / heartRate.length,
        },
    };
}
