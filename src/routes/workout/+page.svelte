<script lang="ts">
    import { currentWatts, currentTime, currentWorkout, writableCurrentWorkout } from './_stores/currentWorkout';
    import { resolve } from '$app/paths';
    import { onDestroy, onMount } from 'svelte';
    import { playSound } from '../../utils/sounds';
    import Controls from './_components/Controls.svelte';
    import Stats from './_components/Stats.svelte';
    import CoachNote from './_components/CoachNote.svelte';
    import { handlePairHrClick, hrConnection, reconnectHr } from './_stores/heartRate';
    import { handlePairTrainerClick, reconnectTrainer, trainerConnection } from './_stores/trainer';
    import CompleteWorkout from './_components/CompleteWorkout.svelte';
    import DeviceChip from './_components/DeviceChip.svelte';
    import { workoutRecording, RecordingStatus } from './_stores/workoutRecording';
    import { initWorkoutOrchestrator, destroyWorkoutOrchestrator } from './_stores/workoutOrchestrator';

    let Chart: any = $state();
    let showCompleteOverlay = $state(false);
    let previousStatus: RecordingStatus | null = null;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
        const status = $workoutRecording.status;
        if (status === RecordingStatus.Recording || status === RecordingStatus.Paused) {
            e.preventDefault();
        }
    }

    onMount(async () => {
        initWorkoutOrchestrator();
        reconnectTrainer();
        reconnectHr();
        Chart = (await import('./_components/Chart.svelte')).default;

        window.addEventListener('beforeunload', handleBeforeUnload);

        currentWatts.subscribe(() => {
            if ($currentTime > 0) {
                playSound();
            }
        });
    });

    // Watch for workout completion
    $effect(() => {
        const currentStatus = $workoutRecording.status;

        // Show overlay when transitioning to Completed status
        if (currentStatus === RecordingStatus.Completed && previousStatus !== RecordingStatus.Completed) {
            if ($workoutRecording.dataPointCount > 0) {
                showCompleteOverlay = true;
            }
        }

        previousStatus = currentStatus;
    });

    function handleCloseComplete() {
        showCompleteOverlay = false;
    }

    onDestroy(() => {
        destroyWorkoutOrchestrator();
        window.removeEventListener('beforeunload', handleBeforeUnload);
    });
</script>

{#if $writableCurrentWorkout}
    <div class="flex flex-wrap items-center justify-between gap-2">
        <Controls />
        <div class="flex gap-2">
            <DeviceChip
                label="Trainer"
                pairLabel="Pair trainer"
                state={$trainerConnection}
                onclick={handlePairTrainerClick}
            />
            <DeviceChip label="HR" pairLabel="Pair HR" state={$hrConnection} onclick={handlePairHrClick} />
        </div>
    </div>
    <CoachNote />
    <Stats />

    {#if Chart}
        <Chart data={$currentWorkout?.workoutData} currentTime={$currentTime} />
    {/if}
{:else}
    <div class="mx-auto mt-16 max-w-md rounded-md bg-white dark:bg-neutral-900 p-6 text-center shadow-sm">
        <h2 class="text-lg font-bold">No workout selected</h2>
        <p class="mt-2 text-neutral-600 dark:text-neutral-400">
            Pick a starter workout, one from your Intervals.icu calendar, or load an .mrc file.
        </p>
        <a
            href={resolve('/')}
            class="mt-5 inline-block rounded-sm bg-pink-300 px-5 py-2.5 text-sm font-medium text-white hover:bg-pink-200"
            >Pick a workout</a
        >
    </div>
{/if}

{#if showCompleteOverlay}
    <CompleteWorkout onClose={handleCloseComplete} />
{/if}
