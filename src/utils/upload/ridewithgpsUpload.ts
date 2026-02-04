/**
 * RideWithGPS API Upload Utilities
 *
 * Handles uploading activities to RideWithGPS
 * See: https://ridewithgps.com/api
 */

import { getValidAccessToken, type RideWithGPSTokens } from '../auth/ridewithgpsAuth';

export interface RideWithGPSUploadOptions {
    name: string;
    description?: string;
    visibility?: 0 | 1 | 2; // 0 = public, 1 = private, 2 = friends
}

export interface RideWithGPSUploadResult {
    success: boolean;
    tripId?: number;
    error?: string;
}

export interface RideWithGPSUploadContext {
    onTokenRefresh?: (tokens: RideWithGPSTokens) => void;
}

/**
 * Uploads a FIT file to RideWithGPS
 */
export async function uploadToRideWithGPS(
    fitBlob: Blob,
    tokens: RideWithGPSTokens,
    options: RideWithGPSUploadOptions,
    context?: RideWithGPSUploadContext,
): Promise<RideWithGPSUploadResult> {
    try {
        // Check if refresh token is present
        if (!tokens.refresh_token) {
            throw new Error('Refresh token required');
        }

        // Get a valid access token (refresh if needed)
        const accessToken = await getValidAccessToken(tokens);

        // If token was refreshed, notify the caller to update stored tokens
        // We need to check if a refresh happened by comparing expiry times
        const updatedTokens = await ensureValidTokens(tokens);
        if (updatedTokens !== tokens && context?.onTokenRefresh) {
            context.onTokenRefresh(updatedTokens);
        }

        const formData = new FormData();
        formData.append('file', fitBlob, 'workout.fit');
        formData.append('name', options.name);

        if (options.description) {
            formData.append('description', options.description);
        }

        if (options.visibility !== undefined) {
            formData.append('visibility', options.visibility.toString());
        }

        const response = await fetch('https://ridewithgps.com/api/v1/trips.json', {
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

        const data = await response.json();

        return {
            success: true,
            tripId: data.trip?.id,
        };
    } catch (error) {
        console.error('RideWithGPS upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}
