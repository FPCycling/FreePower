import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { get } from 'svelte/store';
import { writableCurrentWorkout } from '../../routes/workout/_stores/currentWorkout';
import {
    RecordingStatus,
    restoreRecording,
    syncActiveRide,
    workoutRecording,
    type WorkoutDataPoint,
} from '../../routes/workout/_stores/workoutRecording';
import { rideDialog } from '../../stores/rides';
import { downloadFitFile, generateFitFile } from '../fitFileGenerator';
import { deleteRide, finalizeRide, getRide, getRidePoints, patchRide } from './rideDb';
import { canResume } from './rideRules';
import type { StoredRide } from './types';

async function loadRide(id: string): Promise<{ ride: StoredRide; points: WorkoutDataPoint[] } | null> {
    const ride = await getRide(id);
    return ride ? { ride, points: await getRidePoints(id) } : null;
}

/** Changes a ride on disk, and in memory if the workout page has it. */
export async function updateRide(id: string, patch: Partial<StoredRide>): Promise<void> {
    syncActiveRide(id, patch);
    try {
        await patchRide(id, patch);
    } catch (error) {
        console.error('Failed to save the ride:', error);
    }
}

/** Opens a ride from the history on the workout page, paused at the point where it stopped. */
export async function resumeRide(id: string): Promise<void> {
    if (get(workoutRecording).status === RecordingStatus.Recording) return;

    const loaded = await loadRide(id);
    if (!loaded || !canResume(loaded.ride)) return;

    rideDialog.set(null);
    writableCurrentWorkout.set(loaded.ride.plan);
    restoreRecording(loaded.ride, loaded.points);
    await goto(resolve('/workout'));
}

/** Ends an interrupted ride and opens the upload dialog. */
export async function finishRide(id: string): Promise<void> {
    const loaded = await loadRide(id);
    if (!loaded) return;

    const ride: StoredRide = { ...loaded.ride, status: 'finished' };
    await finalizeRide(ride, loaded.points);
    rideDialog.set({ ride, points: loaded.points });
}

export async function openRideUpload(id: string): Promise<void> {
    const loaded = await loadRide(id);
    if (loaded) rideDialog.set(loaded);
}

export async function downloadRideFit(ride: StoredRide, points: WorkoutDataPoint[]): Promise<void> {
    const startTime = new Date(ride.startTime);
    downloadFitFile(generateFitFile(points, startTime), startTime);
    await updateRide(ride.id, { downloadedAt: Date.now() });
}

export async function downloadRide(id: string): Promise<void> {
    const loaded = await loadRide(id);
    if (loaded) await downloadRideFit(loaded.ride, loaded.points);
}

export function keepRideLocal(id: string): Promise<void> {
    return updateRide(id, { keptLocalAt: Date.now() });
}

export function removeRide(id: string): Promise<void> {
    return deleteRide(id);
}
