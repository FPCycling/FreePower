<script lang="ts">
    import ExternalServiceConnect from './ExternalServiceConnect.svelte';
    import { ridewithgpsTokens } from '../../../stores/userSettings';
    import { initiateRideWithGPSAuth, revokeRideWithGPSAuth } from '../../../utils/auth/ridewithgpsAuth';

    let isConnected = $derived(!!$ridewithgpsTokens);

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

<ExternalServiceConnect
    serviceName="RideWithGPS"
    {isConnected}
    iconColor="#2563eb"
    onConnect={handleConnect}
    onDisconnect={handleDisconnect}
>
    {#snippet icon()}
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
        </svg>
    {/snippet}
</ExternalServiceConnect>
