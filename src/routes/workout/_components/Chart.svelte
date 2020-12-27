<script lang="ts">
    import type { WorkoutData } from "../../../types/workout";
    import {
        line,
        curveStepAfter,
        scaleLinear,
        extent,
        scaleTime,
        bisector,
        select,
        pointer,
    } from "d3";
    import type { Line, ScaleTime, ScaleLinear, NumberValue } from "d3";
    import { onMount } from "svelte";
    import { formatMs } from "../../../utils/time";

    export let data: WorkoutData[];
    export let currentTime: number;

    let el: SVGElement;

    let width = 200;
    const height = 300;

    let xPath: string;
    let yPath: string;
    let workoutPath: Line<WorkoutData>;
    let currentScaled: number;
    let xScale: ScaleLinear<number, number, never>;
    let yScale: ScaleLinear<number, number, never>;
    let yTicks: number[];

    $: {
        console.log("updating...");
        xScale = scaleLinear()
            .domain(extent(data, (d) => d.startMs))
            .range([0, width]);

        const extentY = [0, extent(data, (d) => d.watts)[1] + 30];
        yScale = scaleLinear().domain(extentY).range([height, 0]);

        workoutPath = line<WorkoutData>()
            .x((d) => xScale(d.startMs))
            .y((d) => yScale(d.watts))
            .curve(curveStepAfter);

        yTicks = [];
        for (let i = extentY[0]; i < extentY[1]; i += 30) {
            yTicks.push(Math.floor(i / 5) * 5);
        }

        xPath = `M${30 + 0.5},6V0H${width + 1}V6`;
        yPath = `M-6,${height + 0.5}H0.5V0.5H-6`;
    }

    $: {
        currentScaled = xScale(currentTime);
    }

    function bisect(pointerX: NumberValue) {
        const startMs = xScale.invert(pointerX);
        const index = bisector<WorkoutData, number>((d) => d.startMs).right(
            data,
            startMs,
            1
        );
        return data[index - 1];
    }

    function displayTooltip(g, value: string) {
        if (!value) return g.style("display", "none");

        g.style("display", null)
            .style("pointer-events", "none")
            .style("font", "10px sans-serif");

        const path = g
            .selectAll("path")
            .data([null])
            .join("path")
            .attr("fill", "white")
            .attr("stroke", "black");

        const text = g
            .selectAll("text")
            .data([null])
            .join("text")
            .call((text) =>
                text
                    .selectAll("tspan")
                    .data(value.split(/\n/))
                    .join("tspan")
                    .attr("x", 0)
                    .attr("y", (_, i) => `${i * 1.1}em`)
                    .style("font-weight", (_, i) => (i ? null : "bold"))
                    .text((d) => d)
            );

        const { y, width: w, height: h } = text.node().getBBox();

        text.attr("transform", `translate(${-w / 2},${15 - y})`);
        path.attr(
            "d",
            `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`
        );
    }

    onMount(() => {
        const svg = select(el);
        const tooltip = svg.append("g");

        svg.on("touchmove mousemove", function (event) {
            const pointerX = pointer(event, this)[0];
            const { watts } = bisect(pointerX);
            const startMs = xScale.invert(pointerX);

            tooltip
                .attr("transform", `translate(${pointerX},${yScale(watts)})`)
                .call(displayTooltip, `${watts} - ${formatMs(startMs)}`);
        });

        svg.on("touchend mouseleave", () => tooltip.call(displayTooltip, null));
    });
</script>

<style>
    svg {
        width: 100%;
        height: 100%;
        overflow: visible;
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
