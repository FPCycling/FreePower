<script>
    export let segment;
    import Header from '../components/Header.svelte';
    import Theme from '../components/Theme.svelte';
</script>

<Theme persist theme="g10">
    <Header {segment} />
    <div style="background: none; padding: 1rem;margin-top:3.5rem">
        <div>
            <slot />
        </div>
    </div>
</Theme>
