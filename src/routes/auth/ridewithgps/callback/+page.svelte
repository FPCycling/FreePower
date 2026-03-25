<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { exchangeCodeForToken } from '../../../../utils/auth/ridewithgpsAuth';
    import { ridewithgpsTokens } from '../../../../stores/userSettings';

    let error = $state('');
    let success = $state(false);

    onMount(async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');

        if (errorParam) {
            error = `Authorization failed: ${errorParam}`;
            return;
        }

        if (!code) {
            error = 'No authorization code received';
            return;
        }

        try {
            const tokens = await exchangeCodeForToken(code);
            ridewithgpsTokens.set(tokens);
            success = true;

            // Redirect back to main page after a short delay
            setTimeout(() => {
                goto(resolve('/'));
            }, 2000);
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to connect to RideWithGPS';
        }
    });
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900">
    <div class="max-w-md w-full p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-lg">
        {#if error}
            <div class="text-center">
                <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"
                    ></path>
                </svg>
                <h2 class="text-xl font-bold text-red-600 mb-2">Connection Failed</h2>
                <p class="text-gray-600 dark:text-gray-400">{error}</p>
                <a href={resolve('/')} class="mt-4 inline-block text-blue-600 hover:underline">Return Home</a>
            </div>
        {:else if success}
            <div class="text-center">
                <svg
                    class="w-16 h-16 text-green-500 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <h2 class="text-xl font-bold text-green-600 mb-2">Connected to RideWithGPS!</h2>
                <p class="text-gray-600 dark:text-gray-400">Redirecting you back...</p>
            </div>
        {:else}
            <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p class="text-gray-600 dark:text-gray-400">Connecting to RideWithGPS...</p>
            </div>
        {/if}
    </div>
</div>
