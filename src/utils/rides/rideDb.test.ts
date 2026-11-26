import { IDBFactory } from 'fake-indexeddb';
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import type { WorkoutDataPoint } from '../../routes/workout/_stores/workoutRecording';
import {
    cleanUpRides,
    closeRideDb,
    deleteRide,
    finalizeRide,
    getRide,
    getRidePoints,
    listRides,
    patchRide,
    saveRideProgress,
} from './rideDb';
import { EMPTY_STATS, PRUNE_AFTER_MS } from './rideRules';
import type { StoredRide } from './types';

function ride(overrides: Partial<StoredRide> = {}): StoredRide {
    return {
        id: 'ride-1',
        status: 'recording',
        startTime: 0,
        elapsedSeconds: 3600,
        planElapsedMs: 0,
        name: 'Ride',
        description: '',
        activityType: 'VirtualRide',
        stats: EMPTY_STATS,
        uploads: {},
        ...overrides,
    };
}

function points(from: number, to: number): WorkoutDataPoint[] {
    return Array.from({ length: to - from }, (_, i) => ({
        timestamp: from + i,
        power: 200,
        heartRate: 140,
        cadence: 90,
        speed: 8,
        distance: (from + i) * 8,
        targetPower: 200,
    }));
}

beforeEach(async () => {
    await closeRideDb();
    globalThis.indexedDB = new IDBFactory();
});

describe('saveRideProgress', () => {
    it('stores the ride and returns its chunks in order', async () => {
        await saveRideProgress(ride(), points(0, 5), 0);
        await saveRideProgress(ride({ elapsedSeconds: 12 }), points(5, 12), 5);
        // A chunk of a different ride must not leak in.
        await saveRideProgress(ride({ id: 'ride-10' }), points(100, 103), 0);

        expect((await getRide('ride-1'))?.elapsedSeconds).toBe(12);
        expect((await getRidePoints('ride-1')).map((p) => p.timestamp)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });

    it('keeps the fields that the recording does not own', async () => {
        await saveRideProgress(ride());
        await patchRide('ride-1', { name: 'Renamed', uploads: { strava: { ok: false, at: 1, error: 'x' } } });

        await saveRideProgress(ride({ elapsedSeconds: 20, name: 'Stale name' }));

        const stored = await getRide('ride-1');
        expect(stored?.name).toBe('Renamed');
        expect(stored?.uploads.strava?.error).toBe('x');
        expect(stored?.elapsedSeconds).toBe(20);
    });
});

describe('finalizeRide', () => {
    it('marks the ride finished and merges the chunks', async () => {
        await saveRideProgress(ride(), points(0, 5), 0);
        await saveRideProgress(ride(), points(5, 10), 5);

        await finalizeRide(ride({ elapsedSeconds: 10 }), points(0, 11));

        expect((await getRide('ride-1'))?.status).toBe('finished');
        expect(await getRidePoints('ride-1')).toHaveLength(11);
    });

    it('accepts more points after a resume', async () => {
        await finalizeRide(ride(), points(0, 10));
        await saveRideProgress(ride({ status: 'recording' }), points(10, 15), 10);

        expect((await getRide('ride-1'))?.status).toBe('recording');
        expect((await getRidePoints('ride-1')).at(-1)?.timestamp).toBe(14);
    });
});

describe('patchRide', () => {
    it('does not create a ride that is not stored', async () => {
        expect(await patchRide('missing', { name: 'x' })).toBeUndefined();
        expect(await listRides()).toEqual([]);
    });
});

describe('listRides', () => {
    it('returns the newest ride first', async () => {
        await saveRideProgress(ride({ id: 'old', startTime: 1 }));
        await saveRideProgress(ride({ id: 'new', startTime: 2 }));

        expect((await listRides()).map((r) => r.id)).toEqual(['new', 'old']);
    });
});

describe('deleteRide', () => {
    it('deletes the ride and its points only', async () => {
        await saveRideProgress(ride(), points(0, 5), 0);
        await saveRideProgress(ride({ id: 'ride-2' }), points(0, 5), 0);

        await deleteRide('ride-1');

        expect(await getRide('ride-1')).toBeUndefined();
        expect(await getRidePoints('ride-1')).toEqual([]);
        expect(await getRidePoints('ride-2')).toHaveLength(5);
    });
});

describe('cleanUpRides', () => {
    const now = 10 * PRUNE_AFTER_MS;
    const uploaded = { strava: { ok: true, at: 1 } };

    it('deletes old uploaded rides and test starts, and keeps the rest', async () => {
        await saveRideProgress(ride({ id: 'old-upload', uploads: uploaded, lastUploadAt: 1 }));
        await saveRideProgress(ride({ id: 'new-upload', uploads: uploaded, lastUploadAt: now - 1000 }));
        await saveRideProgress(ride({ id: 'old-not-uploaded' }));
        await saveRideProgress(ride({ id: 'test-start', elapsedSeconds: 12 }));

        const deleted = await cleanUpRides(now, new Set());

        expect(deleted.sort()).toEqual(['old-upload', 'test-start']);
        expect((await listRides()).map((r) => r.id).sort()).toEqual(['new-upload', 'old-not-uploaded']);
    });

    it('does not touch a ride that is open in a tab', async () => {
        await saveRideProgress(ride({ id: 'just-started', elapsedSeconds: 12 }));

        expect(await cleanUpRides(now, new Set(['just-started']))).toEqual([]);
    });
});
