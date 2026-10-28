/**
 * Upload Service
 *
 * Orchestrates uploads to multiple platforms (Intervals.icu, Strava and RideWithGPS)
 */

import type { StravaTokens } from '../auth/stravaAuth';
import type { RideWithGPSTokens } from '../auth/ridewithgpsAuth';
import { uploadToStrava } from './stravaUpload';
import { uploadToRideWithGPS } from './ridewithgpsUpload';
import { uploadActivity as uploadToIntervalsIcu } from '../intervalsIcuApi';

export interface UploadOptions {
    name: string;
    description?: string;
    activityType?: 'Ride' | 'VirtualRide' | 'EBikeRide';
    trainer?: boolean;
}

export type UploadPlatform = 'intervalsicu' | 'strava' | 'ridewithgps';

export interface PlatformUploadResult {
    platform: UploadPlatform;
    success: boolean;
    activityId?: number | string;
    activityUrl?: string;
    error?: string;
}

export interface MultiUploadResult {
    results: PlatformUploadResult[];
    allSuccessful: boolean;
}

/**
 * Uploads a FIT file to selected platforms
 */
export async function uploadWorkout(
    fitBlob: Blob,
    options: UploadOptions,
    platforms: {
        intervalsicu?: { apiKey: string };
        strava?: { tokens: StravaTokens; onTokenRefresh: (tokens: StravaTokens) => void };
        ridewithgps?: { tokens: RideWithGPSTokens; onTokenRefresh: (tokens: RideWithGPSTokens) => void };
    },
): Promise<MultiUploadResult> {
    const results: PlatformUploadResult[] = [];

    // Upload to Intervals.icu first so it already has the direct upload when the Strava copy syncs in
    if (platforms.intervalsicu) {
        try {
            const activityId = await uploadToIntervalsIcu(platforms.intervalsicu.apiKey, fitBlob, {
                name: options.name,
                description: options.description,
            });

            results.push({
                platform: 'intervalsicu',
                success: true,
                activityId,
                activityUrl: activityId ? getActivityUrl('intervalsicu', activityId) : undefined,
            });
        } catch (error) {
            results.push({
                platform: 'intervalsicu',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    // Upload to Strava if configured
    if (platforms.strava) {
        try {
            const stravaResult = await uploadToStrava(fitBlob, platforms.strava.tokens, {
                name: options.name,
                description: options.description,
                activityType: options.activityType,
                trainer: options.trainer,
            });

            results.push({
                platform: 'strava',
                success: stravaResult.success,
                activityId: stravaResult.activityId,
                activityUrl: stravaResult.activityId
                    ? `https://www.strava.com/activities/${stravaResult.activityId}`
                    : undefined,
                error: stravaResult.error,
            });
        } catch (error) {
            results.push({
                platform: 'strava',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    // Upload to RideWithGPS if configured
    if (platforms.ridewithgps) {
        try {
            const rwgpsResult = await uploadToRideWithGPS(
                fitBlob,
                platforms.ridewithgps.tokens,
                {
                    name: options.name,
                    description: options.description,
                    visibility: 0, // public by default
                },
                {
                    onTokenRefresh: platforms.ridewithgps.onTokenRefresh,
                },
            );

            results.push({
                platform: 'ridewithgps',
                success: rwgpsResult.success,
                activityId: rwgpsResult.tripId,
                activityUrl: rwgpsResult.tripId ? `https://ridewithgps.com/trips/${rwgpsResult.tripId}` : undefined,
                error: rwgpsResult.error,
            });
        } catch (error) {
            results.push({
                platform: 'ridewithgps',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    const allSuccessful = results.every((r) => r.success);

    return {
        results,
        allSuccessful,
    };
}

/**
 * Generates activity URL for a platform
 */
export function getActivityUrl(platform: UploadPlatform, activityId: number | string): string {
    switch (platform) {
        case 'intervalsicu':
            return `https://intervals.icu/activities/${activityId}`;
        case 'strava':
            return `https://www.strava.com/activities/${activityId}`;
        case 'ridewithgps':
            return `https://ridewithgps.com/trips/${activityId}`;
        default:
            return '';
    }
}
