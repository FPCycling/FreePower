<script>
    export let status;
    export let error;
    const dev = process.env.NODE_ENV === 'development';
</script>

<div>
    <div>
        <h1>{status}</h1>
        <div>
            {error.message}
            <a href="/">Return home</a>
        </div>
        {#if dev && error.stack}
            <div>
                <pre>{error.stack}</pre>
            </div>
        {/if}
    </div>
</div>
