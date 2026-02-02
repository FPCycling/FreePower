/**
 * Upload Service
 * 
 * Orchestrates uploads to multiple platforms (currently Strava, extensible for RideWithGPS)
 */

import type { StravaTokens } from '../auth/stravaAuth';
import { refreshStravaToken } from '../auth/stravaAuth';
import { uploadToStrava, type StravaUploadOptions, type StravaUploadResult } from './stravaUpload';

export interface UploadOptions {
    name: string;
    description?: string;
    activityType?: 'Ride' | 'VirtualRide' | 'EBikeRide';
    trainer?: boolean;
}

export interface PlatformUploadResult {
    platform: 'strava' | 'ridewithgps';
    success: boolean;
    activityId?: number;
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
        strava?: { tokens: StravaTokens; onTokenRefresh: (tokens: StravaTokens) => void };
        // ridewithgps?: { tokens: RideWithGPSTokens; onTokenRefresh: (tokens: RideWithGPSTokens) => void };
    }
): Promise<MultiUploadResult> {
    const results: PlatformUploadResult[] = [];

    // Upload to Strava if configured
    if (platforms.strava) {
        try {
            const stravaResult = await uploadToStrava(
                fitBlob,
                platforms.strava.tokens,
                {
                    name: options.name,
                    description: options.description,
                    activityType: options.activityType,
                    trainer: options.trainer,
                }
            );

            // Check if token was refreshed and update if needed
            // This is a simplified approach - in production you might want more sophisticated token management

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

    // Future: Upload to RideWithGPS
    // if (platforms.ridewithgps) { ... }

    const allSuccessful = results.every((r) => r.success);

    return {
        results,
        allSuccessful,
    };
}

/**
 * Generates activity URL for a platform
 */
export function getActivityUrl(platform: 'strava' | 'ridewithgps', activityId: number): string {
    switch (platform) {
        case 'strava':
            return `https://www.strava.com/activities/${activityId}`;
        case 'ridewithgps':
            return `https://ridewithgps.com/trips/${activityId}`;
        default:
            return '';
    }
}
