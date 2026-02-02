<script lang="ts">
    import { currentWatts, currentTime, currentWorkout } from './_stores/currentWorkout';
    import { onDestroy, onMount } from 'svelte';
    import { playSound } from '../../utils/sounds';
    import Controls from './_components/Controls.svelte';
    import Stats from './_components/Stats.svelte';
    import { handlePairHrClick } from './_stores/heartRate';
    import { handlePairTrainerClick } from './_stores/trainer';
    import FitExporter from './_components/FitExporter.svelte';
    import CompleteWorkout from './_components/CompleteWorkout.svelte';
    import Button from '../../components/design/buttons/Button.svelte';
    import { workoutRecording, RecordingStatus } from './_stores/workoutRecording';

    let Chart: any = $state();
    let showCompleteOverlay = $state(false);
    let previousStatus: RecordingStatus | null = null;

    onMount(async () => {
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

    onDestroy(currentTime.pause);
</script>

<div class="flex justify-between">
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

<FitExporter />

{#if showCompleteOverlay}
    <CompleteWorkout onClose={handleCloseComplete} />
{/if}
