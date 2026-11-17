/**
 * Strava API Upload Utilities
 *
 * Handles uploading activities to Strava
 * See: https://developers.strava.com/docs/reference/#api-Uploads
 */

import { getValidAccessToken, type StravaTokens } from '../auth/stravaAuth';
import { readStravaId } from '../stravaIds';

export interface StravaUploadOptions {
    name: string;
    description?: string;
    activityType?: 'Ride' | 'VirtualRide' | 'EBikeRide';
    trainer?: boolean;
}

export interface StravaUploadResult {
    success: boolean;
    activityId?: string;
    error?: string;
    uploadId?: string;
}

/**
 * Uploads a FIT file to Strava
 */
export async function uploadToStrava(
    fitBlob: Blob,
    tokens: StravaTokens,
    options: StravaUploadOptions,
): Promise<StravaUploadResult> {
    try {
        // Get a valid access token (refresh if needed)
        const accessToken = await getValidAccessToken(tokens);

        // If token was refreshed, we need to get the new tokens
        // This will be handled by the upload service that calls this function

        const formData = new FormData();
        formData.append('file', fitBlob, 'workout.fit');
        formData.append('data_type', 'fit');
        formData.append('name', options.name);

        if (options.description) {
            formData.append('description', options.description);
        }

        if (options.activityType) {
            formData.append('activity_type', options.activityType);
        }

        if (options.trainer !== undefined) {
            formData.append('trainer', options.trainer ? '1' : '0');
        }

        const response = await fetch('https://www.strava.com/api/v3/uploads', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Upload failed with status ${response.status}`);
        }

        const raw = await response.text();
        const data = JSON.parse(raw);

        // Strava returns an upload ID initially, then processes the file
        // The activity_id may be null initially
        return {
            success: true,
            uploadId: readStravaId(data, 'id', raw),
            activityId: readStravaId(data, 'activity_id', raw),
        };
    } catch (error) {
        console.error('Strava upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

/**
 * Checks the status of an upload
 * Useful for polling after initial upload since processing takes time
 */
export async function checkUploadStatus(
    uploadId: string,
    accessToken: string,
): Promise<{ status: string; activityId?: string; error?: string }> {
    try {
        const response = await fetch(`https://www.strava.com/api/v3/uploads/${uploadId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to check upload status: ${response.status}`);
        }

        const raw = await response.text();
        const data = JSON.parse(raw);

        return {
            status: data.status, // 'pending', 'processing', 'ready', or 'error'
            activityId: readStravaId(data, 'activity_id', raw),
            error: data.error,
        };
    } catch (error) {
        console.error('Error checking upload status:', error);
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
