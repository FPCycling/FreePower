<script lang="ts">
    import {
        currentWatts,
        currentTime,
        nextInterval,
    } from "../_stores/currentWorkout";
    import { heartRate } from "../_stores/heartRate";
    import { trainerMetrics } from "../_stores/trainer";
    import { toTimeFormat } from "../../../utils/time";
    import { Grid, Row, Column } from "carbon-components-svelte";
    import LargeTile from "../../../components/LargeTile.svelte";

    function formatNumber(number) {
        if (number === -1) return "N/A";
        return String(number);
    }
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
            <LargeTile title="Power">
                {formatNumber($trainerMetrics.power)}
            </LargeTile>
        </Column>
        <Column>
            <LargeTile
                title="Interval time"
                subTitle={`next interval ${$nextInterval.nextWatts}`}>
                {toTimeFormat($nextInterval.in)}
            </LargeTile>
        </Column>
        <Column>
            <LargeTile title="Heart rate">{formatNumber($heartRate)}</LargeTile>
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
            <LargeTile title="Cadence">
                {formatNumber($trainerMetrics.cadence)}
            </LargeTile>
        </Column>
    </Row>
</Grid>
