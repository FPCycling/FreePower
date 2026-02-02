<script lang="ts">
    import { ridewithgpsTokens } from '../../../stores/userSettings';
    import { initiateRideWithGPSAuth, revokeRideWithGPSAuth } from '../../../utils/auth/ridewithgpsAuth';
    import Button from '../../design/buttons/Button.svelte';

    $: isConnected = !!$ridewithgpsTokens;

    function handleConnect() {
        try {
            initiateRideWithGPSAuth();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to connect to RideWithGPS');
        }
    }

    async function handleDisconnect() {
        if (!$ridewithgpsTokens) return;

        if (confirm('Disconnect from RideWithGPS?')) {
            try {
                await revokeRideWithGPSAuth($ridewithgpsTokens.access_token);
            } catch (error) {
                console.error('Error revoking auth:', error);
            } finally {
                ridewithgpsTokens.set(null);
            }
        }
    }
</script>

<div class="flex items-center justify-between p-3 border-b border-gray-200 dark:border-neutral-700">
    <div class="flex items-center gap-3">
        <svg class="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
        </svg>
        <div>
            <div class="font-medium">RideWithGPS</div>
            {#if isConnected}
                <div class="text-xs text-green-600 dark:text-green-400">Connected</div>
            {:else}
                <div class="text-xs text-gray-500">Not connected</div>
            {/if}
        </div>
    </div>

    {#if isConnected}
        <Button onclick={handleDisconnect} class="text-sm">Disconnect</Button>
    {:else}
        <Button onclick={handleConnect} class="text-sm">Connect</Button>
    {/if}
</div>
