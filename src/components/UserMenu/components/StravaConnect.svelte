<script lang="ts">
    import ExternalServiceConnect from './ExternalServiceConnect.svelte';
    import { stravaTokens } from '../../../stores/userSettings';
    import { initiateStravaAuth, revokeStravaAuth } from '../../../utils/auth/stravaAuth';

    let isConnected = $derived(!!$stravaTokens);

    function handleConnect() {
        initiateStravaAuth();
    }

    async function handleDisconnect() {
        const tokens = $stravaTokens;
        if (tokens) {
            await revokeStravaAuth(tokens.access_token);
        }
        stravaTokens.set(null);
    }
</script>

<ExternalServiceConnect
    serviceName="Strava"
    {isConnected}
    iconColor="#fc4c02"
    onConnect={handleConnect}
    onDisconnect={handleDisconnect}
>
    {#snippet icon()}
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path
                d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"
            />
        </svg>
    {/snippet}
</ExternalServiceConnect>
