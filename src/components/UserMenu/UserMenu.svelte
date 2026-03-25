<script lang="ts">
    import FtpInput from './components/FtpInput.svelte';
    import RiderWeightInput from './components/RiderWeightInput.svelte';
    import IntervalsIcuApiKey from './components/IntervalsIcuApiKey.svelte';
    import DebugModeToggle from './components/DebugModeToggle.svelte';
    import StravaConnect from './components/StravaConnect.svelte';
    import RideWithGPSConnect from './components/RideWithGPSConnect.svelte';
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
        // Add a small delay to prevent the opening click from triggering the close
        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleClickOutside);
        };
    });
</script>

<div
    bind:this={menuElement}
    class="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5 z-50"
>
    <div class="p-4 space-y-4">
        <FtpInput />
        <RiderWeightInput />
        <IntervalsIcuApiKey />
        <div class="border-t border-gray-200 dark:border-neutral-700 pt-3">
            <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Services</div>
            <StravaConnect />
            <RideWithGPSConnect />
        </div>
        {#if $isDebugAvailable}
            <DebugModeToggle />
        {/if}
    </div>
</div>
