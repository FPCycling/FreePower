<script>
    import Header from '$lib/Header.svelte';
    import Theme from '../components/Theme.svelte';
</script>

<Theme persist theme="g10">
    <Header />
    <div style="background: none; padding: 1rem;margin-top:3.5rem">
        <div>
            <slot />
        </div>
    </div>
</Theme>
