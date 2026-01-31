<script lang="ts">
    import { userFtp, intervalsIcuApiKey } from '../stores/userSettings';
    import { debugMode, toggleDebugMode } from '../routes/workout/_stores/debugMode';
    import { getAthleteProfile } from '../utils/intervalsIcuApi';

    let ftpValue = $state($userFtp?.toString() || '200');
    let ftpError = $state('');
    let apiKeyValue = $state($intervalsIcuApiKey || '');
    let testResult = $state('');
    let testLoading = $state(false);

    function handleFtpInput(event: Event) {
        const input = event.target as HTMLInputElement;
        ftpValue = input.value;

        const numValue = Number(ftpValue);

        if (isNaN(numValue) || numValue <= 0 || numValue >= 600) {
            ftpError = 'Invalid FTP';
        } else {
            ftpError = '';
            userFtp.set(numValue);
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('userFtp', ftpValue);
            }
        }
    }

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
            testResult = 'Error';
        } finally {
            testLoading = false;
        }
    }
</script>

<div
    class="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5 z-50"
>
    <div class="p-4 space-y-4">
        <div class="flex items-center gap-3">
            <label for="ftpInput" class="text-base font-bold text-neutral-900 dark:text-neutral-200 whitespace-nowrap">
                FTP
            </label>
            <div class="flex-1">
                <input
                    id="ftpInput"
                    type="number"
                    value={ftpValue}
                    oninput={handleFtpInput}
                    class="block w-full rounded-md border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-200 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50 px-3 py-2"
                    min="1"
                    max="599"
                />
                {#if ftpError}
                    <p class="text-xs text-red-600 dark:text-red-400 mt-1">{ftpError}</p>
                {/if}
            </div>
        </div>

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

        <div class="border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <button
                onclick={toggleDebugMode}
                class="w-full px-4 py-2 text-sm font-medium rounded-md transition-colors {$debugMode.enabled
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600'}"
            >
                {$debugMode.enabled ? '✓ Debug Mode ON' : 'Debug Mode'}
            </button>
        </div>
    </div>
</div>
