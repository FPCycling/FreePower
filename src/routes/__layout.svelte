<script>
    import '../app.css';
    import Header from '../components/Header.svelte';
    import Theme from '../components/Theme.svelte';
</script>

<Theme>
    <Header />
    <div class="pt-10 pl-20 pr-20">
        <slot />
    </div>
</Theme>
