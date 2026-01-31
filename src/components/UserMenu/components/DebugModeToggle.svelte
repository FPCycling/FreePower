<script lang="ts">
    import { debugMode, toggleDebugMode } from '../../../routes/workout/_stores/debugMode';
</script>

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
