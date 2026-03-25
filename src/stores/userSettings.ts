import { writable } from 'svelte/store';
import type { StravaTokens } from '../utils/auth/stravaAuth';
import type { RideWithGPSTokens } from '../utils/auth/ridewithgpsAuth';

let initialFtp = 200;

if (typeof window !== 'undefined' && window.localStorage) {
    const storedFtp = localStorage.getItem('userFtp');
    if (storedFtp) {
        initialFtp = Number(storedFtp);
    } else {
        localStorage.setItem('userFtp', '200');
    }
}

export const userFtp = writable<number | undefined>(initialFtp);

userFtp.subscribe((ftp) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('userFtp', `${ftp}`);
    }
});

let initialRiderWeight = 75;

if (typeof window !== 'undefined' && window.localStorage) {
    const storedWeight = localStorage.getItem('riderWeightKg');
    if (storedWeight) {
        initialRiderWeight = Number(storedWeight);
    } else {
        localStorage.setItem('riderWeightKg', '75');
    }
}

export const riderWeightKg = writable<number>(initialRiderWeight);

riderWeightKg.subscribe((weight) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('riderWeightKg', `${weight}`);
    }
});

export const difficulty = writable<number | undefined>(1);

// Intervals.icu API Key
let initialApiKey = '';

if (typeof window !== 'undefined' && window.localStorage) {
    const storedApiKey = localStorage.getItem('intervalsIcuApiKey');
    if (storedApiKey) {
        initialApiKey = storedApiKey;
    }
}

export const intervalsIcuApiKey = writable<string>(initialApiKey);

intervalsIcuApiKey.subscribe((apiKey) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        if (apiKey) {
            localStorage.setItem('intervalsIcuApiKey', apiKey);
        } else {
            localStorage.removeItem('intervalsIcuApiKey');
        }
    }
});

// Debug availability
let initialDebugAvailable = false;

if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem('isDebugAvailable');
    if (stored === null) {
        localStorage.setItem('isDebugAvailable', 'false');
    } else {
        initialDebugAvailable = stored === 'true';
    }
}

export const isDebugAvailable = writable<boolean>(initialDebugAvailable);

isDebugAvailable.subscribe((value) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('isDebugAvailable', value.toString());
    }
});

// Strava Integration
let initialStravaTokens: StravaTokens | null = null;

if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem('stravaTokens');
    if (stored) {
        try {
            initialStravaTokens = JSON.parse(stored);
        } catch (error) {
            console.error('Failed to parse stored Strava tokens:', error);
            localStorage.removeItem('stravaTokens');
        }
    }
}

export const stravaTokens = writable<StravaTokens | null>(initialStravaTokens);

stravaTokens.subscribe((tokens) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        if (tokens) {
            localStorage.setItem('stravaTokens', JSON.stringify(tokens));
        } else {
            localStorage.removeItem('stravaTokens');
        }
    }
});

// RideWithGPS Integration
let initialRideWithGPSTokens: RideWithGPSTokens | null = null;

if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem('ridewithgpsTokens');
    if (stored) {
        try {
            initialRideWithGPSTokens = JSON.parse(stored);
        } catch (error) {
            console.error('Failed to parse stored RideWithGPS tokens:', error);
            localStorage.removeItem('ridewithgpsTokens');
        }
    }
}

export const ridewithgpsTokens = writable<RideWithGPSTokens | null>(initialRideWithGPSTokens);

ridewithgpsTokens.subscribe((tokens) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        if (tokens) {
            localStorage.setItem('ridewithgpsTokens', JSON.stringify(tokens));
        } else {
            localStorage.removeItem('ridewithgpsTokens');
        }
    }
});

// Upload preferences
let initialAutoUpload = false;

if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem('autoUploadEnabled');
    if (stored !== null) {
        initialAutoUpload = stored === 'true';
    }
}

export const autoUploadEnabled = writable<boolean>(initialAutoUpload);

autoUploadEnabled.subscribe((value) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('autoUploadEnabled', value.toString());
    }
});
