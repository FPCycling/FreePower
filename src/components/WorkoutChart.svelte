<script lang="ts">
    import type { WorkoutData } from "../types/workout";
    import { line, curveLinear, scaleLinear, extent, scaleTime } from "d3";
    import type { Line, ScaleTime, ScaleLinear } from "d3";

    export let data: WorkoutData[];
    export let currentTime: number;

    let el;

    let width = 200;
    const height = 300;

    let xPath: string;
    let yPath: string;
    let workoutPath: Line<WorkoutData>;
    let currentScaled: number;
    let xScale: ScaleTime<number, number, never>;
    let yScale: ScaleLinear<number, number, never>;
    let yTicks: number[];

    $: {
        xScale = scaleTime()
            .domain(extent(data, (d) => d.startMs))
            .range([0, width]);

        const extentY = [0, extent(data, (d) => d.watts)[1] + 30];
        yScale = scaleLinear().domain(extentY).range([height, 0]);

        currentScaled = xScale(currentTime);

        workoutPath = line<WorkoutData>()
            .x((d) => xScale(d.startMs))
            .y((d) => yScale(d.watts))
            .curve(curveLinear);

        yTicks = [];
        for (let i = extentY[0]; i < extentY[1]; i += 30) {
            yTicks.push(Math.floor(i / 5) * 5);
        }

        xPath = `M${30 + 0.5},6V0H${width + 1}V6`;
        yPath = `M-6,${height + 0.5}H0.5V0.5H-6`;
    }
</script>

<style>
    svg {
        width: 100%;
        height: 100%;
    }
    .tick {
        font-size: 11px;
    }

    path#workout {
        stroke: var(--cds-active-primary);
        stroke-width: 3;
    }

    line#current {
        stroke: var(--cds-interactive-02);
        stroke-width: 3;
    }
</style>

<svelte:window bind:innerWidth={width} />
<svg
    bind:this={el}
    preserveAspectRatio="xMinYMin"
    viewBox={`0 0 ${width} ${height}`}>
    <g>
        <path id="workout" d={workoutPath(data)} fill="none" />
    </g>
    <g>
        <!-- svelte-ignore component-name-lowercase -->
        <line
            id="current"
            x1={currentScaled}
            x2={currentScaled}
            y1="0"
            y2={height} />
    </g>

    <g>
        <path stroke="white" d={yPath} fill="none" />

        {#each yTicks as y}
            <g class="tick" opacity="1" transform="translate(0,{yScale(y)})">
                <!-- svelte-ignore component-name-lowercase -->
                <line x2="-5" />
                <text dy="0.32em" fill="currentColor" x="-{0}">{y}</text>
            </g>
        {/each}
    </g>

    <g transform="translate(0, {height})">
        <path d={xPath} fill="none" />
    </g>
</svg>
