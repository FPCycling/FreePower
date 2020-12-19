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

    let Chart;

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

<Controls />
<Stats />

<svelte:component
    this={Chart}
    data={$currentWorkout?.workoutData}
    currentTime={$currentTime} />
