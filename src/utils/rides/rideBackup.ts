import { writable, type Readable } from 'svelte/store';
import type { WorkoutDataPoint } from '../../routes/workout/_stores/workoutRecording';
import { deleteRide, finalizeRide, getRide, ridesVersion, saveRideProgress } from './rideDb';
import { isDiscardable } from './rideRules';
import type { StoredRide } from './types';

const LOCK_PREFIX = 'freepower-ride:';

interface Session {
    rideId: string;
    /** Count of points that are on disk. */
    flushed: number;
    release: () => Promise<void>;
}

const _backupFailed = writable(false);
/** True when the last write to disk failed. The ride then lives in memory only. */
export const backupFailed: Readable<boolean> = { subscribe: _backupFailed.subscribe };

let session: Session | null = null;
// Writes run one at a time and in order, so a chunk never lands before the chunk it follows.
let queue: Promise<void> = Promise.resolve();

function enqueue(task: () => Promise<void>): Promise<void> {
    queue = queue.then(task).then(
        () => _backupFailed.set(false),
        (error) => {
            console.error('Ride backup failed:', error);
            _backupFailed.set(true);
        },
    );
    return queue;
}

/**
 * Holds a Web Lock while this tab has the ride, so other tabs can tell a live ride from an interrupted ride.
 * Resolves with the function that releases the lock.
 */
function holdLock(rideId: string): Promise<() => Promise<void>> {
    if (typeof navigator === 'undefined' || !navigator.locks) return Promise.resolve(async () => {});

    return new Promise((resolveHeld) => {
        let unlock = () => {};
        const done = navigator.locks
            .request(LOCK_PREFIX + rideId, { ifAvailable: true }, (lock) => {
                const held = lock ? new Promise<void>((resolve) => (unlock = resolve)) : undefined;
                resolveHeld(async () => {
                    unlock();
                    await done;
                });
                return held;
            })
            .catch(() => {});
    });
}

/** The ids of the rides that a tab has open. */
export async function liveRideIds(): Promise<Set<string>> {
    const ids = new Set<string>();
    if (session) ids.add(session.rideId);
    if (typeof navigator !== 'undefined' && navigator.locks) {
        for (const lock of (await navigator.locks.query()).held ?? []) {
            if (lock.name?.startsWith(LOCK_PREFIX)) ids.add(lock.name.slice(LOCK_PREFIX.length));
        }
    }
    return ids;
}

/** Starts the backup of a ride. `flushed` is the count of its points that are on disk already. */
export function attachRide(rideId: string, flushed = 0): void {
    const current: Session = { rideId, flushed, release: async () => {} };
    session = current;
    if (typeof navigator !== 'undefined') void navigator.storage?.persist?.();
    void enqueue(async () => {
        current.release = await holdLock(rideId);
    });
}

/** Writes the ride progress and the points that are not on disk yet. */
export function queueSave(ride: StoredRide, points: WorkoutDataPoint[]): Promise<void> {
    const current = session;
    if (current?.rideId !== ride.id) return queue;
    return enqueue(async () => {
        await saveRideProgress(ride, points.slice(current.flushed), current.flushed);
        current.flushed = points.length;
    });
}

export function queueFinish(ride: StoredRide, points: WorkoutDataPoint[]): Promise<void> {
    const current = session;
    if (current?.rideId !== ride.id) return queue;
    return enqueue(async () => {
        await finalizeRide(ride, points);
        current.flushed = points.length;
    });
}

/** Ends the backup. The ride stays in the history as finished, or is deleted if it is a test start. */
export function releaseRide(ride: StoredRide, points: WorkoutDataPoint[]): Promise<void> {
    const current = session;
    if (current?.rideId !== ride.id) return queue;
    session = null;
    return enqueue(async () => {
        try {
            const stored = (await getRide(ride.id)) ?? ride;
            if (isDiscardable({ ...stored, elapsedSeconds: ride.elapsedSeconds })) await deleteRide(ride.id);
            else if (stored.status !== 'finished' || current.flushed < points.length) await finalizeRide(ride, points);
        } finally {
            await current.release();
            ridesVersion.update((n) => n + 1);
        }
    });
}

/** Resolves when all queued writes are done. */
export function backupIdle(): Promise<void> {
    return queue;
}
