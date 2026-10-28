<script lang="ts">
    import type { FlattenedStep } from '../../types/workout';
    import { getStepColor } from '../../utils/workoutUtils';

    interface Props {
        steps: FlattenedStep[];
    }

    let { steps }: Props = $props();

    const totalDuration = $derived(steps.reduce((sum, step) => sum + step.duration, 0));
    // Same scaling as WorkoutTile so both views look alike
    const maxPower = $derived(Math.max(120, ...steps.map((s) => s.percentFtp)));
</script>

<div class="profile" aria-hidden="true">
    {#each steps as step, index (index)}
        <div
            class="bar"
            style:width="{(step.duration / totalDuration) * 100}%"
            style:height="{(step.percentFtp / maxPower) * 100}%"
            style:background-color={getStepColor(step.percentFtp)}
        ></div>
    {/each}
</div>

<style>
    .profile {
        display: flex;
        align-items: flex-end;
        height: 100%;
        overflow: hidden;
        border-radius: 4px;
        background: #f3f4f6;
    }

    .bar {
        flex-shrink: 0;
    }

    :global(.dark) .profile {
        background: #1f2937;
    }
</style>
