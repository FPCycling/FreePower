import type { GenericWorkout } from '../../types/genericWorkout';
import type { WorkoutStats } from '../fitFileGenerator';
import type { StoredRide } from './types';

export const MIN_RIDE_SECONDS = 60;
export const PRUNE_AFTER_MS = 90 * 24 * 60 * 60 * 1000;

export const EMPTY_STATS: WorkoutStats = {
    totalDuration: 0,
    avgPower: 0,
    maxPower: 0,
    avgHeartRate: 0,
    maxHeartRate: 0,
    avgCadence: 0,
    totalDistance: 0,
};

export function hasUpload(ride: StoredRide): boolean {
    return Object.values(ride.uploads).some((upload) => upload?.ok);
}

/** A ride can continue until a platform has it. */
export function canResume(ride: StoredRide): boolean {
    return !hasUpload(ride) && !!ride.plan;
}

/** The banner counts a ride until the user uploads it, downloads it or keeps it local. */
export function needsAttention(ride: StoredRide): boolean {
    return !hasUpload(ride) && !ride.downloadedAt && !ride.keptLocalAt;
}

/** Test starts are dropped so they do not fill the list. */
export function isDiscardable(ride: StoredRide): boolean {
    return ride.elapsedSeconds < MIN_RIDE_SECONDS && !hasUpload(ride) && !ride.downloadedAt;
}

export function isPrunable(ride: StoredRide, now: number): boolean {
    return hasUpload(ride) && ride.lastUploadAt !== undefined && now - ride.lastUploadAt > PRUNE_AFTER_MS;
}

export function defaultRideName(plan: GenericWorkout | undefined, startTime: number): string {
    return `${plan?.name || 'Indoor Ride'} - ${new Date(startTime).toLocaleDateString()}`;
}
