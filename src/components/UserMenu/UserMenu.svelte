<script lang="ts">
    import FtpInput from './components/FtpInput.svelte';
    import IntervalsIcuApiKey from './components/IntervalsIcuApiKey.svelte';
    import DebugModeToggle from './components/DebugModeToggle.svelte';
    import { isDebugAvailable } from '../../stores/userSettings';

    interface Props {
        onClose: () => void;
    }

    let { onClose }: Props = $props();

    let menuElement: HTMLDivElement;

    function handleClickOutside(event: MouseEvent) {
        if (menuElement && !menuElement.contains(event.target as Node)) {
            onClose();
        }
    }

    $effect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });
</script>

<div
    bind:this={menuElement}
    class="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5 z-50"
>
    <div class="p-4 space-y-4">
        <FtpInput />
        <IntervalsIcuApiKey />
        {#if $isDebugAvailable}
            <DebugModeToggle />
        {/if}
    </div>
</div>
