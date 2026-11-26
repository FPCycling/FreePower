<script lang="ts">
    import type { Snippet } from 'svelte';

    let { href, class: className = '', children }: { href: string; class?: string; children: Snippet } = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- the URL is on a different site -->
<a {href} target="_blank" rel="noopener noreferrer" class={className}>{@render children()}</a>
