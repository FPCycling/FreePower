import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

/**
 * Refreshes an expired access token
 */
export const POST: RequestHandler = async ({ request }) => {
    try {
        const { refresh_token } = await request.json();

        if (!refresh_token) {
            return json({ error: 'Refresh token is required' }, { status: 400 });
        }

        const clientId = publicEnv.PUBLIC_RIDEWITHGPS_APP_ID;
        const clientSecret = env.RIDEWITHGPS_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return json({ error: 'RideWithGPS credentials not configured' }, { status: 500 });
        }

        const response = await fetch('https://ridewithgps.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refresh_token,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('RideWithGPS token refresh failed:', errorData);
            return json({ error: errorData.message || 'Failed to refresh token' }, { status: response.status });
        }

        const data = await response.json();

        // Calculate expiration timestamp
        const expiresAt = Math.floor(Date.now() / 1000) + (data.expires_in || 3600);

        return json({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: expiresAt,
        });
    } catch (error) {
        console.error('Error in RideWithGPS token refresh endpoint:', error);
        return json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
};
