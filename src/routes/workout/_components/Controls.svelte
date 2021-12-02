<script lang="ts">
    import { currentTime } from '../_stores/currentWorkout';
    import { onDestroy } from 'svelte';
    import { activateAudioContext } from '../../../utils/sounds';

    onDestroy(currentTime.pause);
</script>

<button
    on:click={() => {
        activateAudioContext();
        currentTime.start();
    }}
>
    Start
</button>
<button on:click={currentTime.pause}>Pause</button>
<button kind="danger" on:click={currentTime.reset}>Reset</button>
<button kind="ghost" on:click={() => currentTime.add(10 * 1000)}> +10 sec </button>
<button kind="ghost" on:click={() => currentTime.add(60 * 1000)}>+1 min</button>
<button kind="ghost" on:click={() => currentTime.add(5 * 60 * 1000)}> +5 min </button>
