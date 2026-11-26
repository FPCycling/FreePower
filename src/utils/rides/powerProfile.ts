import type { FlattenedStep } from '../../types/workout';

export const POWER_PROFILE_BARS = 64;

/** Average watts for each slice of the ride. The slices have near-equal lengths. */
export function powerProfile(points: { power: number }[], maxBars = POWER_PROFILE_BARS): number[] {
    const bars = Math.min(maxBars, points.length);
    return Array.from({ length: bars }, (_, bar) => {
        const slice = points.slice(
            Math.floor((bar * points.length) / bars),
            Math.floor(((bar + 1) * points.length) / bars),
        );
        return Math.round(slice.reduce((sum, point) => sum + point.power, 0) / slice.length);
    });
}

/** The bars that WorkoutProfile draws. The FTP sets the zone colour of each bar. */
export function profileSteps(profile: number[] | undefined, ftp: number): FlattenedStep[] {
    return (profile ?? []).map((watts) => ({ percentFtp: (watts / ftp) * 100, duration: 1 }));
}
