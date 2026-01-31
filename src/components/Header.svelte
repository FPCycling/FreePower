<script lang="ts">
    import { getThemeContext } from '../contexts/themeContext';
    import { resolve } from '$app/paths';

    import { Moon, Sun, User } from './design/icons';
    import Button from './design/buttons/Button.svelte';
    import UserMenu from './UserMenu/UserMenu.svelte';

    const { theme, dark } = getThemeContext();

    let logo = $derived($dark ? '/logo_dark.png' : '/logo_light.png');
    let SwitchThemeIcon = $derived($dark ? Sun : Moon);

    let showUserMenu = $state(false);

    function handleDarkModeClick() {
        theme.set($dark ? 'light' : 'dark');
    }

    function toggleUserMenu() {
        showUserMenu = !showUserMenu;
    }
</script>

<span class="flex items-center h-14 shadow-lg bg-white dark:bg-neutral-900 justify-between">
    <a class="pl-14" href={resolve('/')}><img class="h-8" alt="logo" src={logo} /></a>
    <span class="flex relative">
        <Button kind="minimal" class="mr-3" onclick={handleDarkModeClick}>
            <SwitchThemeIcon class="text-neutral-900 dark:text-neutral-200 h-8 w-8" />
        </Button>
        <div class="relative">
            <Button kind="minimal" class="mr-3" onclick={toggleUserMenu}>
                <User class="h-8 w-8 text-neutral-900 dark:text-neutral-200" />
            </Button>

            {#if showUserMenu}
                <UserMenu onClose={() => (showUserMenu = false)} />
            {/if}
        </div>
    </span>
</span>
