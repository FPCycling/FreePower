<script lang="ts">
    import { resolve } from '$app/paths';
    import { attentionCount } from '../../stores/rides';
</script>

{#if $attentionCount > 0}
    <div
        class="mb-10 flex flex-wrap items-center justify-between gap-3 rounded-md bg-white dark:bg-neutral-900 px-5 py-3 shadow-sm"
        role="status"
    >
        <p>
            <span class="font-bold"
                >{$attentionCount === 1
                    ? '1 ride is not uploaded.'
                    : `${$attentionCount} rides are not uploaded.`}</span
            >
            <span class="text-neutral-600 dark:text-neutral-400">Your rides are saved in this browser.</span>
        </p>
        <a
            class="rounded-sm bg-pink-300 px-5 py-2.5 text-sm font-medium text-white hover:bg-pink-200"
            href={resolve('/rides')}>Review</a
        >
    </div>
{/if}
