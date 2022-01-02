<script lang="ts">
    import type { ThemeContext, Theme } from '../types/themes';

    let persistKey = 'theme';

    import { onMount, afterUpdate, setContext } from 'svelte';
    import { writable, derived } from 'svelte/store';

    export let theme = writable<Theme>('light');

    setContext<ThemeContext>('Theme', {
        theme,
        dark: derived(theme, (theme) => theme === 'dark'),
        light: derived(theme, (theme) => theme === 'light'),
    });

    onMount(() => {
        let persistedTheme = localStorage.getItem(persistKey);
        if (persistedTheme !== 'dark' && persistedTheme !== 'light') {
            persistedTheme = 'light';
        }

        theme.set(persistedTheme as Theme);
    });

    afterUpdate(() => {
        localStorage.setItem(persistKey, $theme);
    });
</script>

<div class={$theme}>
    <div class="min-h-screen bg-neutral-100 dark:bg-neutral-1000 dark:text-neutral-200">
        <slot />
    </div>
</div>
