<script lang="ts">
    import { currentWatts, currentTime, currentWorkout } from './_stores/currentWorkout';
    import { onDestroy, onMount } from 'svelte';
    import { playSound } from '../../utils/sounds';
    import Controls from './_components/Controls.svelte';
    import Stats from './_components/Stats.svelte';
    import { handlePairHrClick } from './_stores/heartRate';
    import { handlePairTrainerClick } from './_stores/trainer';
    import CompleteWorkout from './_components/CompleteWorkout.svelte';
    import Button from '../../components/design/buttons/Button.svelte';
    import { workoutRecording, RecordingStatus } from './_stores/workoutRecording';
    import { initWorkoutOrchestrator, destroyWorkoutOrchestrator } from './_stores/workoutOrchestrator';

    let Chart: any = $state();
    let showCompleteOverlay = $state(false);
    let previousStatus: RecordingStatus | null = null;

    onMount(async () => {
        initWorkoutOrchestrator();
        Chart = (await import('./_components/Chart.svelte')).default;

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

    onDestroy(destroyWorkoutOrchestrator);
</script>

<div class="flex flex-wrap items-center justify-between gap-2">
    <div>
        <Controls />
    </div>
    <div>
        <Button class="mr-3" onclick={handlePairTrainerClick}>Pair Trainer</Button>
        <Button onclick={handlePairHrClick}>Pair HR</Button>
    </div>
</div>
<Stats />

{#if Chart}
    <Chart data={$currentWorkout?.workoutData} currentTime={$currentTime} />
{/if}

{#if showCompleteOverlay}
    <CompleteWorkout onClose={handleCloseComplete} />
{/if}
