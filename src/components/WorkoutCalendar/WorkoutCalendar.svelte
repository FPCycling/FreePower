<script lang="ts">
    import type { PlannedWorkout } from '../../types/workout';
    import { buildCalendarWeeks, groupByDateKey } from '../../utils/calendar';
    import { flattenWorkoutSteps } from '../../utils/workoutUtils';
    import { startPlannedWorkout } from '../../utils/startPlannedWorkout';
    import WorkoutProfile from '../WorkoutProfile/WorkoutProfile.svelte';

    interface Props {
        workouts: PlannedWorkout[];
        today?: Date;
        weekCount?: number;
    }

    let { workouts, today = new Date(), weekCount = 4 }: Props = $props();

    const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const weeks = $derived(buildCalendarWeeks(today, weekCount));
    const workoutsByDay = $derived(groupByDateKey(workouts));

    const rangeLabel = $derived.by(() => {
        const first = weeks[0]?.[0]?.date;
        const last = weeks.at(-1)?.at(-1)?.date;
        if (!first || !last) return '';
        const format = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${format(first)} – ${format(last)}, ${last.getFullYear()}`;
    });

    function formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.round((seconds % 3600) / 60);
        if (hours === 0) return `${minutes}m`;
        return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
    }

    function workoutSteps(workout: PlannedWorkout) {
        if (!workout.workout_doc?.steps) return [];
        return flattenWorkoutSteps(workout.workout_doc.steps, workout.workout_doc.zoneTimes);
    }

    function workoutDuration(workout: PlannedWorkout): number {
        return workout.workout_doc?.duration || workoutSteps(workout).reduce((sum, step) => sum + step.duration, 0);
    }

    // Show the month on the 1st and on the first cell, so every month in view is labeled
    function monthLabel(date: Date, isFirstCell: boolean): string | undefined {
        if (date.getDate() !== 1 && !isFirstCell) return undefined;
        return date.toLocaleDateString('en-US', { month: 'short' });
    }
</script>

<div class="calendar">
    <p class="range">{rangeLabel}</p>

    <div class="weekdays" aria-hidden="true">
        {#each WEEKDAYS as weekday (weekday)}
            <div>{weekday}</div>
        {/each}
    </div>

    <div class="grid">
        {#each weeks.flat() as day, index (day.key)}
            {@const dayWorkouts = workoutsByDay.get(day.key) ?? []}
            {@const month = monthLabel(day.date, index === 0)}
            <div
                class="day"
                class:today={day.isToday}
                class:past={day.isPast}
                class:weekend={day.isWeekend}
                class:empty={dayWorkouts.length === 0}
                aria-current={day.isToday ? 'date' : undefined}
            >
                <div class="day-head">
                    <span class="weekday">{WEEKDAYS[(day.date.getDay() + 6) % 7]}</span>
                    <span class="day-number">{day.date.getDate()}</span>
                    {#if month}
                        <span class="month">{month}</span>
                    {/if}
                    {#if day.isToday}
                        <span class="today-badge">Today</span>
                    {/if}
                </div>

                {#each dayWorkouts as workout (workout.id)}
                    {@const steps = workoutSteps(workout)}
                    <button type="button" class="entry" onclick={() => startPlannedWorkout(workout)}>
                        <span class="entry-name" title={workout.name}>{workout.name || 'Workout'}</span>
                        <span class="entry-meta">
                            {formatDuration(workoutDuration(workout))}
                            {#if workout.icu_training_load}
                                · {workout.icu_training_load} load
                            {/if}
                        </span>
                        {#if steps.length > 0}
                            <span class="entry-profile">
                                <WorkoutProfile {steps} />
                            </span>
                        {/if}
                    </button>
                {/each}
            </div>
        {/each}
    </div>
</div>

<style>
    .range {
        margin: 0 0 12px;
        font-size: 14px;
        font-weight: 500;
        color: #6b7280;
    }

    .weekdays,
    .grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 8px;
    }

    .weekdays {
        margin-bottom: 8px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6b7280;
        text-align: center;
    }

    .day {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-height: 140px;
        padding: 8px;
        border-radius: 12px;
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .day.weekend {
        background: #fafafa;
    }

    .day.past {
        opacity: 0.5;
    }

    .day.today {
        box-shadow:
            0 0 0 2px #d9457b,
            0 4px 12px rgba(217, 69, 123, 0.25);
    }

    .day-head {
        display: flex;
        align-items: center;
        gap: 6px;
        min-height: 26px;
    }

    .weekday {
        display: none;
    }

    .day-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 26px;
        height: 26px;
        border-radius: 999px;
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
    }

    .today .day-number {
        background: #d9457b;
        color: white;
    }

    .month {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        color: #6b7280;
    }

    .today-badge {
        margin-left: auto;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #d9457b;
    }

    .entry {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
        padding: 6px 8px;
        border-radius: 8px;
        border-left: 3px solid #d9457b;
        background: #f9fafb;
        text-align: left;
        transition:
            transform 0.15s,
            box-shadow 0.15s;
    }

    .entry:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    }

    .entry:focus-visible {
        outline: 2px solid #d9457b;
        outline-offset: 2px;
    }

    .entry-name {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font-size: 13px;
        font-weight: 600;
        line-height: 1.25;
        color: #1f2937;
    }

    .entry-meta {
        font-size: 12px;
        color: #6b7280;
    }

    .entry-profile {
        display: block;
        height: 28px;
    }

    :global(.dark) .range,
    :global(.dark) .weekdays,
    :global(.dark) .month,
    :global(.dark) .entry-meta {
        color: #9ca3af;
    }

    :global(.dark) .day {
        background: #1f2937;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    :global(.dark) .day.weekend {
        background: #1a2230;
    }

    :global(.dark) .day.today {
        box-shadow:
            0 0 0 2px #d9457b,
            0 4px 12px rgba(217, 69, 123, 0.35);
    }

    :global(.dark) .day-number,
    :global(.dark) .entry-name {
        color: #f9fafb;
    }

    :global(.dark) .today .day-number {
        color: white;
    }

    :global(.dark) .entry {
        background: #111827;
    }

    /* Phones: one day per row, agenda style */
    @media (max-width: 640px) {
        .weekdays {
            display: none;
        }

        .grid {
            grid-template-columns: minmax(0, 1fr);
        }

        .day {
            min-height: 0;
        }

        .day.past {
            display: none;
        }

        .weekday {
            display: inline;
            min-width: 32px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            color: #6b7280;
        }

        .day.empty {
            padding-top: 4px;
            padding-bottom: 4px;
        }
    }
</style>
