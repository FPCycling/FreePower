<script lang="ts">
    import { parseMrcFile } from '../utils/mappers/mrcMapper';
    import { writableCurrentWorkout } from './workout/_stores/currentWorkout';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { plannedWorkouts } from '../stores/plannedWorkouts';
    import { intervalsIcuApiKey } from '../stores/userSettings';
    import { fetchUpcomingWorkouts } from '../utils/intervalsIcuApi';
    import WorkoutTile from '../components/WorkoutTile/WorkoutTile.svelte';
    import Button from '../components/design/buttons/Button.svelte';
    import type { PlannedWorkout } from '../types/workout';

    let files = $state<string[]>([]);
    let isFetchingWorkouts = $state(false);

    function handleFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const newFile = input?.files?.[0];

        if (!newFile) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            if (e.target?.result) {
                files = [...files, e.target.result as string];
            }
        };
        reader.readAsText(newFile);
    }

    async function handleFileSelected(file: string) {
        writableCurrentWorkout.set(parseMrcFile(file));
        goto(resolve('/workout'));
    }

    async function fetchPlannedWorkouts() {
        const apiKey = $intervalsIcuApiKey;
        if (!apiKey) {
            return;
        }

        isFetchingWorkouts = true;
        try {
            // Get today's date in ISO format (YYYY-MM-DD)
            const today = new Date().toISOString().split('T')[0];
            // Get date 30 days from now
            const newest = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const workouts = await fetchUpcomingWorkouts(apiKey, today, newest);

            // Filter only WORKOUT category and limit to 7
            const filteredWorkouts: PlannedWorkout[] = workouts
                .filter((w: PlannedWorkout) => w.category === 'WORKOUT' && w.workout_doc)
                .slice(0, 7);

            plannedWorkouts.set(filteredWorkouts);
        } catch (error) {
            console.error('Failed to fetch workouts:', error);
        } finally {
            isFetchingWorkouts = false;
        }
    }

    // Get workouts to display (limit to 7)
    const displayWorkouts = $derived($plannedWorkouts.slice(0, 7));
</script>

<h2 class="font-bold mb-5">Upload MRC file to begin</h2>

<input type="file" multiple onchange={handleFileChange} name="filename" />

<div class="mt-5">
    {#each files as file (file)}
        <button class="bg-pink-300 p-2" onclick={() => handleFileSelected(file)}> Select as current workout </button>
    {/each}
</div>

<div class="mt-10">
    <div class="flex items-center justify-between mb-5">
        <h2 class="font-bold">Upcoming Workouts</h2>
        <Button onclick={fetchPlannedWorkouts}>
            {isFetchingWorkouts ? 'Fetching...' : 'Fetch Workouts'}
        </Button>
    </div>

    {#if displayWorkouts.length > 0}
        <div class="workouts-grid">
            {#each displayWorkouts as workout (workout.id)}
                <WorkoutTile {workout} />
            {/each}
        </div>
    {:else}
        <p class="text-gray-500">No upcoming workouts. Click "Fetch Workouts" to load them.</p>
    {/if}
</div>

<style>
    .workouts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
    }
</style>
