<script lang="ts">
    import Button from '../../../components/design/buttons/Button.svelte';
    import { workoutRecording, RecordingStatus, getRecordingData, getStartTime } from '../_stores/workoutRecording';
    import { generateFitFile, downloadFitFile } from '../../../utils/fitFileGenerator';

    function generateAndDownloadFit() {
        const dataPoints = getRecordingData();
        const startTime = getStartTime();

        if (!dataPoints.length || !startTime) {
            alert('No workout data to export');
            return;
        }

        try {
            const fitBlob = generateFitFile(dataPoints, startTime);
            downloadFitFile(fitBlob, startTime);
        } catch (error) {
            console.error('Error generating FIT file:', error);
            alert('Error generating FIT file. Check console for details.');
        }
    }

    $: canExport = $workoutRecording.status === RecordingStatus.Completed && $workoutRecording.dataPointCount > 0;
</script>

<div class="mt-4">
    <Button onclick={generateAndDownloadFit} class={!canExport ? 'opacity-50 cursor-not-allowed' : ''}>
        Export .FIT File
    </Button>

    {#if $workoutRecording.status === RecordingStatus.Recording}
        <span class="ml-3 text-sm text-green-500">● Recording</span>
    {:else if $workoutRecording.status === RecordingStatus.Paused}
        <span class="ml-3 text-sm text-yellow-500">Paused</span>
    {:else if $workoutRecording.status === RecordingStatus.Completed}
        <span class="ml-3 text-sm text-blue-500">✓ Ready to export</span>
    {/if}
</div>
