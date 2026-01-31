<script lang="ts">
    import { currentTime } from '../_stores/currentWorkout';
    import { onDestroy } from 'svelte';
    import { activateAudioContext } from '../../../utils/sounds';
    import Button from '../../../components/design/buttons/Button.svelte';
    import { startRecording, pauseRecording, resetRecording, stopRecording } from '../_stores/workoutRecording';

    onDestroy(() => {
        currentTime.pause();
        pauseRecording();
    });

    function handleStart() {
        activateAudioContext();
        currentTime.start();
        startRecording();
    }

    function handlePause() {
        currentTime.pause();
        pauseRecording();
    }

    function handleReset() {
        currentTime.reset();
        resetRecording();
    }

    function handleStop() {
        currentTime.pause();
        stopRecording();
    }
</script>

<div class="grid grid-cols-7 gap-5">
    <Button onclick={handleStart}>Start</Button>
    <Button onclick={handlePause}>Pause</Button>
    <Button kind="danger" onclick={handleReset}>Reset</Button>
    <Button onclick={handleStop}>Stop</Button>
    <Button kind="minimal" onclick={() => currentTime.add(10 * 1000)}>+10 sec</Button>
    <Button kind="minimal" onclick={() => currentTime.add(60 * 1000)}>+1 min</Button>
    <Button kind="minimal" onclick={() => currentTime.add(5 * 60 * 1000)}>+5 min</Button>
</div>
