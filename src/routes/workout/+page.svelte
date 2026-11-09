<script lang="ts">
    import { currentWatts, currentTime, currentWorkout } from './_stores/currentWorkout';
    import { onDestroy, onMount } from 'svelte';
    import { playSound } from '../../utils/sounds';
    import Controls from './_components/Controls.svelte';
    import Stats from './_components/Stats.svelte';
    import CoachNote from './_components/CoachNote.svelte';
    import { handlePairHrClick, hrConnected } from './_stores/heartRate';
    import { handlePairTrainerClick, trainerConnected } from './_stores/trainer';
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

<div class="flex flex-wrap items-center justify-between gap-2">
    <Controls />
    <div class="flex gap-2">
        <DeviceChip
            label="Trainer"
            pairLabel="Pair trainer"
            connected={$trainerConnected}
            onclick={handlePairTrainerClick}
        />
        <DeviceChip label="HR" pairLabel="Pair HR" connected={$hrConnected} onclick={handlePairHrClick} />
    </div>
</div>
<CoachNote />
<Stats />

{#if Chart}
    <Chart data={$currentWorkout?.workoutData} currentTime={$currentTime} />
{/if}

{#if showCompleteOverlay}
    <CompleteWorkout onClose={handleCloseComplete} />
{/if}
