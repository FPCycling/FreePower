<script lang="ts">
    export let segment;

    import logo_light from "../../static/logo_light.png";
    import logo_dark from "../../static/logo_dark.png";
    import {
        SkipToContent,
        Header,
        HeaderUtilities,
        HeaderGlobalAction,
    } from "carbon-components-svelte";
    import LightIcon from "carbon-icons-svelte/lib/LightFilled32";
    import UserAvatar from "carbon-icons-svelte/lib/UserAvatarFilledAlt32";
    import DarkIcon from "carbon-icons-svelte/lib/Moon32";
    import { getThemeContext } from "../contexts/themeContext";
    import type { CarbonIcon } from "carbon-icons-svelte";

    const { carbon_theme, dark, light } = getThemeContext();
    let logo: string;
    let icon: typeof CarbonIcon;

    $: {
        logo = $dark ? logo_dark : logo_light;
        icon = $dark ? LightIcon : DarkIcon;
    }
    function handleDarkModeClick() {
        carbon_theme.set($light ? "g90" : "g10");
    }
</script>

<style>
    span :global(.bx--header) {
        background-color: var(--cds-ui-01);
        border-bottom: none;
        box-shadow: 0px -3px 10px 0px #32293d;
        height: 3.5rem;
    }

    span :global(.bx--header__action > svg) {
        fill: var(--cds-ui-05);
    }

    span :global(a.bx--header__name) {
        display: none;
    }

    span :global(.bx--header__action) {
        height: 3.5rem;
        width: 3.5rem;
    }

    span :global(.bx--header__action:hover) {
        background-color: var(--cds-hover-primary);
    }

    #logo img {
        height: 2rem;
    }

    @media only screen and (min-width: 1056px) {
        #logo {
            padding-left: 3.5rem;
        }
    }
</style>

<span class="bx--header">
    <Header>
        <a id="logo" href="/"><img alt="logo" src={logo} /></a>
        <div slot="skip-to-content">
            <SkipToContent />
        </div>
        <HeaderUtilities>
            <HeaderGlobalAction
                on:click={handleDarkModeClick}
                aria-label="Dark mode"
                {icon} />
            <HeaderGlobalAction aria-label="User Profile" icon={UserAvatar} />
        </HeaderUtilities>
    </Header>
</span>
