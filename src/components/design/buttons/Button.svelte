<script module lang="ts">
    export type ButtonKind = 'primary' | 'secondary' | 'danger' | 'minimal' | 'outline';
    export type ButtonSize = 'md' | 'lg';
</script>

<script lang="ts">
    let {
        class: className,
        kind = 'primary',
        size = 'md',
        onclick,
        children,
    }: {
        class?: string;
        kind?: ButtonKind;
        size?: ButtonSize;
        onclick?: (event: MouseEvent) => void;
        children?: any;
    } = $props();

    let colorClasses = $derived(() => {
        switch (kind) {
            case 'primary':
                return 'text-white bg-pink-300 active:bg-pink-400 hover:bg-pink-200';
            case 'secondary':
                return 'text-white bg-purple-200 active:bg-purple-300 hover:bg-purple-100';
            case 'danger':
                return 'text-white bg-red-600 active:bg-red-700 hover:bg-red-500';
            case 'outline':
                return 'text-pink-300 ring-1 ring-inset ring-pink-300 hover:bg-neutral-300 active:bg-neutral-400 dark:hover:bg-neutral-800 dark:active:bg-neutral-700';
            default:
                return 'text-pink-300 hover:bg-neutral-300 active:bg-neutral-400 dark:hover:bg-neutral-800 dark:active:bg-neutral-700';
        }
    });

    let sizeClasses = $derived(
        size === 'lg' ? 'text-base px-4 py-3 sm:text-lg sm:px-8 sm:py-3.5' : 'text-sm px-5 py-2.5',
    );
</script>

<button
    {onclick}
    type="button"
    class={`font-medium rounded-sm text-center ${sizeClasses} ${colorClasses()} ${className ?? ''}`}
    >{@render children?.()}</button
>
