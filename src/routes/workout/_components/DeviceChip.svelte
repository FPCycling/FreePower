<script lang="ts">
    let {
        label,
        pairLabel,
        connected,
        onclick,
    }: { label: string; pairLabel: string; connected: boolean; onclick: () => void } = $props();
</script>

<button
    type="button"
    {onclick}
    title={connected ? `${label} connected. Click to pair again.` : pairLabel}
    class={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset hover:bg-neutral-300 active:bg-neutral-400 dark:hover:bg-neutral-800 dark:active:bg-neutral-700 ${
        connected ? 'ring-green-500/60 text-green-600 dark:text-green-400' : 'ring-neutral-400 text-neutral-500'
    }`}
>
    <span class={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'border border-neutral-400'}`}></span>
    {connected ? label : pairLabel}
</button>
