<script lang="ts">
    import '../app.css';
    import { onMount, type Snippet } from 'svelte';
    import Header from '../components/Header.svelte';
    import Theme from '../components/Theme.svelte';
    import RideDialog from '../components/Rides/RideDialog.svelte';
    import RideRecoveryPrompt from '../components/Rides/RideRecoveryPrompt.svelte';
    import { rideDialog, watchRides } from '../stores/rides';

    let { children }: { children: Snippet } = $props();

    onMount(() => {
        void watchRides();
    });

    function closeRideDialog() {
        const request = $rideDialog;
        rideDialog.set(null);
        request?.onClose?.();
    }

    function resumeFromRideDialog() {
        const request = $rideDialog;
        rideDialog.set(null);
        request?.onResume?.();
    }
</script>

<Theme>
    <Header />
    <div class="pt-10 pl-20 pr-20">
        {@render children()}
    </div>

    <RideRecoveryPrompt />

    {#if $rideDialog}
        {#key $rideDialog.ride.id}
            <RideDialog
                ride={$rideDialog.ride}
                points={$rideDialog.points}
                justFinished={$rideDialog.justFinished}
                onResume={$rideDialog.onResume ? resumeFromRideDialog : undefined}
                onClose={closeRideDialog}
            />
        {/key}
    {/if}
</Theme>
