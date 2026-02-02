import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

/**
 * Refresh an expired access token
 */
export const POST: RequestHandler = async ({ request }) => {
    try {
        const { refresh_token } = await request.json();

        if (!refresh_token) {
            return json({ error: 'Refresh token is required' }, { status: 400 });
        }

        const STRAVA_CLIENT_SECRET = env.STRAVA_CLIENT_SECRET;
        const PUBLIC_STRAVA_APP_ID = publicEnv.PUBLIC_STRAVA_APP_ID;

        if (!STRAVA_CLIENT_SECRET || !PUBLIC_STRAVA_APP_ID) {
            console.error('Missing Strava credentials');
            return json({ error: 'Server configuration error' }, { status: 500 });
        }

        const response = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: PUBLIC_STRAVA_APP_ID,
                client_secret: STRAVA_CLIENT_SECRET,
                refresh_token,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Strava token refresh failed:', error);
            return json({ error: 'Failed to refresh token' }, { status: response.status });
        }

        const data = await response.json();

        return json({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: data.expires_at,
        });
    } catch (error) {
        console.error('Error in Strava token refresh:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
