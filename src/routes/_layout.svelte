<script>
    export let segment;
    import { Content, Grid } from 'carbon-components-svelte';
    import Header from '../components/Header.svelte';
    import Theme from '../components/Theme.svelte';
</script>

<Theme persist theme="g10">
    <Header {segment} />
    <Content style="background: none; padding: 1rem;margin-top:3.5rem">
        <Grid>
            <slot />
        </Grid>
    </Content>
</Theme>
