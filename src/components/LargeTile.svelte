<script lang="ts">
    import type { Snippet } from 'svelte';

    let {
        title,
        subTitle = undefined,
        actions = undefined,
        footer = undefined,
        children,
    }: { title: string; subTitle?: string; actions?: Snippet; footer?: Snippet; children?: any } = $props();
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
    {#if footer}
        <div class="flex gap-1 -mt-0.5 sm:-mt-1.5">{@render footer()}</div>
    {/if}
    {#if actions}
        <div class="flex gap-0.5 absolute right-1 sm:right-2 top-1/2 -translate-y-1/2">
            {@render actions()}
        </div>
    {/if}
</div>
