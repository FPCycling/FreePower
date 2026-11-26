import { describe, expect, it } from 'vitest';
import {
    EMPTY_STATS,
    PRUNE_AFTER_MS,
    canResume,
    defaultRideName,
    hasUpload,
    isDiscardable,
    isPrunable,
    needsAttention,
} from './rideRules';
import type { StoredRide } from './types';

const plan = { name: 'Sweet Spot', intervals: [{ startMs: 0, percentFtp: 90 }] };

function ride(overrides: Partial<StoredRide> = {}): StoredRide {
    return {
        id: 'ride-1',
        status: 'finished',
        startTime: 0,
        elapsedSeconds: 3600,
        planElapsedMs: 3_600_000,
        name: 'Ride',
        description: '',
        activityType: 'VirtualRide',
        plan,
        stats: EMPTY_STATS,
        uploads: {},
        ...overrides,
    };
}

const uploaded = { strava: { ok: true, at: 1000 } };
const failed = { strava: { ok: false, at: 1000, error: 'Rate limit' } };

describe('hasUpload', () => {
    it('is true only when a platform has the ride', () => {
        expect(hasUpload(ride())).toBe(false);
        expect(hasUpload(ride({ uploads: failed }))).toBe(false);
        expect(hasUpload(ride({ uploads: { ...failed, intervalsicu: { ok: true, at: 1 } } }))).toBe(true);
    });
});

describe('canResume', () => {
    it('allows a ride with no upload, also after a failed upload', () => {
        expect(canResume(ride())).toBe(true);
        expect(canResume(ride({ uploads: failed }))).toBe(true);
    });

    it('refuses a ride that a platform has, or a ride with no plan', () => {
        expect(canResume(ride({ uploads: uploaded }))).toBe(false);
        expect(canResume(ride({ plan: undefined }))).toBe(false);
    });
});

describe('needsAttention', () => {
    it('counts a ride with no upload, no download and no keep-local', () => {
        expect(needsAttention(ride())).toBe(true);
        expect(needsAttention(ride({ uploads: failed }))).toBe(true);
    });

    it('stops after an upload, a download or a keep-local', () => {
        expect(needsAttention(ride({ uploads: uploaded }))).toBe(false);
        expect(needsAttention(ride({ downloadedAt: 1 }))).toBe(false);
        expect(needsAttention(ride({ keptLocalAt: 1 }))).toBe(false);
    });
});

describe('isDiscardable', () => {
    it('drops a ride shorter than 1 minute', () => {
        expect(isDiscardable(ride({ elapsedSeconds: 59 }))).toBe(true);
        expect(isDiscardable(ride({ elapsedSeconds: 60 }))).toBe(false);
    });

    it('keeps a short ride that the user uploaded or downloaded', () => {
        expect(isDiscardable(ride({ elapsedSeconds: 10, uploads: uploaded }))).toBe(false);
        expect(isDiscardable(ride({ elapsedSeconds: 10, downloadedAt: 1 }))).toBe(false);
    });
});

describe('isPrunable', () => {
    const now = 1000 + PRUNE_AFTER_MS;

    it('prunes 90 days after the last successful upload', () => {
        expect(isPrunable(ride({ uploads: uploaded, lastUploadAt: 999 }), now)).toBe(true);
        expect(isPrunable(ride({ uploads: uploaded, lastUploadAt: 1000 }), now)).toBe(false);
    });

    it('never prunes a ride with no upload', () => {
        expect(isPrunable(ride({ startTime: 0 }), now * 10)).toBe(false);
        expect(isPrunable(ride({ uploads: failed, downloadedAt: 1 }), now * 10)).toBe(false);
    });
});

describe('defaultRideName', () => {
    const date = new Date(2026, 10, 26).getTime();

    it('uses the plan name and the date', () => {
        expect(defaultRideName(plan, date)).toBe(`Sweet Spot - ${new Date(date).toLocaleDateString()}`);
    });

    it('falls back when there is no plan', () => {
        expect(defaultRideName(undefined, date)).toBe(`Indoor Ride - ${new Date(date).toLocaleDateString()}`);
    });
});
