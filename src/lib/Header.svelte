<script lang="ts">
    import logo_light from '../../static/logo_light.png?url';
    import logo_dark from '../../static/logo_dark.png?url';
    import { getThemeContext } from '../contexts/themeContext';

    const { carbon_theme, dark, light } = getThemeContext();
    let logo: string;

    $: {
        logo = $dark ? logo_dark : logo_light;
    }
    function handleDarkModeClick() {
        carbon_theme.set($light ? 'g90' : 'g10');
    }
</script>

<span class="bx--header h-14 shadow-lg bg-white">
    <a id="logo" href="/"><img alt="logo" src={logo} /></a>
</span>

<style>
    span :global(.bx--header) {
        background-color: var(--cds-ui-01);
        border-bottom: none;
        box-shadow: 0 -3px 10px 0 #32293d;
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
