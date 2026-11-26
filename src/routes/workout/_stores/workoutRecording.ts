import { writable, derived, get } from 'svelte/store';
import { heartRate } from './heartRate';
import { trainerMetrics } from './trainer';
import { currentTime, currentWatts, writableCurrentWorkout } from './currentWorkout';
import { riderWeightKg } from '../../../stores/userSettings';
import { simulateSpeed, resetSpeed } from './speedSimulator';
import { calculateWorkoutStats } from '../../../utils/fitFileGenerator';
import { attachRide, queueFinish, queueSave, releaseRide } from '../../../utils/rides/rideBackup';
import { EMPTY_STATS, defaultRideName } from '../../../utils/rides/rideRules';
import type { StoredRide } from '../../../utils/rides/types';

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
    ride: StoredRide | null; // the backup record of this recording
}

const initialState: WorkoutRecordingState = {
    status: RecordingStatus.NotStarted,
    dataPoints: [],
    startTime: null,
    elapsedTime: 0,
    ride: null,
};

// A crash loses the points that are not on disk, so this is the maximum loss in seconds.
const FLUSH_EVERY_POINTS = 5;

const _workoutRecording = writable<WorkoutRecordingState>(initialState);
let queuedPointCount = 0;

export const workoutRecording = derived([_workoutRecording], ([$_workoutRecording]) => {
    return {
        status: $_workoutRecording.status,
        dataPoints: $_workoutRecording.dataPoints,
        startTime: $_workoutRecording.startTime,
        dataPointCount: $_workoutRecording.dataPoints.length,
    };
});

function rideSnapshot(state: WorkoutRecordingState): StoredRide | null {
    if (!state.ride) return null;
    return {
        ...state.ride,
        elapsedSeconds: state.elapsedTime,
        planElapsedMs: get(currentTime),
        stats: state.dataPoints.length > 0 ? calculateWorkoutStats(state.dataPoints) : EMPTY_STATS,
    };
}

function flush(): void {
    const state = get(_workoutRecording);
    const ride = rideSnapshot(state);
    if (!ride) return;
    queuedPointCount = state.dataPoints.length;
    void queueSave(ride, state.dataPoints);
}

function flushPendingPoints(): void {
    if (get(_workoutRecording).dataPoints.length > queuedPointCount) flush();
}

if (typeof document !== 'undefined') {
    // The browser can kill a hidden tab without a warning, so the last points are written now.
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flushPendingPoints();
    });
    window.addEventListener('pagehide', flushPendingPoints);
}

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
        if (get(_workoutRecording).dataPoints.length - queuedPointCount >= FLUSH_EVERY_POINTS) flush();
    }
}

export function startRecording(): void {
    const state = get(_workoutRecording);
    const startTime = state.startTime ?? new Date();
    let ride = state.ride;

    if (!ride) {
        const plan = get(writableCurrentWorkout);
        ride = {
            id: crypto.randomUUID(),
            status: 'recording',
            startTime: startTime.getTime(),
            elapsedSeconds: 0,
            planElapsedMs: 0,
            name: defaultRideName(plan, startTime.getTime()),
            description: '',
            activityType: 'VirtualRide',
            plan,
            stats: EMPTY_STATS,
            uploads: {},
        };
        attachRide(ride.id);
        queuedPointCount = 0;
    }

    _workoutRecording.set({ ...state, status: RecordingStatus.Recording, startTime, ride });
    flush();
}

export function pauseRecording(): void {
    if (get(_workoutRecording).status !== RecordingStatus.Recording) return;
    _workoutRecording.update((state) => ({
        ...state,
        status: RecordingStatus.Paused,
    }));
    flush();
}

export function stopRecording(): void {
    const { elapsedTime, dataPoints } = get(_workoutRecording);
    // A ride that is stopped again after a resume has this point already.
    if (dataPoints.at(-1)?.timestamp !== elapsedTime) collectDataPoint(elapsedTime);

    _workoutRecording.update((state) => ({
        ...state,
        status: RecordingStatus.Completed,
        ride: state.ride && { ...state.ride, status: 'finished' },
    }));

    const state = get(_workoutRecording);
    const ride = rideSnapshot(state);
    if (ride) {
        queuedPointCount = state.dataPoints.length;
        void queueFinish(ride, state.dataPoints);
    }
}

/** Continues a stopped ride that is still in memory. The ride is paused, so the user starts it again. */
export function resumeRecording(): void {
    if (get(_workoutRecording).status !== RecordingStatus.Completed) return;
    _workoutRecording.update((state) => ({
        ...state,
        status: RecordingStatus.Paused,
        ride: state.ride && { ...state.ride, status: 'recording' },
    }));
    flush();
}

/** Loads a ride from the history as a paused recording. The ride that was in memory goes to the history. */
export function restoreRecording(ride: StoredRide, points: WorkoutDataPoint[]): void {
    resetRecording();

    const elapsedTime = points.at(-1)?.timestamp ?? 0;
    attachRide(ride.id, points.length);
    queuedPointCount = points.length;
    _workoutRecording.set({
        status: RecordingStatus.Paused,
        dataPoints: points,
        startTime: new Date(ride.startTime),
        elapsedTime,
        ride: { ...ride, status: 'recording' },
    });
    currentTime.restore(ride.planElapsedMs, elapsedTime * 1000);
    flush();
}

/** Clears the recording. The ride stays in the history, unless it is a test start. */
export function resetRecording(): void {
    const state = get(_workoutRecording);
    const ride = rideSnapshot(state);
    if (ride) void releaseRide(ride, state.dataPoints);

    queuedPointCount = 0;
    resetSpeed();
    _workoutRecording.set(initialState);
}

/** Applies a change from the upload dialog to the ride in memory. */
export function syncActiveRide(id: string, patch: Partial<StoredRide>): void {
    _workoutRecording.update((state) =>
        state.ride?.id === id ? { ...state, ride: { ...state.ride, ...patch } } : state,
    );
}

export function getActiveRide(): StoredRide | null {
    return rideSnapshot(get(_workoutRecording));
}

export function getRecordingData(): WorkoutDataPoint[] {
    return get(_workoutRecording).dataPoints;
}

export function getStartTime(): Date | null {
    return get(_workoutRecording).startTime;
}

export function getElapsedSeconds(): number {
    return get(_workoutRecording).elapsedTime;
}
