<script lang="ts">
    import { difficulty } from '../stores/userSettings';

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
        <div class="flex gap-0.5 absolute right-1 sm:right-2 top-1/2 -translate-y-1/2">
            <div class="flex flex-col justify-center">
                <button
                    title="+1%"
                    type="button"
                    onclick={() => difficulty.update((d) => (d || 1) + 0.01)}
                    class="text-pink-300/50 hover:text-pink-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 active:bg-neutral-300 dark:active:bg-neutral-700 rounded-sm px-1.5 py-1 text-xs font-medium leading-none"
                    >+</button
                >
                <button
                    title="-1%"
                    type="button"
                    onclick={() => difficulty.update((d) => (d || 1) - 0.01)}
                    class="text-pink-300/50 hover:text-pink-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 active:bg-neutral-300 dark:active:bg-neutral-700 rounded-sm px-1.5 py-1 text-xs font-medium leading-none"
                    >−</button
                >
            </div>
            <div class="flex flex-col justify-center">
                <button
                    title="+5%"
                    type="button"
                    onclick={() => difficulty.update((d) => (d || 1) + 0.05)}
                    class="text-pink-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 active:bg-neutral-300 dark:active:bg-neutral-700 rounded-sm px-2 py-1.5 text-base font-medium leading-none"
                    >+</button
                >
                <button
                    title="-5%"
                    type="button"
                    onclick={() => difficulty.update((d) => (d || 1) - 0.05)}
                    class="text-pink-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 active:bg-neutral-300 dark:active:bg-neutral-700 rounded-sm px-2 py-1.5 text-base font-medium leading-none"
                    >−</button
                >
            </div>
        </div>
    {/if}
</div>
