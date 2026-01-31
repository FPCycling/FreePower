<script lang="ts">
    import { userFtp } from '../../../stores/userSettings';

    let ftpValue = $state($userFtp?.toString() || '200');
    let ftpError = $state('');

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
</script>

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
