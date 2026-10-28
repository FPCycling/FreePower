<script lang="ts">
    import { parseMrcFile } from '../utils/mappers/mrcMapper';
    import { writableCurrentWorkout } from './workout/_stores/currentWorkout';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { plannedWorkouts } from '../stores/plannedWorkouts';
    import { intervalsIcuApiKey, upcomingWorkoutsView, type UpcomingWorkoutsView } from '../stores/userSettings';
    import { fetchUpcomingWorkouts } from '../utils/intervalsIcuApi';
    import { addDays, startOfWeek, toDateKey } from '../utils/calendar';
    import WorkoutTile from '../components/WorkoutTile/WorkoutTile.svelte';
    import WorkoutCalendar from '../components/WorkoutCalendar/WorkoutCalendar.svelte';
    import Button from '../components/design/buttons/Button.svelte';
    import type { PlannedWorkout } from '../types/workout';

    const VIEWS: { value: UpcomingWorkoutsView; label: string }[] = [
        { value: 'list', label: 'List' },
        { value: 'calendar', label: 'Calendar' },
    ];

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
            // From the start of this week, so the calendar also shows earlier days of the week
            const today = new Date();
            const oldest = toDateKey(startOfWeek(today));
            const newest = toDateKey(addDays(today, 30));

            const workouts = await fetchUpcomingWorkouts(apiKey, oldest, newest);

            const filteredWorkouts: PlannedWorkout[] = workouts.filter(
                (w: PlannedWorkout) => w.category === 'WORKOUT' && w.workout_doc,
            );

            plannedWorkouts.set(filteredWorkouts);
        } catch (error) {
            console.error('Failed to fetch workouts:', error);
        } finally {
            isFetchingWorkouts = false;
        }
    }

    // List view: next 7 workouts from today on
    const displayWorkouts = $derived(
        $plannedWorkouts
            .filter((w) => w.start_date_local.slice(0, 10) >= toDateKey(new Date()))
            .sort((a, b) => a.start_date_local.localeCompare(b.start_date_local))
            .slice(0, 7),
    );
</script>

<h2 class="font-bold mb-5">Upload MRC file to begin</h2>

<input type="file" multiple onchange={handleFileChange} name="filename" />

<div class="mt-5">
    {#each files as file (file)}
        <button class="bg-pink-300 p-2" onclick={() => handleFileSelected(file)}> Select as current workout </button>
    {/each}
</div>

<div class="mt-10">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 class="font-bold">Upcoming Workouts</h2>
        <div class="flex items-center gap-3">
            <div
                class="inline-flex rounded-sm bg-neutral-300 dark:bg-neutral-900 p-1"
                role="group"
                aria-label="Workouts layout"
            >
                {#each VIEWS as view (view.value)}
                    <button
                        type="button"
                        class="px-3 py-1.5 text-sm font-medium rounded-sm transition-colors {$upcomingWorkoutsView ===
                        view.value
                            ? 'bg-white text-neutral-1000 shadow-sm dark:bg-neutral-700 dark:text-white'
                            : 'text-neutral-700 hover:text-neutral-1000 dark:text-neutral-400 dark:hover:text-white'}"
                        aria-pressed={$upcomingWorkoutsView === view.value}
                        onclick={() => upcomingWorkoutsView.set(view.value)}
                    >
                        {view.label}
                    </button>
                {/each}
            </div>
            <Button onclick={fetchPlannedWorkouts}>
                {isFetchingWorkouts ? 'Fetching...' : 'Fetch Workouts'}
            </Button>
        </div>
    </div>

    {#if $upcomingWorkoutsView === 'calendar'}
        <WorkoutCalendar workouts={$plannedWorkouts} />
        {#if $plannedWorkouts.length === 0}
            <p class="mt-4 text-neutral-600">No planned workouts yet. Click "Fetch Workouts" to load them.</p>
        {/if}
    {:else if displayWorkouts.length > 0}
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
