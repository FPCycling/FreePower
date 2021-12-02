<script lang="ts">
    import { currentWatts, currentTime, nextInterval } from '../_stores/currentWorkout';
    import { heartRate } from '../_stores/heartRate';
    import { trainerMetrics } from '../_stores/trainer';
    import { formatMs } from '../../../utils/time';
    import LargeTile from '../../../components/LargeTile.svelte';

    function formatNumber(number) {
        if (number === -1) return 'N/A';
        return String(number);
    }
</script>

<div class="statsGrid">
    <div>
        <div>
            <LargeTile title="Power">
                {formatNumber($trainerMetrics.power)}
            </LargeTile>
        </div>
        <div>
            <LargeTile title="Interval time" subTitle={`next interval ${$nextInterval.nextWatts}`}>
                {formatMs($nextInterval.in)}
            </LargeTile>
        </div>
        <div>
            <LargeTile title="Heart rate">{formatNumber($heartRate)}</LargeTile>
        </div>
    </div>

    <div>
        <div>
            <LargeTile title="Target">{$currentWatts}</LargeTile>
        </div>
        <div>
            <LargeTile title="Time">{formatMs($currentTime)}</LargeTile>
        </div>
        <div>
            <LargeTile title="Cadence">
                {formatNumber($trainerMetrics.cadence)}
            </LargeTile>
        </div>
    </div>
</div>

<style>
    :global(.statsGrid) {
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
</style>
