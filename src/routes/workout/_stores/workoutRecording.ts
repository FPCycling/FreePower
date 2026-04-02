import { writable, derived, get } from 'svelte/store';
import { heartRate } from './heartRate';
import { trainerMetrics } from './trainer';
import { currentWatts } from './currentWorkout';
import { riderWeightKg } from '../../../stores/userSettings';
import { simulateSpeed, resetSpeed } from './speedSimulator';

export interface WorkoutDataPoint {
    timestamp: number; // seconds since workout start
    power: number; // watts
    heartRate: number; // bpm
    cadence: number; // rpm
    speed: number; // m/s
    distance: number; // meters
    targetPower: number; // watts (from workout plan)
}

export enum RecordingStatus {
    NotStarted = 'not-started',
    Recording = 'recording',
    Paused = 'paused',
    Completed = 'completed',
}

interface WorkoutRecordingState {
    status: RecordingStatus;
    dataPoints: WorkoutDataPoint[];
    startTime: Date | null;
    elapsedTime: number; // real elapsed time in seconds
}

const initialState: WorkoutRecordingState = {
    status: RecordingStatus.NotStarted,
    dataPoints: [],
    startTime: null,
    elapsedTime: 0,
};

const _workoutRecording = writable<WorkoutRecordingState>(initialState);

export const workoutRecording = derived([_workoutRecording], ([$_workoutRecording]) => {
    return {
        status: $_workoutRecording.status,
        dataPoints: $_workoutRecording.dataPoints,
        startTime: $_workoutRecording.startTime,
        dataPointCount: $_workoutRecording.dataPoints.length,
    };
});

function collectDataPoint(elapsedSeconds: number): void {
    const $heartRate = get(heartRate);
    const $trainerMetrics = get(trainerMetrics);
    const $currentWatts = get(currentWatts);
    const $riderWeightKg = get(riderWeightKg);

    _workoutRecording.update((state) => {
        const power = $trainerMetrics.power >= 0 ? $trainerMetrics.power : 0;
        const speed = simulateSpeed(power, $riderWeightKg);

        const prevDistance = state.dataPoints[state.dataPoints.length - 1]?.distance ?? 0;

        const dataPoint: WorkoutDataPoint = {
            timestamp: elapsedSeconds,
            power,
            heartRate: $heartRate >= 0 ? $heartRate : 0,
            cadence: $trainerMetrics.cadence >= 0 ? $trainerMetrics.cadence : 0,
            speed,
            distance: prevDistance + speed, // cumulative meters (1 tick = 1 second)
            targetPower: $currentWatts || 0,
        };

        return {
            ...state,
            dataPoints: [...state.dataPoints, dataPoint],
            elapsedTime: elapsedSeconds,
        };
    });
}

export function onRecordingTick(elapsedSeconds: number): void {
    if (get(_workoutRecording).status === RecordingStatus.Recording) {
        collectDataPoint(elapsedSeconds);
    }
}

export function startRecording(): void {
    _workoutRecording.update((state) => ({
        ...state,
        status: RecordingStatus.Recording,
        startTime: state.startTime || new Date(),
    }));
}

export function pauseRecording(): void {
    _workoutRecording.update((state) => ({
        ...state,
        status: RecordingStatus.Paused,
    }));
}

export function stopRecording(): void {
    const currentState = get(_workoutRecording);
    collectDataPoint(currentState.elapsedTime);
    _workoutRecording.update((state) => ({
        ...state,
        status: RecordingStatus.Completed,
    }));
}

export function resetRecording(): void {
    resetSpeed();
    _workoutRecording.set(initialState);
}

export function getRecordingData(): WorkoutDataPoint[] {
    return get(_workoutRecording).dataPoints;
}

export function getStartTime(): Date | null {
    return get(_workoutRecording).startTime;
}
