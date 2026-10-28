import type { WorkoutStep, FlattenedStep, PowerZone, StepPower } from '../types/workout';

// Intervals.icu default power zones (%FTP upper bounds)
const DEFAULT_ZONES: PowerZone[] = [55, 75, 90, 105, 120, 150, 999].map((max, i) => ({
    id: `Z${i + 1}`,
    zone: i + 1,
    max,
}));

/**
 * Convert a zone number to %FTP using the zone's midpoint.
 * Z1 has no floor, so it gets a 10% band below its max (Z1 = 50% with default zones),
 * which matches the average watts Intervals.icu computes for zone-based workouts.
 */
function zoneToPercentFtp(zoneNumber: number, zones: PowerZone[]): number {
    const ladder = zones.filter((z) => !z.gap).sort((a, b) => a.zone - b.zone);
    const index = ladder.findIndex((z) => z.zone === zoneNumber);
    const zone = ladder[index];
    if (!zone) return 0;

    const prev = ladder[index - 1];
    const min = zone.min ?? (prev ? prev.max + 1 : zone.max - 10);
    return (min + zone.max) / 2;
}

function powerToPercentFtp(power: StepPower, zones: PowerZone[]): number {
    const value =
        power.value ?? (power.start !== undefined && power.end !== undefined ? (power.start + power.end) / 2 : 0);

    return power.units === 'power_zone' ? zoneToPercentFtp(value, zones) : value;
}

/**
 * Recursively flatten workout steps, expanding repetitions
 * @param steps Array of workout steps (potentially nested with reps)
 * @param zones Power zones from workout_doc.zoneTimes, used for zone-based targets
 * @returns Flattened array of steps
 */
export function flattenWorkoutSteps(steps: WorkoutStep[], zones: PowerZone[] = DEFAULT_ZONES): FlattenedStep[] {
    const flattened: FlattenedStep[] = [];

    for (const step of steps) {
        // If this step has nested steps with repetitions
        if (step.steps && step.reps) {
            const nestedFlattened = flattenWorkoutSteps(step.steps, zones);
            // Repeat the nested steps
            for (let i = 0; i < step.reps; i++) {
                flattened.push(...nestedFlattened);
            }
        }
        // If this step has nested steps but no reps (just execute once)
        else if (step.steps) {
            flattened.push(...flattenWorkoutSteps(step.steps, zones));
        }
        // Regular step with power and duration
        else if (step.power && step.duration) {
            flattened.push({
                percentFtp: powerToPercentFtp(step.power, zones),
                duration: step.duration,
            });
        }
    }

    return flattened;
}

/**
 * Get difficulty color based on % FTP
 * <60% = green
 * 60-75% = yellow
 * 76-90% = orange
 * 91-105% = red
 * >105% = purple
 */
export function getStepColor(percentFtp: number): string {
    if (percentFtp < 60) return '#10b981'; // green-500
    if (percentFtp < 76) return '#eab308'; // yellow-500
    if (percentFtp < 91) return '#f97316'; // orange-500
    if (percentFtp <= 105) return '#ef4444'; // red-500
    return '#a855f7'; // purple-500
}
