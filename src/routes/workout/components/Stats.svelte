<script lang="ts">
    import {
        currentWatts,
        currentTime,
        nextInterval,
    } from "../stores/currentWorkout";
    import { heartRate } from "../../../stores/heartRate";
    import { toTimeFormat } from "../../../utils/time";
    import { Grid, Row, Column } from "carbon-components-svelte";
    import LargeTile from "../../../components/LargeTile.svelte";
</script>

<style>
    :global(.statsGrid) {
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
</style>

<Grid class="statsGrid" noGutter condensed>
    <Row>
        <Column>
            <LargeTile title="Power">240</LargeTile>
        </Column>
        <Column>
            <LargeTile
                title="Interval time"
                subTitle={`next interval ${$nextInterval.nextWatts}`}>
                {toTimeFormat($nextInterval.in)}
            </LargeTile>
        </Column>
        <Column>
            <LargeTile title="Heart rate">{$heartRate}</LargeTile>
        </Column>
    </Row>

    <Row>
        <Column>
            <LargeTile title="Target">{$currentWatts}</LargeTile>
        </Column>
        <Column>
            <LargeTile title="Time">{toTimeFormat($currentTime)}</LargeTile>
        </Column>
        <Column>
            <LargeTile title="Cadence">95</LargeTile>
        </Column>
    </Row>
</Grid>
