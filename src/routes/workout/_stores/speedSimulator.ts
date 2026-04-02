// CdA for road bike, hoods position (m²)
const CDA = 0.32;
// Air density at sea level (kg/m³)
const RHO = 1.225;
// Rolling resistance coefficient
const CRR = 0.004;
// Gravity (m/s²)
const G = 9.81;
const BIKE_MASS_KG = 8; // typical road/trainer bike mass (kg)

let _currentSpeedMs = 0; // persistent speed state for inertia simulation

/**
 * Simulate speed for one 1-second tick using cycling physics with inertia.
 * Sub-steps are used for numerical stability.
 */
export function simulateSpeed(power: number, riderMassKg: number): number {
    const totalMass = riderMassKg + BIKE_MASS_KG;
    const kAero = 0.5 * CDA * RHO;
    const kRoll = CRR * totalMass * G;

    // 10 sub-steps of 0.1s each for numerical stability
    const SUB_STEPS = 10;
    const dt = 1.0 / SUB_STEPS;

    let v = _currentSpeedMs;
    for (let i = 0; i < SUB_STEPS; i++) {
        const vSafe = Math.max(v, 1.0); // prevent division by zero at near-standstill
        const fDrive = power / vSafe;
        const fResist = kAero * v * v + kRoll;
        const fNet = fDrive - fResist;
        v = Math.max(0, v + (fNet / totalMass) * dt);
    }

    _currentSpeedMs = v;
    const randomFactor = 1 + (Math.random() - 0.5) * 0.016; // ±0.8% jitter
    return v * randomFactor;
}

export function resetSpeed(): void {
    _currentSpeedMs = 0;
}
