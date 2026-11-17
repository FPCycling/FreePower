/**
 * Strava IDs can exceed Number.MAX_SAFE_INTEGER, so we keep them as strings.
 * Pass the raw JSON body to recover a top-level ID that has no `_str` twin.
 */
export function readStravaId(data: Record<string, unknown> | null | undefined, key: string, rawJson?: string) {
    if (!data || data[key] == null) return undefined;

    const str = data[`${key}_str`];
    if (typeof str === 'string' && str) return str;

    // JSON.parse rounds integers above 2^53, so read the digits from the raw body.
    const match = rawJson?.match(new RegExp(`"${key}"\\s*:\\s*(\\d+)`));
    return match?.[1] ?? String(data[key]);
}
