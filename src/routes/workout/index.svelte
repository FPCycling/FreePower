<script lang="ts">
    import {
        currentWatts,
        currentTime,
        currentWorkout,
    } from "./_stores/currentWorkout";
    import { onDestroy, onMount } from "svelte";
    import { playSound } from "../../utils/sounds";
    import Controls from "./_components/Controls.svelte";
    import Stats from "./_components/Stats.svelte";
    import { Button } from "carbon-components-svelte";
    import { handlePairHrClick } from "./_stores/heartRate";
    import { handlePairTrainerClick } from "./_stores/trainer";
    import TcxExporter from "./_components/TcxExporter.svelte";

    let Chart: any;

    onMount(async () => {
        Chart = (await import("./_components/Chart.svelte")).default;

        currentWatts.subscribe(() => {
            if ($currentTime > 0) {
                playSound();
            }
        });
    });

    onDestroy(currentTime.pause);
</script>

<!-- svelte-ignore missing-declaration -->
<style>
    .controlsContainer {
        display: flex;
        justify-content: space-between;
    }
    .controlsContainer :global(button) {
        margin: 0 0.25rem;
    }
</style>

<div class="controlsContainer">
    <div>
        <Controls />
    </div>
    <div>
        <Button on:click={handlePairTrainerClick}>Pair Trainer</Button>
        <Button on:click={handlePairHrClick}>Pair HR</Button>
    </div>
</div>
<Stats />

<svelte:component
    this={Chart}
    data={$currentWorkout?.workoutData}
    currentTime={$currentTime} />

<TcxExporter />
