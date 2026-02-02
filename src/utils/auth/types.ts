/**
 * Shared types for authentication across platforms
 * This allows easy extension for RideWithGPS and other platforms
 */

export interface PlatformTokens {
    access_token: string;
    refresh_token: string;
    expires_at: number; // Unix timestamp in seconds
    user_id?: string;
}

export type Platform = 'strava' | 'ridewithgps';

export interface UploadPlatform {
    id: Platform;
    name: string;
    connected: boolean;
    tokens?: PlatformTokens;
}
