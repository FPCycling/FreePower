import type { WorkoutStep, FlattenedStep } from '../types/workout';

// CdA for road bike, hoods position (m²)
const CDA = 0.32;
// Air density at sea level (kg/m³)
const RHO = 1.225;
// Rolling resistance coefficient
const CRR = 0.004;
// Gravity (m/s²)
const G = 9.81;

/**
 * Convert power output to virtual speed using cycling physics.
 * Solves P = k_aero * v³ + k_roll * v via Newton-Raphson.
 * @param power Watts
 * @param riderMassKg Total rider + bike mass (kg)
 * @returns Speed in m/s
 */
export function powerToSpeed(power: number, riderMassKg: number): number {
    if (power <= 0) return 0;

    const kAero = 0.5 * CDA * RHO;
    const kRoll = CRR * riderMassKg * G;

    let v = 5; // initial guess: ~18 km/h
    for (let i = 0; i < 20; i++) {
        const f = kAero * v * v * v + kRoll * v - power;
        const df = 3 * kAero * v * v + kRoll;
        const delta = f / df;
        v -= delta;
        if (Math.abs(delta) < 1e-6) break;
    }
    return Math.max(0, v);
}

/**
 * Recursively flatten workout steps, expanding repetitions
 * @param steps Array of workout steps (potentially nested with reps)
 * @returns Flattened array of steps
 */
export function flattenWorkoutSteps(steps: WorkoutStep[]): FlattenedStep[] {
    const flattened: FlattenedStep[] = [];

    for (const step of steps) {
        // If this step has nested steps with repetitions
        if (step.steps && step.reps) {
            const nestedFlattened = flattenWorkoutSteps(step.steps);
            // Repeat the nested steps
            for (let i = 0; i < step.reps; i++) {
                flattened.push(...nestedFlattened);
            }
        }
        // If this step has nested steps but no reps (just execute once)
        else if (step.steps) {
            flattened.push(...flattenWorkoutSteps(step.steps));
        }
        // Regular step with power and duration
        else if (step.power && step.duration) {
            flattened.push({
                percentFtp: step.power.value,
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
