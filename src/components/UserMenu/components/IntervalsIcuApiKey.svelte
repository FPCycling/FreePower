<script lang="ts">
    import { intervalsIcuApiKey } from '../../../stores/userSettings';
    import { getAthleteProfile } from '../../../utils/intervalsIcuApi';

    let apiKeyValue = $state($intervalsIcuApiKey || '');
    let testResult = $state('');
    let testLoading = $state(false);

    function handleApiKeyInput(event: Event) {
        const input = event.target as HTMLInputElement;
        apiKeyValue = input.value;
        intervalsIcuApiKey.set(apiKeyValue);
    }

    async function testApiConnection() {
        if (!apiKeyValue) {
            testResult = 'Error';
            return;
        }

        testLoading = true;
        testResult = '';

        try {
            await getAthleteProfile(apiKeyValue);
            testResult = 'Successful';
        } catch (error) {
            console.error(error);
            testResult = 'Error';
        } finally {
            testLoading = false;
        }
    }
</script>

<div class="border-t border-neutral-200 dark:border-neutral-700 pt-4">
    <label for="apiKeyInput" class="block text-sm font-medium text-neutral-900 dark:text-neutral-200 mb-2">
        Intervals.icu API Key
    </label>
    <input
        id="apiKeyInput"
        type="password"
        value={apiKeyValue}
        oninput={handleApiKeyInput}
        placeholder="Enter your API key"
        class="block w-full rounded-md border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-200 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50 px-3 py-2 text-sm"
    />
    <div class="flex items-center gap-2 mt-2">
        <button
            onclick={testApiConnection}
            disabled={testLoading || !apiKeyValue}
            class="flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {testLoading ? 'Testing...' : 'Test API Connection'}
        </button>
        {#if testResult === 'Successful'}
            <span class="text-green-600 dark:text-green-400 text-sm">✓</span>
        {:else if testResult === 'Error'}
            <span class="text-red-600 dark:text-red-400 text-sm">✗</span>
        {/if}
    </div>
</div>
