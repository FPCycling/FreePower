<script lang="ts">
    import logo_light from '../../static/logo_light.png?url';
    import logo_dark from '../../static/logo_dark.png?url';
    import { getThemeContext } from '../contexts/themeContext';

    import { Moon, Sun, User } from '../icons';

    const { theme, dark } = getThemeContext();

    let logo: string;
    let switchThemeIcon: typeof Sun | typeof Moon;

    $: {
        switchThemeIcon = $dark ? Sun : Moon;
        logo = $dark ? logo_dark : logo_light;
    }
    function handleDarkModeClick() {
        theme.set($dark ? 'light' : 'dark');
    }
</script>

<span class="flex items-center h-14 shadow-lg bg-white dark:bg-neutral-900 justify-between">
    <a class="pl-14" href="/"><img class="h-8" alt="logo" src={logo} /></a>
    <span class="flex">
        <button class="mr-3" on:click={handleDarkModeClick}>
            <svelte:component this={switchThemeIcon} class="text-neutral-900 dark:text-neutral-200 h-8 w-8" />
        </button>
        <button class="mr-3">
            <User class="h-8 w-8 text-neutral-900 dark:text-neutral-200" />
        </button>
    </span>
</span>
