import { writable, derived } from 'svelte/store';
import type { TrainerMetrics } from '../_types/trainer';

interface DebugModeState {
    enabled: boolean;
    fakeHeartRate: number;
    fakeTrainerMetrics: TrainerMetrics;
    interval: NodeJS.Timeout | null;
}

const initialState: DebugModeState = {
    enabled: false,
    fakeHeartRate: 120,
    fakeTrainerMetrics: {
        cadence: 85,
        power: 150,
        speed: 8.5,
        distance: 0,
    },
    interval: null,
};

const _debugMode = writable<DebugModeState>(initialState);

export const debugMode = derived([_debugMode], ([$_debugMode]) => {
    return {
        enabled: $_debugMode.enabled,
        fakeHeartRate: $_debugMode.fakeHeartRate,
        fakeTrainerMetrics: $_debugMode.fakeTrainerMetrics,
    };
});

// Function to generate realistic variations in the data
function generateVariation(baseValue: number, variationPercent: number): number {
    const variation = baseValue * (variationPercent / 100);
    return baseValue + (Math.random() * variation * 2 - variation);
}

function updateFakeData() {
    _debugMode.update((state) => {
        // Generate realistic variations
        const newHeartRate = Math.round(
            generateVariation(state.fakeHeartRate, 3), // ±3% variation
        );

        const newCadence = Math.round(
            generateVariation(state.fakeTrainerMetrics.cadence, 5), // ±5% variation
        );

        const newPower = Math.round(
            generateVariation(state.fakeTrainerMetrics.power, 8), // ±8% variation
        );

        const newSpeed = Number(
            generateVariation(state.fakeTrainerMetrics.speed, 4).toFixed(1), // ±4% variation
        );

        // Increment distance based on speed (speed is in m/s, add distance for 1 second)
        const newDistance = state.fakeTrainerMetrics.distance + newSpeed;

        return {
            ...state,
            fakeHeartRate: Math.max(60, Math.min(200, newHeartRate)), // Keep HR between 60-200
            fakeTrainerMetrics: {
                cadence: Math.max(0, Math.min(150, newCadence)), // Keep cadence between 0-150
                power: Math.max(0, Math.min(500, newPower)), // Keep power between 0-500
                speed: Math.max(0, newSpeed),
                distance: newDistance,
            },
        };
    });
}

export function toggleDebugMode() {
    _debugMode.update((state) => {
        const newEnabled = !state.enabled;

        // Clear existing interval if any
        if (state.interval) {
            clearInterval(state.interval);
        }

        let newInterval: NodeJS.Timeout | null = null;

        if (newEnabled) {
            // Start generating fake data every second
            newInterval = setInterval(() => {
                updateFakeData();
            }, 1000);
        }

        return {
            ...state,
            enabled: newEnabled,
            interval: newInterval,
            // Reset values when enabling debug mode
            ...(newEnabled
                ? {
                      fakeHeartRate: 120,
                      fakeTrainerMetrics: {
                          cadence: 85,
                          power: 150,
                          speed: 8.5,
                          distance: 0,
                      },
                  }
                : {}),
        };
    });
}

export function setDebugHeartRate(hr: number) {
    _debugMode.update((state) => ({
        ...state,
        fakeHeartRate: hr,
    }));
}

export function setDebugPower(power: number) {
    _debugMode.update((state) => ({
        ...state,
        fakeTrainerMetrics: {
            ...state.fakeTrainerMetrics,
            power,
        },
    }));
}

export function setDebugCadence(cadence: number) {
    _debugMode.update((state) => ({
        ...state,
        fakeTrainerMetrics: {
            ...state.fakeTrainerMetrics,
            cadence,
        },
    }));
}
