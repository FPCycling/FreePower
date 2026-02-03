/**
 * RideWithGPS OAuth 2.0 Authentication Utilities
 *
 * Handles OAuth flow for RideWithGPS API authentication.
 * See: https://ridewithgps.com/api
 */

import { PUBLIC_RIDEWITHGPS_APP_ID } from '$env/static/public';

export interface RideWithGPSTokens {
    access_token: string;
    refresh_token: string;
    expires_at: number; // Unix timestamp in seconds
    user_id?: string;
}

/**
 * Initiates RideWithGPS OAuth flow by redirecting to authorization page
 */
export function initiateRideWithGPSAuth(): void {
    const clientId = PUBLIC_RIDEWITHGPS_APP_ID;
    const redirectUri = `${window.location.origin}/auth/ridewithgps/callback`;

    if (!clientId) {
        throw new Error('RideWithGPS Client ID not configured');
    }

    // RideWithGPS doesn't require scope parameter or uses different values
    const authUrl = `https://ridewithgps.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location.href = authUrl;
}

/**
 * Exchanges authorization code for access token
 * This should be called from the OAuth callback page
 */
export async function exchangeCodeForToken(code: string): Promise<RideWithGPSTokens> {
    const response = await fetch('/api/ridewithgps/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to exchange code for token: ${error}`);
    }

    const data = await response.json();

    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        user_id: data.user?.id?.toString(),
    };
}

/**
 * Refreshes an expired access token using the refresh token
 */
export async function refreshRideWithGPSToken(refreshToken: string): Promise<RideWithGPSTokens> {
    const response = await fetch('/api/ridewithgps/token/refresh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to refresh token: ${error}`);
    }

    const data = await response.json();

    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
    };
}

/**
 * Checks if a token is expired or will expire soon (within 5 minutes)
 */
export function isTokenExpired(expiresAt: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60;
    return expiresAt <= now + fiveMinutes;
}

/**
 * Gets a valid access token, refreshing if necessary
 */
export async function getValidAccessToken(tokens: RideWithGPSTokens): Promise<string> {
    if (isTokenExpired(tokens.expires_at)) {
        const newTokens = await refreshRideWithGPSToken(tokens.refresh_token);
        // Note: The calling code should update the stored tokens
        return newTokens.access_token;
    }
    return tokens.access_token;
}

/**
 * Ensures tokens are valid, returning refreshed tokens if needed
 * Use this when you need both the access token and updated token info
 */
export async function ensureValidTokens(tokens: RideWithGPSTokens): Promise<RideWithGPSTokens> {
    if (isTokenExpired(tokens.expires_at)) {
        return await refreshRideWithGPSToken(tokens.refresh_token);
    }
    return tokens;
}

/**
 * Revokes RideWithGPS authorization
 */
export async function revokeRideWithGPSAuth(accessToken: string): Promise<void> {
    try {
        await fetch('https://ridewithgps.com/oauth/revoke', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    } catch (error) {
        console.error('Failed to revoke RideWithGPS authorization:', error);
        // Continue anyway to clear local tokens
    }
}
