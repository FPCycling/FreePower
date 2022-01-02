<script lang="ts">
    import { currentTime } from '../_stores/currentWorkout';
    import { onDestroy } from 'svelte';
    import { activateAudioContext } from '../../../utils/sounds';
    import Button from '../../../components/design/buttons/Button.svelte';

    onDestroy(currentTime.pause);
</script>

<div class="grid grid-cols-6 gap-5">
    <Button
        on:click={() => {
            activateAudioContext();
            currentTime.start();
        }}
    >
        Start
    </Button>
    <Button on:click={currentTime.pause}>Pause</Button>
    <Button kind="danger" on:click={currentTime.reset}>Reset</Button>
    <Button kind="minimal" on:click={() => currentTime.add(10 * 1000)}>+10 sec</Button>
    <Button kind="minimal" on:click={() => currentTime.add(60 * 1000)}>+1 min</Button>
    <Button kind="minimal" on:click={() => currentTime.add(5 * 60 * 1000)}>+5 min</Button>
</div>
