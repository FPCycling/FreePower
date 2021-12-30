<script>
    import '../app.css';
    import Header from '$lib/Header.svelte';
    import Theme from '../components/Theme.svelte';
</script>

<Theme>
    <Header>
        <div style="background: none; padding: 1rem;margin-top:3.5rem">
            <div>
                <slot />
            </div>
        </div>
    </Header>
</Theme>

<slot />
