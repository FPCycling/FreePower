import type { GenericWorkout } from '../../types/genericWorkout';
import type { WorkoutDataPoint } from '../../routes/workout/_stores/workoutRecording';
import type { WorkoutStats } from '../fitFileGenerator';
import type { UploadPlatform } from '../upload/uploadService';

export interface UploadRecord {
    ok: boolean;
    at: number; // epoch ms
    activityId?: string | number;
    activityUrl?: string;
    error?: string;
}

export interface StoredRide {
    id: string;
    /** 'recording' until Stop. A 'recording' ride that no tab holds is an interrupted ride. */
    status: 'recording' | 'finished';
    startTime: number; // epoch ms
    elapsedSeconds: number; // recording clock
    planElapsedMs: number; // position in the plan, for Resume
    name: string;
    description: string;
    activityType: 'VirtualRide' | 'Ride';
    plan?: GenericWorkout;
    stats: WorkoutStats;
    powerProfile?: number[]; // average watts per slice, for the graph in the ride list
    uploads: Partial<Record<UploadPlatform, UploadRecord>>;
    lastUploadAt?: number;
    downloadedAt?: number;
    keptLocalAt?: number;
}

/** A slice of the ride points. `seq` is the index of its first point in the ride. */
export interface RideChunk {
    rideId: string;
    seq: number;
    points: WorkoutDataPoint[];
}

/** The ride fields that the recording owns. All other fields belong to the upload dialog and the ride list. */
export type RideProgress = Pick<StoredRide, 'status' | 'elapsedSeconds' | 'planElapsedMs' | 'stats' | 'powerProfile'>;
