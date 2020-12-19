<script lang="ts">
    import {
        currentWatts,
        currentTime,
        currentWorkout,
        nextInterval,
    } from "../../stores/currentWorkout";
    import { Button } from "carbon-components-svelte";
    import { onDestroy, onMount } from "svelte";
    import dayjs from "dayjs";
    import duration from "dayjs/plugin/duration";
    import { activateAudioContext, playSound } from "../../utils/sounds";

    dayjs.extend(duration);
    const toTimeFormat = (milliseconds: number) => {
        return dayjs.duration(milliseconds).format("HH:mm:ss");
    };

    let WorkoutChart;

    onMount(async () => {
        const module = await import("../../components/WorkoutChart.svelte");

        WorkoutChart = module.default;

        currentWatts.subscribe(() => {
            if ($currentTime > 0) {
                playSound();
            }
        });
    });

    onDestroy(currentTime.pause);
</script>

<style>
    p.mainInterval {
        font-size: 5rem;
        font-weight: bold;
    }
    p.nextInterval {
        font-size: 3rem;
    }
</style>

<Button
    on:click={() => {
        activateAudioContext();
        currentTime.start();
    }}>
    Start
</Button>
<Button on:click={currentTime.pause}>Pause</Button>
<Button kind="danger" on:click={currentTime.reset}>Reset</Button>
<Button kind="ghost" on:click={() => currentTime.add(10 * 1000)}>
    +10 sec
</Button>
<Button kind="ghost" on:click={() => currentTime.add(60 * 1000)}>+1 min</Button>
<Button kind="ghost" on:click={() => currentTime.add(5 * 60 * 1000)}>
    +5 min
</Button>

<p class="mainInterval">{toTimeFormat($currentTime)}</p>
<p class="mainInterval">{$currentWatts}</p>

<h2>Next interval...</h2>
<p class="nextInterval">at {toTimeFormat($nextInterval.at)}</p>
<p class="nextInterval">in {toTimeFormat($nextInterval.in)}</p>
<p class="nextInterval">{$nextInterval.nextWatts}</p>

<svelte:component
    this={WorkoutChart}
    data={$currentWorkout?.workoutData}
    currentTime={$currentTime} />
