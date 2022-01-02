<script lang="ts">
    import { difficulty } from '../stores/userSettings';

    export let title: string;
    export let subTitle: string | undefined = undefined;

    export let isTarget = title === 'Target';
</script>

<div
    class="flex flex-col items-center relative min-w-[8rem] min-h-[4rem] p-4 bg-white dark:bg-neutral-900 outline-2 outline-transparent"
>
    <p class="uppercase text-neutral-500 font-bold -mb-4">{title}</p>
    <p class="font-bold text-7.5xl">
        <slot />
    </p>
    {#if subTitle}
        <p class="text-neutral-600 font-bold -mt-1.5 pt-0.5 -mb-0.5">{subTitle}</p>
    {/if}
    {#if isTarget}
        <p class="flex flex-col absolute right-3 top-3">
            <button on:click={() => difficulty.set($difficulty + 0.05)}>+</button>
            <button on:click={() => difficulty.set($difficulty - 0.05)}>-</button>
        </p>
    {/if}
</div>
