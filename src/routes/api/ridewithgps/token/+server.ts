import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_RIDEWITHGPS_APP_ID } from '$env/static/public';
import { RIDEWITHGPS_CLIENT_SECRET } from '$env/static/private';

/**
 * Exchanges authorization code for access token
 */
export const POST: RequestHandler = async ({ request, url }) => {
    try {
        const { code } = await request.json();

        if (!code) {
            return json({ error: 'Authorization code is required' }, { status: 400 });
        }

        const clientId = PUBLIC_RIDEWITHGPS_APP_ID;
        const clientSecret = RIDEWITHGPS_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return json({ error: 'RideWithGPS credentials not configured' }, { status: 500 });
        }

        const redirectUri = `${url.origin}/auth/ridewithgps/callback`;

        const response = await fetch('https://ridewithgps.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('RideWithGPS token exchange failed:', errorData);
            return json(
                { error: errorData.message || 'Failed to exchange authorization code' },
                { status: response.status },
            );
        }

        const data = await response.json();

        // Calculate expiration timestamp (RideWithGPS returns expires_in in seconds)
        const expiresAt = Math.floor(Date.now() / 1000) + (data.expires_in || 3600);

        return json({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: expiresAt,
            user: data.user,
        });
    } catch (error) {
        console.error('Error in RideWithGPS token endpoint:', error);
        return json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
};
