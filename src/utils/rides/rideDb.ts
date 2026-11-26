import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { writable } from 'svelte/store';
import type { WorkoutDataPoint } from '../../routes/workout/_stores/workoutRecording';
import { isDiscardable, isPrunable } from './rideRules';
import type { RideChunk, RideProgress, StoredRide } from './types';

interface RideDbSchema extends DBSchema {
    rides: { key: string; value: StoredRide };
    rideChunks: { key: [string, number]; value: RideChunk };
}

/** Changes after each write, so the ride list can reload. */
export const ridesVersion = writable(0);

let dbPromise: Promise<IDBPDatabase<RideDbSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<RideDbSchema>> {
    dbPromise ??= openDB<RideDbSchema>('freepower', 1, {
        upgrade(db) {
            db.createObjectStore('rides', { keyPath: 'id' });
            db.createObjectStore('rideChunks', { keyPath: ['rideId', 'seq'] });
        },
    });
    return dbPromise;
}

export async function closeRideDb(): Promise<void> {
    (await dbPromise)?.close();
    dbPromise = null;
}

function chunkRange(rideId: string): IDBKeyRange {
    return IDBKeyRange.bound([rideId, 0], [rideId, Infinity]);
}

function progressOf(ride: StoredRide): RideProgress {
    return {
        status: ride.status,
        elapsedSeconds: ride.elapsedSeconds,
        planElapsedMs: ride.planElapsedMs,
        stats: ride.stats,
        powerProfile: ride.powerProfile,
    };
}

/**
 * Writes the recording progress and the new points in one transaction.
 * Fields that the recording does not own are kept from the stored ride.
 */
export async function saveRideProgress(
    ride: StoredRide,
    newPoints: WorkoutDataPoint[] = [],
    firstIndex = 0,
): Promise<void> {
    const tx = (await getDb()).transaction(['rides', 'rideChunks'], 'readwrite');
    const stored = await tx.objectStore('rides').get(ride.id);
    await tx.objectStore('rides').put({ ...(stored ?? ride), ...progressOf(ride) });
    if (newPoints.length > 0) {
        await tx.objectStore('rideChunks').put({ rideId: ride.id, seq: firstIndex, points: newPoints });
    }
    await tx.done;
    ridesVersion.update((n) => n + 1);
}

/** Marks the ride as finished and merges its chunks into one. */
export async function finalizeRide(ride: StoredRide, points: WorkoutDataPoint[]): Promise<void> {
    const tx = (await getDb()).transaction(['rides', 'rideChunks'], 'readwrite');
    const stored = await tx.objectStore('rides').get(ride.id);
    await tx.objectStore('rides').put({ ...(stored ?? ride), ...progressOf(ride), status: 'finished' });
    await tx.objectStore('rideChunks').delete(chunkRange(ride.id));
    if (points.length > 0) {
        await tx.objectStore('rideChunks').put({ rideId: ride.id, seq: 0, points });
    }
    await tx.done;
    ridesVersion.update((n) => n + 1);
}

/** Returns the updated ride, or undefined when the ride is not stored. */
export async function patchRide(id: string, patch: Partial<StoredRide>): Promise<StoredRide | undefined> {
    const tx = (await getDb()).transaction('rides', 'readwrite');
    const stored = await tx.store.get(id);
    const updated = stored && { ...stored, ...patch, id };
    if (updated) await tx.store.put(updated);
    await tx.done;
    if (updated) ridesVersion.update((n) => n + 1);
    return updated;
}

export async function getRide(id: string): Promise<StoredRide | undefined> {
    return (await getDb()).get('rides', id);
}

/** Newest first. */
export async function listRides(): Promise<StoredRide[]> {
    const rides = await (await getDb()).getAll('rides');
    return rides.sort((a, b) => b.startTime - a.startTime);
}

export async function getRidePoints(id: string): Promise<WorkoutDataPoint[]> {
    const chunks = await (await getDb()).getAll('rideChunks', chunkRange(id));
    return chunks.flatMap((chunk) => chunk.points);
}

export async function deleteRide(id: string): Promise<void> {
    const tx = (await getDb()).transaction(['rides', 'rideChunks'], 'readwrite');
    await tx.objectStore('rides').delete(id);
    await tx.objectStore('rideChunks').delete(chunkRange(id));
    await tx.done;
    ridesVersion.update((n) => n + 1);
}

/**
 * Deletes rides that are 90 days past their last upload, and test starts.
 * Rides in `liveIds` are open in a tab and are not touched.
 */
export async function cleanUpRides(now: number, liveIds: ReadonlySet<string>): Promise<string[]> {
    const deleted: string[] = [];
    for (const ride of await listRides()) {
        if (liveIds.has(ride.id)) continue;
        if (isPrunable(ride, now) || isDiscardable(ride)) {
            await deleteRide(ride.id);
            deleted.push(ride.id);
        }
    }
    return deleted;
}
