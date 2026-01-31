<script lang="ts">
    import { currentTime } from '../_stores/currentWorkout';
    import { onDestroy } from 'svelte';
    import { activateAudioContext } from '../../../utils/sounds';
    import Button from '../../../components/design/buttons/Button.svelte';

    onDestroy(currentTime.pause);
</script>

<div class="grid grid-cols-6 gap-5">
    <Button
        onclick={() => {
            activateAudioContext();
            currentTime.start();
        }}
    >
        Start
    </Button>
    <Button onclick={currentTime.pause}>Pause</Button>
    <Button kind="danger" onclick={currentTime.reset}>Reset</Button>
    <Button kind="minimal" onclick={() => currentTime.add(10 * 1000)}>+10 sec</Button>
    <Button kind="minimal" onclick={() => currentTime.add(60 * 1000)}>+1 min</Button>
    <Button kind="minimal" onclick={() => currentTime.add(5 * 60 * 1000)}>+5 min</Button>
</div>
