<script lang="ts">
    import { currentTime, currentWorkout, writableCurrentWorkout } from './_stores/currentWorkout';
    import { resolve } from '$app/paths';
    import { onDestroy, onMount } from 'svelte';
    import { playWorkoutCue } from '../../utils/sounds';
    import { getWorkoutCues } from '../../utils/workoutCues';
    import Controls from './_components/Controls.svelte';
    import Stats from './_components/Stats.svelte';
    import CoachNote from './_components/CoachNote.svelte';
    import { handlePairHrClick, hrConnection, reconnectHr } from './_stores/heartRate';
    import { handlePairTrainerClick, reconnectTrainer, trainerConnection } from './_stores/trainer';
    import DeviceChip from './_components/DeviceChip.svelte';
    import {
        workoutRecording,
        RecordingStatus,
        resetRecording,
        resumeRecording,
        getActiveRide,
        getRecordingData,
    } from './_stores/workoutRecording';
    import { initWorkoutOrchestrator, destroyWorkoutOrchestrator } from './_stores/workoutOrchestrator';
    import { rideDialog } from '../../stores/rides';
    import { backupFailed } from '../../utils/rides/rideBackup';

    let Chart: any = $state();
    let previousStatus: RecordingStatus | null = null;
    let previousTimeMs = 0;
    const unsubscribers: (() => void)[] = [];

    // The ride is on disk, so a closed tab loses no data. The prompt only prevents an accidental stop.
    function handleBeforeUnload(e: BeforeUnloadEvent) {
        if ($workoutRecording.status === RecordingStatus.Recording) {
            e.preventDefault();
        }
    }

    onMount(async () => {
        initWorkoutOrchestrator();
        reconnectTrainer();
        reconnectHr();
        Chart = (await import('./_components/Chart.svelte')).default;

        window.addEventListener('beforeunload', handleBeforeUnload);

        unsubscribers.push(
            currentTime.subscribe((timeMs) => {
                if ($workoutRecording.status === RecordingStatus.Recording) {
                    getWorkoutCues($currentWorkout, previousTimeMs, timeMs).forEach(playWorkoutCue);
                }
                previousTimeMs = timeMs;
            }),
        );
    });

    // Watch for workout completion
    $effect(() => {
        const currentStatus = $workoutRecording.status;

        // Show the dialog when transitioning to Completed status
        if (currentStatus === RecordingStatus.Completed && previousStatus !== RecordingStatus.Completed) {
            const ride = getActiveRide();
            if (ride && $workoutRecording.dataPointCount > 0) {
                rideDialog.set({
                    ride,
                    points: getRecordingData(),
                    justFinished: true,
                    onResume: resumeRecording,
                    onClose: handleRideDone,
                });
            }
        }

        previousStatus = currentStatus;
    });

    // The ride is in the history, so the controls go back to Start.
    function handleRideDone() {
        currentTime.reset();
        resetRecording();
    }

    onDestroy(() => {
        unsubscribers.forEach((unsubscribe) => unsubscribe());
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
    {#if $backupFailed}
        <p
            class="mt-2 rounded-sm bg-red-100 dark:bg-red-950 px-3 py-2 text-sm text-red-700 dark:text-red-300"
            role="alert"
        >
            Backup off: the browser cannot save this ride to disk. Keep this tab open until you upload or export the
            ride.
        </p>
    {/if}
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
