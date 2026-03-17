<script lang="ts">
    import { difficulty } from '../stores/userSettings';
    import Button from './design/buttons/Button.svelte';

    let { title, subTitle = undefined, children }: { title: string; subTitle?: string; children?: any } = $props();

    let isTarget = $derived(title === 'Target');
</script>

<div
    class="flex flex-col items-center relative min-w-0 min-h-[2.5rem] sm:min-h-[4rem] p-2 sm:p-4 bg-white dark:bg-neutral-900 outline-2 outline-transparent"
>
    <p class="uppercase text-neutral-500 font-bold text-xs sm:text-base -mb-1 sm:-mb-4">{title}</p>
    <p class="font-bold text-3xl sm:text-5xl lg:text-7.5xl">
        {@render children?.()}
    </p>
    {#if subTitle}
        <p class="text-neutral-600 font-bold text-xs sm:text-sm -mt-0.5 sm:-mt-1.5 pt-0.5 -mb-0.5">{subTitle}</p>
    {/if}
    {#if isTarget}
        <p class="flex flex-col absolute right-1 sm:right-3 top-[25%]">
            <Button kind="minimal" onclick={() => difficulty.update((d) => (d || 1) + 0.05)}>+</Button>
            <Button kind="minimal" onclick={() => difficulty.update((d) => (d || 1) - 0.05)}>-</Button>
        </p>
    {/if}
</div>
