<script lang="ts">
    import { resolve } from '$app/paths';
    import Button from '../design/buttons/Button.svelte';
    import { interruptedRides } from '../../stores/rides';
    import { workoutRecording, RecordingStatus } from '../../routes/workout/_stores/workoutRecording';
    import { finishRide, resumeRide } from '../../utils/rides/rideActions';
    import { canResume } from '../../utils/rides/rideRules';
    import { formatTime } from '../../utils/time';

    // A closed prompt stays closed until the next page load. The ride stays in the ride list.
    let dismissed = $state(false);
    let ride = $derived($interruptedRides[0]);
    let recording = $derived($workoutRecording.status === RecordingStatus.Recording);
</script>

{#if ride && !dismissed && !recording}
    {@const id = ride.id}
    <aside
        class="fixed bottom-4 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] rounded-md bg-white dark:bg-neutral-800 p-4 shadow-xl ring-1 ring-black ring-opacity-5"
        aria-label="Unfinished ride"
    >
        <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
                <h2 class="font-bold">Unfinished ride</h2>
                <p class="truncate text-sm text-neutral-600 dark:text-neutral-400">{ride.name}</p>
                <p class="text-sm text-neutral-600 dark:text-neutral-400">
                    {formatTime(ride.elapsedSeconds)} recorded
                </p>
            </div>
            <button
                type="button"
                class="-mr-1 -mt-1 rounded-sm px-2 py-1 text-neutral-600 hover:bg-neutral-300 dark:text-neutral-400 dark:hover:bg-neutral-700"
                aria-label="Close"
                onclick={() => (dismissed = true)}>✕</button
            >
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-2">
            {#if canResume(ride)}
                <Button onclick={() => resumeRide(id)}>Resume</Button>
            {/if}
            <Button kind="outline" onclick={() => finishRide(id)}>Finish and save</Button>
            <a
                class="ml-auto text-sm text-pink-300 hover:underline"
                href={resolve('/rides')}
                onclick={() => (dismissed = true)}>All rides</a
            >
        </div>
    </aside>
{/if}
