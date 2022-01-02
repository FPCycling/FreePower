<script lang="ts">
    import { currentWatts, currentTime, currentWorkout } from './_stores/currentWorkout';
    import { onDestroy, onMount } from 'svelte';
    import { playSound } from '../../utils/sounds';
    import Controls from './_components/Controls.svelte';
    import Stats from './_components/Stats.svelte';
    import { handlePairHrClick } from './_stores/heartRate';
    import { handlePairTrainerClick } from './_stores/trainer';
    import TcxExporter from './_components/TcxExporter.svelte';
    import Button from '../../components/design/buttons/Button.svelte';

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
        <Button class="mr-3" on:click={handlePairTrainerClick}>Pair Trainer</Button>
        <Button on:click={handlePairHrClick}>Pair HR</Button>
    </div>
</div>
<Stats />

<svelte:component this={Chart} data={$currentWorkout?.workoutData} currentTime={$currentTime} />

<TcxExporter />
