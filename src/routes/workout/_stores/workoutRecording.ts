import { writable, derived, get } from 'svelte/store';
import { heartRate } from './heartRate';
import { trainerMetrics } from './trainer';
import { currentWatts } from './currentWorkout';

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
    recordingInterval: NodeJS.Timeout | null;
    elapsedTime: number; // real elapsed time in seconds
}

const initialState: WorkoutRecordingState = {
    status: RecordingStatus.NotStarted,
    dataPoints: [],
    startTime: null,
    recordingInterval: null,
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

function collectDataPoint() {
    const $heartRate = get(heartRate);
    const $trainerMetrics = get(trainerMetrics);
    const $currentWatts = get(currentWatts);

    _workoutRecording.update((state) => {
        const dataPoint: WorkoutDataPoint = {
            timestamp: state.elapsedTime, // use real elapsed time
            power: $trainerMetrics.power >= 0 ? $trainerMetrics.power : 0,
            heartRate: $heartRate >= 0 ? $heartRate : 0,
            cadence: $trainerMetrics.cadence >= 0 ? $trainerMetrics.cadence : 0,
            speed: $trainerMetrics.speed >= 0 ? $trainerMetrics.speed : 0,
            distance: $trainerMetrics.distance >= 0 ? $trainerMetrics.distance : 0,
            targetPower: $currentWatts || 0,
        };

        return {
            ...state,
            dataPoints: [...state.dataPoints, dataPoint],
            elapsedTime: state.elapsedTime + 1, // increment by 1 second
        };
    });
}

export function startRecording() {
    _workoutRecording.update((state) => {
        // Clear any existing interval
        if (state.recordingInterval) {
            clearInterval(state.recordingInterval);
        }

        // Start collecting data points every 1 second
        const interval = setInterval(() => {
            collectDataPoint();
        }, 1000);

        return {
            ...state,
            status: RecordingStatus.Recording,
            startTime: state.startTime || new Date(),
            recordingInterval: interval,
        };
    });
}

export function pauseRecording() {
    _workoutRecording.update((state) => {
        if (state.recordingInterval) {
            clearInterval(state.recordingInterval);
        }

        return {
            ...state,
            status: RecordingStatus.Paused,
            recordingInterval: null,
        };
    });
}

export function stopRecording() {
    _workoutRecording.update((state) => {
        if (state.recordingInterval) {
            clearInterval(state.recordingInterval);
        }

        // Collect one final data point
        collectDataPoint();

        return {
            ...state,
            status: RecordingStatus.Completed,
            recordingInterval: null,
        };
    });
}

export function resetRecording() {
    _workoutRecording.update((state) => {
        if (state.recordingInterval) {
            clearInterval(state.recordingInterval);
        }

        return initialState;
    });
}

export function getRecordingData(): WorkoutDataPoint[] {
    return get(_workoutRecording).dataPoints;
}

export function getStartTime(): Date | null {
    return get(_workoutRecording).startTime;
}
