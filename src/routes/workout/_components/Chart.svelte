<script lang="ts">
    import type { WorkoutData } from '../../../types/workout';
    import { line, curveStepAfter, scaleLinear, extent, bisector, select, pointer } from 'd3';
    import type { NumberValue, Selection } from 'd3';
    import { onMount } from 'svelte';
    import { formatMs } from '../../../utils/time';

    let { data, currentTime }: { data: WorkoutData[]; currentTime: number } = $props();

    let el: SVGElement;

    let width = $state(200);
    const height = 300;

    let xScale = $derived.by(() => {
        if (!data || data.length === 0) return undefined;
        const extentX = extent(data, (d) => d.startMs) as [number, number];
        return scaleLinear().domain(extentX).range([0, width]);
    });

    let yScale = $derived.by(() => {
        if (!data || data.length === 0) return undefined;
        const extentY = [0, (extent(data, (d) => d.watts)[1] || 0) + 30];
        return scaleLinear().domain(extentY).range([height, 0]);
    });

    let workoutPathString = $derived.by(() => {
        if (!data || data.length === 0 || !xScale || !yScale) return '';
        const workoutPath = line<WorkoutData>()
            .x((d) => xScale(d.startMs))
            .y((d) => yScale(d.watts))
            .curve(curveStepAfter);
        return workoutPath(data) || '';
    });

    let currentScaled = $derived(xScale ? xScale(currentTime) : 0);

    let xPath = $derived(`M${30 + 0.5},6V0H${width + 1}V6`);

    function bisect(pointerX: NumberValue) {
        const startMs = xScale!.invert(pointerX);
        const index = bisector<WorkoutData, number>((d) => d.startMs).right(data, startMs, 1);
        const nextInterval = data[index];
        const currentInterval = data[index - 1];
        return {
            watts: currentInterval?.watts,
            duration: (nextInterval?.startMs ?? 0) - (currentInterval?.startMs ?? 0),
        };
    }

    function displayTooltip(
        g: Selection<SVGGElement, unknown, null, undefined>,
        pointerY: number | null,
        tooltipY?: number,
        value?: string,
    ) {
        if (!value) return g.style('display', 'none');

        g.style('display', null);

        const path = g.selectAll('path').data([null]).join('path').attr('fill', 'white').attr('stroke', 'black');

        const text = g
            .selectAll('text')
            .data([null])
            .join('text')
            .call((text) =>
                text
                    .selectAll('tspan')
                    .data(value.split(/\n/))
                    .join('tspan')
                    .attr('x', 0)
                    .attr('y', (_, i) => `${i * 1.1}em`)
                    .text((d) => d)
                    .style('font-weight', (_, i) => (i ? null : 'bold')),
            );

        const { y, width: w, height: h } = (text.node() as any).getBBox();

        if (typeof tooltipY === 'number' && pointerY !== null && tooltipY > pointerY) {
            text.attr('transform', `translate(${-w / 2},${15 - y})`);
            path.attr('d', `M${-w / 2 - 10} 5 H -5 l 5 -5 l 5 5 H ${w / 2 + 10} v ${h + 20} h-${w + 20}z`);
        } else {
            text.attr('transform', `translate(${-w / 2},-${22 - y})`);
            path.attr('d', `M${-w / 2 - 10} -5 H -5 l 5 5 l 5 -5 H${w / 2 + 10} v -${h + 20} h -${w + 20}z`);
        }
    }

    onMount(() => {
        const svg = select(el);
        const tooltip = svg.append('g').attr('class', 'pointer-events-none select-none text-3xl');

        svg.on('touchmove mousemove', function (event) {
            const pointerData = pointer(event, this);
            const { watts, duration } = bisect(pointerData[0]);
            const startMs = xScale!.invert(pointerData[0]);

            tooltip.attr('transform', `translate(${pointerData[0]},${yScale!(watts)})`).call(
                displayTooltip,
                pointerData[1],
                yScale!(watts),
                `${watts} watts - ${formatMs(startMs)}
${formatMs(duration)}`,
            );
        });

        svg.on('touchend mouseleave', () => tooltip.call(displayTooltip, null));
    });
</script>

<svelte:window bind:innerWidth={width} />
<svg
    class="mt-20 w-full h-full overflow-visible"
    bind:this={el}
    preserveAspectRatio="xMinYMin"
    viewBox={`0 0 ${width} ${height}`}
>
    <g>
        <path class="stroke-pink-400 stroke-3" id="workout" d={workoutPathString} fill="none" />
    </g>
    <g>
        <line
            class="stroke-neutral-900 dark:stroke-neutral-400"
            id="current"
            x1={currentScaled}
            x2={currentScaled}
            y1="0"
            y2={height}
        />
    </g>

    <g transform="translate(0, {height})">
        <path d={xPath} fill="none" />
    </g>
</svg>
