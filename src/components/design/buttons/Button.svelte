<!--suppress JSUnreachableSwitchBranches -->
<script lang="ts">
    let className: string | undefined = undefined;
    export { className as class };
    export type ButtonKind = 'primary' | 'secondary' | 'danger' | 'minimal';

    export let kind: ButtonKind = 'primary';

    let colorClasses = '';

    switch (kind) {
        case 'primary':
            colorClasses = 'bg-pink-300 active:bg-pink-400 hover:bg-pink-200';
            break;
        case 'secondary':
            colorClasses = 'bg-purple-200 active:bg-purple-300 hover:bg-purple-100';
            break;
        case 'danger':
            colorClasses = 'bg-red-600 active:bg-red-700 hover:bg-red-500';
            break;
    }
    const isMinimal = kind === 'minimal';
</script>

{#if isMinimal}
    <button
        on:click
        type="button"
        class={`text-pink-300 font-medium rounded-sm text-sm px-5 py-2.5 text-center hover:bg-neutral-300 active:bg-neutral-400 dark:hover:bg-neutral-800 dark:active:bg-neutral-700 ${className}`}
        ><slot /></button
    >
{:else}
    <button
        on:click
        type="button"
        class={`text-white font-medium rounded-sm text-sm px-5 py-2.5 text-center ${colorClasses} ${className}`}
        ><slot /></button
    >
{/if}
