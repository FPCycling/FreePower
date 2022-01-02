<script lang="ts">
    import { currentTime } from '../_stores/currentWorkout';
    import { onDestroy } from 'svelte';
    import { activateAudioContext } from '../../../utils/sounds';

    onDestroy(currentTime.pause);
</script>

<div class="grid grid-cols-6 gap-5">
    <button
        on:click={() => {
            activateAudioContext();
            currentTime.start();
        }}
    >
        Start
    </button>
    <button on:click={currentTime.pause}>Pause</button>
    <button on:click={currentTime.reset}>Reset</button>
    <button on:click={() => currentTime.add(10 * 1000)}> +10 sec </button>
    <button on:click={() => currentTime.add(60 * 1000)}>+1 min</button>
    <button on:click={() => currentTime.add(5 * 60 * 1000)}> +5 min </button>
</div>
