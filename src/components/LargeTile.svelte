<script lang="ts">
    export let title: string;
    export let subTitle: string = undefined;
</script>

<style>
    .title {
        text-transform: uppercase;
        color: var(--neutral-5);
        font-weight: bold;
        margin-bottom: -1rem;
    }
    .content {
        font-weight: bold;
        font-size: 5rem;
    }
    .tile {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        min-width: 8rem;
        min-height: 4rem;
        padding: 1rem;
        background-color: var(--cds-ui-01, #f4f4f4);
        outline: 2px solid transparent;
        outline-offset: -2px;
    }

    .subtitle {
        color: var(--neutral-6);
        font-weight: bold;
        margin-top: -1.5rem;
        padding-top: 0.5rem;
        margin-bottom: -0.5rem;
    }
</style>

<div class="tile">
    <p class="title">{title}</p>
    <p class="content">
        <slot />
    </p>
    {#if subTitle}
        <p class="subtitle">{subTitle}</p>
    {/if}
</div>
