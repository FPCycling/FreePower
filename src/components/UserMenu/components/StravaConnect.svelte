<script lang="ts">
    import Button from '../../design/buttons/Button.svelte';
    import { stravaTokens } from '../../../stores/userSettings';
    import { initiateStravaAuth, revokeStravaAuth, type StravaTokens } from '../../../utils/auth/stravaAuth';

    let isConnected = false;
    let athleteId = '';

    // Subscribe to token changes
    stravaTokens.subscribe((tokens: StravaTokens | null) => {
        isConnected = !!tokens;
        athleteId = tokens?.athlete_id || '';
    });

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

<div class="flex items-center justify-between py-2">
    <div class="flex items-center gap-3">
        <svg class="w-6 h-6 text-[#fc4c02]" viewBox="0 0 24 24" fill="currentColor">
            <path
                d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"
            />
        </svg>
        <div>
            <div class="font-medium">Strava</div>
            {#if isConnected}
                <div class="text-xs text-green-600">Connected</div>
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
