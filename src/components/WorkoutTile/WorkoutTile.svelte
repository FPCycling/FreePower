<script lang="ts">
    import type { PlannedWorkout } from '../../types/workout';
    import { flattenWorkoutSteps, getStepColor } from '../../utils/workoutUtils';
    import { userFtp } from '../../stores/userSettings';
    import { mapIntervalsIcuWorkout } from '../../utils/mappers/intervalsIcuMapper';
    import { writableCurrentWorkout } from '../../routes/workout/_stores/currentWorkout';
    import { goto } from '$app/navigation';

    interface Props {
        workout: PlannedWorkout;
    }

    let { workout }: Props = $props();

    // Parse and format the date
    const workoutDate = $derived(() => {
        const date = new Date(workout.start_date_local);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    });

    // Flatten workout steps for visualization
    const flatSteps = $derived(() => {
        if (!workout.workout_doc?.steps) return [];
        return flattenWorkoutSteps(workout.workout_doc.steps);
    });

    // Calculate total duration for width calculations
    const totalDuration = $derived(() => {
        return flatSteps().reduce((sum, step) => sum + step.duration, 0);
    });

    // Find max power for height scaling - use actual max but with a minimum of 120%
    // This ensures high-intensity workouts don't overflow and low-intensity workouts aren't too small
    const maxPower = $derived(() => {
        const steps = flatSteps();
        if (steps.length === 0) return 120;
        const actualMax = Math.max(...steps.map((s) => s.percentFtp));
        // Use at least 120% to ensure Z2 workouts look decent, but scale up if needed for sprints
        return Math.max(120, actualMax);
    });

    // Format duration in seconds to readable format (e.g., "3m 30s" or "45s")
    function formatDuration(seconds: number): string {
        if (seconds < 60) {
            return `${seconds}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (remainingSeconds === 0) {
            return `${minutes}m`;
        }
        return `${minutes}m ${remainingSeconds}s`;
    }

    // Calculate watts from % FTP
    function calculateWatts(percentFtp: number): number {
        const ftp = $userFtp ?? 200;
        return Math.round((percentFtp * ftp) / 100);
    }

    // Custom tooltip state
    let hoveredStep = $state<{ watts: number; time: string; x: number; y: number } | null>(null);

    function handleStepHover(event: MouseEvent, watts: number, time: string) {
        event.stopPropagation(); // Prevent tile click when hovering steps
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        hoveredStep = {
            watts,
            time,
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
        };
    }

    function handleStepLeave() {
        hoveredStep = null;
    }

    // Format total duration for display
    const formattedTotalDuration = $derived(() => {
        const total = totalDuration();
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    });

    // Handle clicking the workout tile to select it
    function handleWorkoutClick() {
        try {
            const genericWorkout = mapIntervalsIcuWorkout(workout);
            writableCurrentWorkout.set(genericWorkout);
            goto('/workout');
        } catch (error) {
            console.error('Failed to load workout:', error);
        }
    }

    // Handle keyboard navigation
    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleWorkoutClick();
        }
    }
</script>

<div class="workout-tile" onclick={handleWorkoutClick} onkeydown={handleKeyDown} role="button" tabindex="0">
    <div class="workout-header">
        <h3 class="workout-title">{workoutDate()}</h3>
        <p class="workout-subtitle">{formattedTotalDuration()}</p>
    </div>

    <div class="workout-visual">
        {#if flatSteps().length > 0}
            {#each flatSteps() as step}
                {@const widthPercent = (step.duration / totalDuration()) * 100}
                {@const heightPercent = (step.percentFtp / maxPower()) * 90}
                {@const color = getStepColor(step.percentFtp)}
                {@const watts = calculateWatts(step.percentFtp)}
                {@const time = formatDuration(step.duration)}
                <div
                    class="workout-step"
                    role="button"
                    tabindex="0"
                    style:width="{widthPercent}%"
                    style:height="{heightPercent}%"
                    style:background-color={color}
                    onmouseenter={(e) => handleStepHover(e, watts, time)}
                    onmouseleave={handleStepLeave}
                ></div>
            {/each}
        {:else}
            <div class="no-workout-data">No workout data</div>
        {/if}
    </div>

    {#if workout.icu_training_load}
        <div class="workout-footer">
            <span class="workout-load">Load: {workout.icu_training_load}</span>
        </div>
    {/if}
</div>

{#if hoveredStep}
    <div class="custom-tooltip" style:left="{hoveredStep.x}px" style:top="{hoveredStep.y}px">
        {hoveredStep.watts}W for {hoveredStep.time}
    </div>
{/if}

<style>
    .workout-tile {
        width: 250px;
        height: 250px;
        background: white;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        transition:
            transform 0.2s,
            box-shadow 0.2s;
        cursor: pointer;
    }

    .workout-tile:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .workout-tile:active {
        transform: translateY(-2px);
    }

    .workout-header {
        margin-bottom: 12px;
    }

    .workout-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 4px 0;
        color: #1f2937;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .workout-subtitle {
        font-size: 12px;
        color: #6b7280;
        margin: 0;
    }

    .workout-footer {
        margin-top: 8px;
        font-size: 12px;
        color: #6b7280;
    }

    .workout-load {
        font-weight: 500;
    }

    .workout-visual {
        flex: 1;
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        gap: 0;
        overflow: hidden;
        border-radius: 8px;
        background: #f3f4f6;
        position: relative;
    }

    .workout-step {
        flex-shrink: 0;
        transition: opacity 0.2s;
        cursor: pointer;
    }

    .workout-step:hover {
        opacity: 0.8;
    }

    .custom-tooltip {
        position: fixed;
        transform: translate(-50%, -100%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        pointer-events: none;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    :global(.dark) .custom-tooltip {
        background: rgba(255, 255, 255, 0.95);
        color: #1f2937;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    .no-workout-data {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #9ca3af;
        font-size: 14px;
    }

    :global(.dark) .workout-tile {
        background: #1f2937;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    :global(.dark) .workout-tile:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    :global(.dark) .workout-title {
        color: #f9fafb;
    }

    :global(.dark) .workout-subtitle,
    :global(.dark) .workout-footer {
        color: #9ca3af;
    }

    :global(.dark) .workout-visual {
        background: #111827;
    }

    :global(.dark) .no-workout-data {
        color: #6b7280;
    }
</style>
