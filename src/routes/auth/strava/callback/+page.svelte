<script lang="ts">
    import { onMount } from 'svelte';
    import { exchangeCodeForToken } from '../../../../utils/auth/stravaAuth';
    import { stravaTokens } from '../../../../stores/userSettings';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';

    let status: 'loading' | 'success' | 'error' = 'loading';
    let errorMessage = '';

    onMount(async () => {
        // Get the authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
            status = 'error';
            errorMessage = 'Authorization was denied or cancelled';
            setTimeout(() => goto(resolve('/')), 3000);
            return;
        }

        if (!code) {
            status = 'error';
            errorMessage = 'No authorization code received';
            setTimeout(() => goto(resolve('/')), 3000);
            return;
        }

        try {
            // Exchange code for tokens
            const tokens = await exchangeCodeForToken(code);

            // Save tokens to store (which persists to localStorage)
            stravaTokens.set(tokens);

            status = 'success';

            // Redirect back to home page after 2 seconds
            setTimeout(() => goto(resolve('/')), 2000);
        } catch (err) {
            status = 'error';
            errorMessage = err instanceof Error ? err.message : 'Failed to authenticate with Strava';
            setTimeout(() => goto(resolve('/')), 3000);
        }
    });
</script>

<div class="flex items-center justify-center min-h-screen">
    <div class="text-center p-8 max-w-md">
        {#if status === 'loading'}
            <div class="mb-4">
                <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
            </div>
            <h1 class="text-2xl font-bold mb-2">Connecting to Strava...</h1>
            <p class="text-gray-600">Please wait while we complete the authentication.</p>
        {:else if status === 'success'}
            <div class="mb-4">
                <svg class="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <h1 class="text-2xl font-bold mb-2 text-green-600">Successfully Connected!</h1>
            <p class="text-gray-600">Your Strava account is now connected. Redirecting...</p>
        {:else}
            <div class="mb-4">
                <svg class="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"
                    ></path>
                </svg>
            </div>
            <h1 class="text-2xl font-bold mb-2 text-red-600">Connection Failed</h1>
            <p class="text-gray-600">{errorMessage}</p>
            <p class="text-gray-500 text-sm mt-2">Redirecting to home page...</p>
        {/if}
    </div>
</div>
