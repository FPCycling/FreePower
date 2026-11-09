<script lang="ts">
    import type { ConnectionState } from '../_bluetooth/deviceConnection';

    let {
        label,
        pairLabel,
        state,
        onclick,
    }: { label: string; pairLabel: string; state: ConnectionState; onclick: () => void } = $props();

    const text = $derived(state === 'connected' ? label : state === 'connecting' ? `${label}…` : pairLabel);
    const title = $derived(
        state === 'connected'
            ? `${label} connected. Click to pair again.`
            : state === 'connecting'
              ? `Connecting to ${label}…`
              : pairLabel,
    );
    const colors = $derived(
        state === 'connected'
            ? 'ring-green-500/60 text-green-600 dark:text-green-400'
            : state === 'connecting'
              ? 'ring-amber-500/60 text-amber-600 dark:text-amber-400'
              : 'ring-neutral-400 text-neutral-500',
    );
    const dot = $derived(
        state === 'connected'
            ? 'bg-green-500'
            : state === 'connecting'
              ? 'bg-amber-500 animate-pulse'
              : 'border border-neutral-400',
    );
</script>

<button
    type="button"
    {onclick}
    {title}
    class={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset hover:bg-neutral-300 active:bg-neutral-400 dark:hover:bg-neutral-800 dark:active:bg-neutral-700 ${colors}`}
>
    <span class={`h-2 w-2 rounded-full ${dot}`}></span>
    {text}
</button>
