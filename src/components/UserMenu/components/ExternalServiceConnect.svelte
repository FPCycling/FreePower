<script lang="ts">
    import Button from '../../design/buttons/Button.svelte';
    import type { Snippet } from 'svelte';

    interface Props {
        serviceName: string;
        isConnected: boolean;
        iconColor: string;
        icon: Snippet;
        onConnect: () => void;
        onDisconnect: () => void;
    }

    let { serviceName, isConnected, iconColor, icon, onConnect, onDisconnect }: Props = $props();
</script>

<div class="flex items-center justify-between py-2">
    <div class="flex items-center gap-3">
        <div class="w-6 h-6" style="color: {iconColor}">
            {@render icon()}
        </div>
        <div>
            <div class="font-medium">{serviceName}</div>
            {#if isConnected}
                <div class="text-xs text-green-600 dark:text-green-400">Connected</div>
            {:else}
                <div class="text-xs text-gray-500 dark:text-gray-400">Not connected</div>
            {/if}
        </div>
    </div>

    {#if isConnected}
        <Button onclick={onDisconnect} class="text-sm">Disconnect</Button>
    {:else}
        <Button onclick={onConnect} class="text-sm">Connect</Button>
    {/if}
</div>
