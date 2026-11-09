<script lang="ts">
    import { currentTime } from '../_stores/currentWorkout';
    import { onDestroy, onMount } from 'svelte';
    import { activateAudioContext } from '../../../utils/sounds';
    import Button from '../../../components/design/buttons/Button.svelte';
    import {
        workoutRecording,
        RecordingStatus,
        startRecording,
        pauseRecording,
        resetRecording,
        stopRecording,
    } from '../_stores/workoutRecording';

    let status = $derived($workoutRecording.status);

    function handleStart() {
        activateAudioContext();
        currentTime.start();
        startRecording();
    }

    function handlePause() {
        currentTime.pause();
        pauseRecording();
    }

    function toggle() {
        if (status === RecordingStatus.Recording) handlePause();
        else if (status !== RecordingStatus.Completed) handleStart();
    }

    function handleReset() {
        if ($workoutRecording.dataPointCount > 0 && !confirm('Reset this workout? Recorded data will be lost.')) return;
        currentTime.reset();
        resetRecording();
    }

    function handleStop() {
        currentTime.pause();
        stopRecording();
    }

    function isTyping(target: EventTarget | null) {
        return target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable]') !== null;
    }

    // Space toggles start/pause. keyup is cancelled too so a focused button is not clicked by the same press.
    function handleKey(event: KeyboardEvent) {
        if (event.code !== 'Space' || isTyping(event.target)) return;
        event.preventDefault();
        if (event.type === 'keydown' && !event.repeat) toggle();
    }

    onMount(() => {
        window.addEventListener('keydown', handleKey);
        window.addEventListener('keyup', handleKey);
    });

    onDestroy(() => {
        window.removeEventListener('keydown', handleKey);
        window.removeEventListener('keyup', handleKey);
        currentTime.pause();
        pauseRecording();
    });
</script>

<div class="flex flex-wrap items-center gap-2">
    {#if status === RecordingStatus.Completed}
        <Button kind="outline" size="lg" onclick={handleReset}>Reset</Button>
    {:else}
        <Button size="lg" class="min-w-28 sm:min-w-36" onclick={toggle}>
            {#if status === RecordingStatus.Recording}❚❚ Pause{:else if status === RecordingStatus.Paused}▶ Resume{:else}▶
                Start{/if}
        </Button>
        {#if status !== RecordingStatus.NotStarted}
            <Button kind="outline" size="lg" onclick={handleStop}>■ Stop</Button>
        {/if}
        {#if status === RecordingStatus.Paused}
            <Button kind="minimal" onclick={handleReset}>Reset</Button>
        {/if}
    {/if}
</div>
