<script lang="ts">
    import { currentWatts, currentTime, nextInterval } from '../_stores/currentWorkout';
    import { heartRate } from '../_stores/heartRate';
    import { trainerMetrics } from '../_stores/trainer';
    import { difficulty } from '../../../stores/userSettings';
    import { formatMs } from '../../../utils/time';
    import LargeTile from '../../../components/LargeTile.svelte';

    function formatNumber(number: number) {
        if (number === -1) return 'N/A';
        return String(number);
    }

    const adjustDifficulty = (delta: number) => difficulty.update((d) => (d || 1) + delta);
    const skip = (ms: number) => currentTime.add(ms);

    const smallClasses =
        'text-pink-300/50 hover:text-pink-300 px-1.5 py-1 text-xs hover:bg-neutral-200 dark:hover:bg-neutral-800 active:bg-neutral-300 dark:active:bg-neutral-700 rounded-sm font-medium leading-none';
    const largeClasses =
        'text-pink-300 px-2 py-1.5 text-base hover:bg-neutral-200 dark:hover:bg-neutral-800 active:bg-neutral-300 dark:active:bg-neutral-700 rounded-sm font-medium leading-none';
</script>

{#snippet stepColumn(
    up: { label: string; title: string; onclick: () => void },
    down: { label: string; title: string; onclick: () => void },
    classes: string,
)}
    <div class="flex flex-col justify-center">
        <button type="button" title={up.title} onclick={up.onclick} class={classes}>{up.label}</button>
        <button type="button" title={down.title} onclick={down.onclick} class={classes}>{down.label}</button>
    </div>
{/snippet}

{#snippet difficultyActions()}
    {@render stepColumn(
        { label: '+', title: '+1%', onclick: () => adjustDifficulty(0.01) },
        { label: '−', title: '-1%', onclick: () => adjustDifficulty(-0.01) },
        smallClasses,
    )}
    {@render stepColumn(
        { label: '+', title: '+5%', onclick: () => adjustDifficulty(0.05) },
        { label: '−', title: '-5%', onclick: () => adjustDifficulty(-0.05) },
        largeClasses,
    )}
{/snippet}

{#snippet timeSkips()}
    {#each [-60_000, -10_000, 10_000, 60_000] as ms (ms)}
        <button
            type="button"
            title={`${ms > 0 ? 'Skip' : 'Back'} ${Math.abs(ms) >= 60_000 ? '1 minute' : '10 seconds'}`}
            onclick={() => skip(ms)}
            class="text-pink-300 px-2 py-1 text-xs sm:text-sm hover:bg-neutral-200 dark:hover:bg-neutral-800 active:bg-neutral-300 dark:active:bg-neutral-700 rounded-sm font-medium leading-none"
            >{ms > 0 ? '+' : '−'}{Math.abs(ms) >= 60_000 ? '1m' : '10s'}</button
        >
    {/each}
{/snippet}

<div class="grid grid-rows-2 gap-0.5 pt-5">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5">
        <LargeTile title="Power">
            {formatNumber($trainerMetrics.power)}
        </LargeTile>
        <LargeTile title="Interval time" subTitle={`next ${$nextInterval.nextWatts} W`}>
            {formatMs($nextInterval.in)}
        </LargeTile>
        <LargeTile title="Heart rate">{formatNumber($heartRate)}</LargeTile>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5">
        <LargeTile title="Target" actions={difficultyActions}>{$currentWatts}</LargeTile>
        <LargeTile title="Time" footer={timeSkips}>{formatMs($currentTime)}</LargeTile>
        <LargeTile title="Cadence">
            {formatNumber($trainerMetrics.cadence)}
        </LargeTile>
    </div>
</div>
