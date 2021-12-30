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
        let persisted_theme = localStorage.getItem(persistKey);

        if (persisted_theme !== 'dark' || persisted_theme !== 'light') {
            persisted_theme = 'light';
        }

        theme.set(persisted_theme as Theme);
    });

    afterUpdate(() => {
        localStorage.setItem(persistKey, $theme);
    });
</script>

<div class={$theme}>
    <slot />
</div>
