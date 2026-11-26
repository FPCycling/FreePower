import { derived, writable } from 'svelte/store';
import type { WorkoutDataPoint } from '../routes/workout/_stores/workoutRecording';
import { liveRideIds } from '../utils/rides/rideBackup';
import { cleanUpRides, listRides, ridesVersion } from '../utils/rides/rideDb';
import { needsAttention } from '../utils/rides/rideRules';
import type { StoredRide } from '../utils/rides/types';

export interface RideListItem extends StoredRide {
    /** A tab has this ride open. */
    live: boolean;
}

export const rides = writable<RideListItem[]>([]);

/** Rides that ended without a Stop: a crash, a reload or a closed tab. */
export const interruptedRides = derived(rides, ($rides) =>
    $rides.filter((ride) => ride.status === 'recording' && !ride.live),
);

export const attentionCount = derived(
    rides,
    ($rides) => $rides.filter((ride) => !ride.live && needsAttention(ride)).length,
);

let lastRefresh = 0;

async function refreshRides(): Promise<void> {
    const refresh = ++lastRefresh;
    try {
        const [stored, live] = await Promise.all([listRides(), liveRideIds()]);
        // A slower, older read must not replace a newer one.
        if (refresh === lastRefresh) rides.set(stored.map((ride) => ({ ...ride, live: live.has(ride.id) })));
    } catch (error) {
        console.error('Failed to load the rides:', error);
    }
}

let watching = false;

/** Deletes expired rides once, then keeps the list in line with the database. */
export async function watchRides(): Promise<void> {
    if (watching) return;
    watching = true;

    try {
        await cleanUpRides(Date.now(), await liveRideIds());
    } catch (error) {
        console.error('Failed to clean up the rides:', error);
    }

    ridesVersion.subscribe(() => void refreshRides());
    // A different tab can change the rides while this tab is hidden.
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void refreshRides();
    });
}

export interface RideDialogRequest {
    ride: StoredRide;
    points: WorkoutDataPoint[];
    /** The ride stopped on the workout page a moment ago. */
    justFinished?: boolean;
    onResume?: () => void;
    onClose?: () => void;
}

/** The ride that the upload dialog shows. The dialog lives in the root layout. */
export const rideDialog = writable<RideDialogRequest | null>(null);
