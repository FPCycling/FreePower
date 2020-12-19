<script lang="ts">
    import {
        currentWatts,
        currentTime,
        currentWorkout,
    } from "./stores/currentWorkout";
    import { onDestroy, onMount } from "svelte";
    import { playSound } from "../../utils/sounds";
    import Controls from "./components/Controls.svelte";
    import Stats from "./components/Stats.svelte";
    import { Button } from "carbon-components-svelte";
    import { handlePairHrClick } from "../../stores/heartRate";

    let Chart: any;

    onMount(async () => {
        const module = await import("./components/Chart.svelte");

        Chart = module.default;

        currentWatts.subscribe(() => {
            if ($currentTime > 0) {
                playSound();
            }
        });
    });

    onDestroy(currentTime.pause);
</script>

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
        <Button on:click={handlePairHrClick}>Pair HR</Button>
    </div>
</div>
<Stats />

<svelte:component
    this={Chart}
    data={$currentWorkout?.workoutData}
    currentTime={$currentTime} />
