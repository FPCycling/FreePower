<script lang="ts">
    import { SkipToContent, Header, HeaderUtilities, HeaderGlobalAction } from 'carbon-components-svelte';
    import UserAvatar20 from 'carbon-icons-svelte/lib/UserAvatar20';
    import { getContext } from 'svelte';
    const ctx = getContext('Theme') as any;
    $: if (ctx) {
        ctx.updateVar('--cds-productive-heading-06-font-size', '4rem');
    }
</script>

<style>
    span :global(.bx--header) {
        background-color: #3f334d;
        border-bottom: 1px solid #3f334d;
    }

    span :global(a.bx--header__name) {
        color: #d9457b;
    }
</style>

<span class="bx--header">
    <Header class="custom-header">
        <a href="/">Free Power</a>
        <div slot="skip-to-content">
            <SkipToContent />
        </div>
        <HeaderUtilities>
            <HeaderGlobalAction aria-label="User Avatar" icon={UserAvatar20} />
        </HeaderUtilities>
    </Header>
</span>
