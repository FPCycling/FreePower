import { IDBFactory } from 'fake-indexeddb';
import 'fake-indexeddb/auto';
import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { backupIdle } from '../../../utils/rides/rideBackup';
import { closeRideDb, getRidePoints, listRides, patchRide } from '../../../utils/rides/rideDb';
import { currentTime } from './currentWorkout';
import {
    RecordingStatus,
    getActiveRide,
    getElapsedSeconds,
    getRecordingData,
    onRecordingTick,
    pauseRecording,
    resetRecording,
    restoreRecording,
    resumeRecording,
    startRecording,
    stopRecording,
    workoutRecording,
} from './workoutRecording';

function ride(seconds: number) {
    startRecording();
    for (let s = 0; s < seconds; s++) onRecordingTick(s);
}

async function storedRide() {
    await backupIdle();
    const [stored] = await listRides();
    return stored && { ...stored, points: await getRidePoints(stored.id) };
}

beforeEach(async () => {
    await closeRideDb();
    globalThis.indexedDB = new IDBFactory();
});

afterEach(async () => {
    resetRecording();
    await backupIdle();
});

describe('ride backup during a recording', () => {
    it('writes the points to disk every 5 seconds', async () => {
        ride(7);

        const stored = await storedRide();
        expect(stored?.status).toBe('recording');
        expect(stored?.points.map((p) => p.timestamp)).toEqual([0, 1, 2, 3, 4]);
    });

    it('writes the pending points on pause', async () => {
        ride(7);
        pauseRecording();

        const stored = await storedRide();
        expect(stored?.points).toHaveLength(7);
        expect(stored?.elapsedSeconds).toBe(6);
    });

    it('finishes the ride on stop and keeps it after a reset', async () => {
        ride(90);
        stopRecording();
        resetRecording();

        const stored = await storedRide();
        expect(stored?.status).toBe('finished');
        expect(stored?.points).toHaveLength(90);
        expect(stored?.stats.totalDuration).toBe(89);
        expect(get(workoutRecording).status).toBe(RecordingStatus.NotStarted);
    });

    it('keeps a paused ride of 1 minute as finished on reset', async () => {
        ride(61);
        pauseRecording();
        resetRecording();

        expect((await storedRide())?.status).toBe('finished');
    });

    it('deletes a test start on reset', async () => {
        ride(20);
        stopRecording();
        resetRecording();

        expect(await storedRide()).toBeUndefined();
    });

    it('keeps a test start that the user uploaded', async () => {
        ride(20);
        stopRecording();
        await backupIdle();
        await patchRide(getActiveRide()!.id, { uploads: { strava: { ok: true, at: 1 } }, lastUploadAt: 1 });
        resetRecording();

        expect((await storedRide())?.uploads.strava?.ok).toBe(true);
    });
});

describe('resume', () => {
    it('continues a stopped ride that is in memory', async () => {
        ride(90);
        stopRecording();
        resumeRecording();

        expect(get(workoutRecording).status).toBe(RecordingStatus.Paused);
        expect((await storedRide())?.status).toBe('recording');

        startRecording();
        onRecordingTick(90);
        stopRecording();

        // The second stop adds no duplicate of the last point.
        expect((await storedRide())?.points.map((p) => p.timestamp).slice(-3)).toEqual([88, 89, 90]);
    });

    it('continues a ride from the history', async () => {
        ride(90);
        pauseRecording();
        const interrupted = (await storedRide())!;
        resetRecording();
        await backupIdle();

        restoreRecording({ ...interrupted, planElapsedMs: 120_000 }, interrupted.points);

        expect(get(workoutRecording).status).toBe(RecordingStatus.Paused);
        expect(getElapsedSeconds()).toBe(89);
        expect(get(currentTime)).toBe(120_000);
        expect(getRecordingData()).toHaveLength(90);

        startRecording();
        for (let s = 90; s < 96; s++) onRecordingTick(s);
        pauseRecording();

        const stored = await storedRide();
        expect(stored?.id).toBe(interrupted.id);
        expect(stored?.status).toBe('recording');
        expect(stored?.points.map((p) => p.timestamp)).toEqual(Array.from({ length: 96 }, (_, s) => s));
    });
});
