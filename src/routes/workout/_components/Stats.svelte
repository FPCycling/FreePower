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

<div class="grid grid-rows-2 gap-0.5 pt-5">
    <div class="grid grid-cols-3 gap-0.5">
        <LargeTile title="Power">
            {formatNumber($trainerMetrics.power)}
        </LargeTile>
        <LargeTile title="Interval time" subTitle={`next interval ${$nextInterval.nextWatts}`}>
            {formatMs($nextInterval.in)}
        </LargeTile>
        <LargeTile title="Heart rate">{formatNumber($heartRate)}</LargeTile>
    </div>

    <div class="grid grid-cols-3 gap-0.5">
        <LargeTile title="Target">{$currentWatts}</LargeTile>
        <LargeTile title="Time">{formatMs($currentTime)}</LargeTile>
        <LargeTile title="Cadence">
            {formatNumber($trainerMetrics.cadence)}
        </LargeTile>
    </div>
</div>
