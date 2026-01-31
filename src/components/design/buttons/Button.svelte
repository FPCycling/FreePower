<script module lang="ts">
    export type ButtonKind = 'primary' | 'secondary' | 'danger' | 'minimal';
</script>

<script lang="ts">
    let {
        class: className,
        kind = 'primary',
        onclick,
        children,
    }: { class?: string; kind?: ButtonKind; onclick?: (event: MouseEvent) => void; children?: any } = $props();

    let colorClasses = $derived(() => {
        switch (kind) {
            case 'primary':
                return 'bg-pink-300 active:bg-pink-400 hover:bg-pink-200';
            case 'secondary':
                return 'bg-purple-200 active:bg-purple-300 hover:bg-purple-100';
            case 'danger':
                return 'bg-red-600 active:bg-red-700 hover:bg-red-500';
            default:
                return '';
        }
    });

    let isMinimal = $derived(kind === 'minimal');
</script>

{#if isMinimal}
    <button
        {onclick}
        type="button"
        class={`text-pink-300 font-medium rounded-sm text-sm px-5 py-2.5 text-center hover:bg-neutral-300 active:bg-neutral-400 dark:hover:bg-neutral-800 dark:active:bg-neutral-700 ${className}`}
        >{@render children?.()}</button
    >
{:else}
    <button
        {onclick}
        type="button"
        class={`text-white font-medium rounded-sm text-sm px-5 py-2.5 text-center ${colorClasses()} ${className}`}
        >{@render children?.()}</button
    >
{/if}
