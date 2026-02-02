import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

/**
 * Exchange authorization code for access token
 */
export const POST: RequestHandler = async ({ request }) => {
    try {
        const { code } = await request.json();

        if (!code) {
            return json({ error: 'Authorization code is required' }, { status: 400 });
        }

        const STRAVA_CLIENT_SECRET = env.STRAVA_CLIENT_SECRET;
        const PUBLIC_STRAVA_CLIENT_ID = publicEnv.PUBLIC_STRAVA_CLIENT_ID;

        if (!STRAVA_CLIENT_SECRET || !PUBLIC_STRAVA_CLIENT_ID) {
            console.error('Missing Strava credentials');
            return json({ error: 'Server configuration error' }, { status: 500 });
        }

        const redirectUri = `${request.url.split('/api')[0]}/auth/strava/callback`;

        const response = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: PUBLIC_STRAVA_CLIENT_ID,
                client_secret: STRAVA_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Strava token exchange failed:', error);
            return json({ error: 'Failed to exchange authorization code' }, { status: response.status });
        }

        const data = await response.json();

        return json({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: data.expires_at,
            athlete: data.athlete,
        });
    } catch (error) {
        console.error('Error in Strava token exchange:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
