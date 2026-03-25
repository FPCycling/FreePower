<script lang="ts">
    import { riderWeightKg } from '../../../stores/userSettings';

    let weightValue = $state($riderWeightKg?.toString() || '75');
    let weightError = $state('');

    function handleWeightInput(event: Event) {
        const input = event.target as HTMLInputElement;
        weightValue = input.value;

        const numValue = Number(weightValue);

        if (isNaN(numValue) || numValue < 30 || numValue > 200) {
            weightError = 'Must be 30–200 kg';
        } else {
            weightError = '';
            riderWeightKg.set(numValue);
        }
    }
</script>

<div class="flex items-center gap-3">
    <label for="weightInput" class="text-base font-bold text-neutral-900 dark:text-neutral-200 whitespace-nowrap">
        Weight (kg)
    </label>
    <div class="flex-1">
        <input
            id="weightInput"
            type="number"
            value={weightValue}
            oninput={handleWeightInput}
            class="block w-full rounded-md border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-200 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50 px-3 py-2"
            min="30"
            max="200"
        />
        {#if weightError}
            <p class="text-xs text-red-600 dark:text-red-400 mt-1">{weightError}</p>
        {/if}
    </div>
</div>
