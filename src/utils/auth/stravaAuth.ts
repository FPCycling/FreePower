/**
 * Strava OAuth 2.0 Authentication Utilities
 *
 * Handles OAuth flow for Strava API authentication.
 * See: https://developers.strava.com/docs/authentication/
 */

import { PUBLIC_STRAVA_APP_ID } from '$env/static/public';

export interface StravaTokens {
    access_token: string;
    refresh_token: string;
    expires_at: number; // Unix timestamp in seconds
    athlete_id?: string;
}

/**
 * Initiates Strava OAuth flow by redirecting to Strava authorization page
 */
export function initiateStravaAuth(): void {
    const clientId = PUBLIC_STRAVA_APP_ID;
    const redirectUri = `${window.location.origin}/auth/strava/callback`;

    if (!clientId) {
        throw new Error('Strava Client ID not configured');
    }

    const scope = 'activity:write,activity:read';
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=auto&scope=${scope}`;

    window.location.href = authUrl;
}

/**
 * Exchanges authorization code for access token
 * This should be called from the OAuth callback page
 */
export async function exchangeCodeForToken(code: string): Promise<StravaTokens> {
    const response = await fetch('/api/strava/token', {
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
        athlete_id: data.athlete?.id?.toString(),
    };
}

/**
 * Refreshes an expired access token using the refresh token
 */
export async function refreshStravaToken(refreshToken: string): Promise<StravaTokens> {
    const response = await fetch('/api/strava/token/refresh', {
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
export async function getValidAccessToken(tokens: StravaTokens): Promise<string> {
    if (isTokenExpired(tokens.expires_at)) {
        const newTokens = await refreshStravaToken(tokens.refresh_token);
        // Note: The calling code should update the stored tokens
        return newTokens.access_token;
    }
    return tokens.access_token;
}

/**
 * Revokes Strava authorization
 */
export async function revokeStravaAuth(accessToken: string): Promise<void> {
    try {
        await fetch('https://www.strava.com/oauth/deauthorize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
    } catch (error) {
        console.error('Failed to revoke Strava authorization:', error);
        // Continue anyway to clear local tokens
    }
}
