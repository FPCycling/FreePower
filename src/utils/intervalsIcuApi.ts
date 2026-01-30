/**
 * Intervals.icu API client
 * Uses basic authentication with username "API_KEY" and API key as password
 */

const BASE_URL = 'https://intervals.icu/api/v1';

/**
 * Fetch upcoming planned workouts (events) from intervals.icu
 * @param apiKey The user's intervals.icu API key
 * @param oldest Optional oldest date (ISO format: YYYY-MM-DD)
 * @param newest Optional newest date (ISO format: YYYY-MM-DD)
 * @returns Array of events (planned workouts)
 */
export async function fetchUpcomingWorkouts(apiKey: string, oldest?: string, newest?: string) {
    if (!apiKey) {
        throw new Error('API key is required');
    }

    // Use athlete id "0" which represents the authenticated user
    const athleteId = '0';

    // Build query parameters
    const params = new URLSearchParams();
    if (oldest) params.append('oldest', oldest);
    if (newest) params.append('newest', newest);

    const queryString = params.toString();
    const url = `${BASE_URL}/athlete/${athleteId}/events${queryString ? `?${queryString}` : ''}`;

    // Use basic auth: username is "API_KEY", password is the actual API key
    const authHeader = 'Basic ' + btoa(`API_KEY:${apiKey}`);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: authHeader,
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch workouts: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Get athlete profile
 * @param apiKey The user's intervals.icu API key
 */
export async function getAthleteProfile(apiKey: string) {
    if (!apiKey) {
        throw new Error('API key is required');
    }

    const athleteId = '0';
    const url = `${BASE_URL}/athlete/${athleteId}`;
    const authHeader = 'Basic ' + btoa(`API_KEY:${apiKey}`);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: authHeader,
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch athlete profile: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}
