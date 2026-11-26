<script lang="ts">
    import { getThemeContext } from '../contexts/themeContext';
    import { resolve } from '$app/paths';

    import { Moon, Sun, User } from './design/icons';
    import Button from './design/buttons/Button.svelte';
    import UserMenu from './UserMenu/UserMenu.svelte';
    import { attentionCount } from '../stores/rides';

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
        <a
            class="mr-3 flex items-center gap-1.5 self-center rounded-sm px-3 py-2 text-sm font-medium text-pink-300 hover:bg-neutral-300 dark:hover:bg-neutral-800"
            href={resolve('/rides')}
        >
            Rides
            {#if $attentionCount > 0}
                <span
                    class="rounded-full bg-pink-300 px-1.5 text-xs text-white"
                    aria-label={`${$attentionCount} not uploaded`}>{$attentionCount}</span
                >
            {/if}
        </a>
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
