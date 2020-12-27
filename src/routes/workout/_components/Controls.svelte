<script lang="ts">
    import { currentTime } from "../_stores/currentWorkout";
    import { Button } from "carbon-components-svelte";
    import { onDestroy } from "svelte";
    import { activateAudioContext } from "../../../utils/sounds";

    onDestroy(currentTime.pause);
</script>

<Button
    on:click={() => {
        activateAudioContext();
        currentTime.start();
    }}>
    Start
</Button>
<Button on:click={currentTime.pause}>Pause</Button>
<Button kind="danger" on:click={currentTime.reset}>Reset</Button>
<Button kind="ghost" on:click={() => currentTime.add(10 * 1000)}>
    +10 sec
</Button>
<Button kind="ghost" on:click={() => currentTime.add(60 * 1000)}>+1 min</Button>
<Button kind="ghost" on:click={() => currentTime.add(5 * 60 * 1000)}>
    +5 min
</Button>
