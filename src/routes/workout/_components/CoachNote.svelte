<script lang="ts">
    import { writableCurrentWorkout } from '../_stores/currentWorkout';

    let open = $state(true);
    let note = $derived($writableCurrentWorkout?.coachNote);
</script>

{#if note}
    <div class="mt-5 bg-white dark:bg-neutral-900 border-l-4 border-pink-300">
        <button
            type="button"
            onclick={() => (open = !open)}
            class="flex w-full items-center justify-between gap-2 px-4 py-2 text-left"
            aria-expanded={open}
        >
            <span class="uppercase text-neutral-500 font-bold text-xs sm:text-sm">
                Coach note{$writableCurrentWorkout?.name ? ` · ${$writableCurrentWorkout.name}` : ''}
            </span>
            <span class="text-pink-300 text-sm font-medium">{open ? 'Hide' : 'Show'}</span>
        </button>
        {#if open}
            <p class="whitespace-pre-line px-4 pb-3 text-base sm:text-lg">{note}</p>
        {/if}
    </div>
{/if}
