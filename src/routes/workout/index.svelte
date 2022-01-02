<script lang="ts">
    import { currentWatts, currentTime, currentWorkout } from './_stores/currentWorkout';
    import { onDestroy, onMount } from 'svelte';
    import { playSound } from '../../utils/sounds';
    import Controls from './_components/Controls.svelte';
    import Stats from './_components/Stats.svelte';
    import { handlePairHrClick } from './_stores/heartRate';
    import { handlePairTrainerClick } from './_stores/trainer';
    import TcxExporter from './_components/TcxExporter.svelte';

    let Chart: any;

    onMount(async () => {
        Chart = (await import('./_components/Chart.svelte')).default;

        currentWatts.subscribe(() => {
            if ($currentTime > 0) {
                playSound();
            }
        });
    });

    onDestroy(currentTime.pause);
</script>

<div class="flex justify-between">
    <div>
        <Controls />
    </div>
    <div>
        <button class="mr-3" on:click={handlePairTrainerClick}>Pair Trainer</button>
        <button on:click={handlePairHrClick}>Pair HR</button>
    </div>
</div>
<Stats />

<svelte:component this={Chart} data={$currentWorkout?.workoutData} currentTime={$currentTime} />

<TcxExporter />
