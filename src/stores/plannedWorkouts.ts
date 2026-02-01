import { writable } from 'svelte/store';
import type { PlannedWorkout } from '../types/workout';

// Initialize from localStorage
let initialWorkouts: PlannedWorkout[] = [];

if (typeof window !== 'undefined' && window.localStorage) {
    const storedWorkouts = localStorage.getItem('plannedWorkouts');
    if (storedWorkouts) {
        try {
            initialWorkouts = JSON.parse(storedWorkouts);
        } catch (e) {
            console.error('Failed to parse stored workouts:', e);
        }
    }
}

export const plannedWorkouts = writable<PlannedWorkout[]>(initialWorkouts);

// Subscribe to changes and save to localStorage
plannedWorkouts.subscribe((workouts) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('plannedWorkouts', JSON.stringify(workouts));
    }
});
