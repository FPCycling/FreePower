<script lang="ts">
    import logo_light from '../../static/logo_light.png?url';
    import logo_dark from '../../static/logo_dark.png?url';
    import { getThemeContext } from '../contexts/themeContext';

    const { theme, dark } = getThemeContext();

    let logo: string;

    $: {
        logo = $dark ? logo_dark : logo_light;
    }
    function handleDarkModeClick() {
        theme.set($dark ? 'light' : 'dark');
    }
</script>

<span class="flex items-center h-14 shadow-lg bg-white dark:bg-red-800">
    <a class="pl-14" href="/"><img class="h-8" alt="logo" src={logo} /></a>
    <button on:click={handleDarkModeClick}>Toggle theme {$theme}</button>
</span>
