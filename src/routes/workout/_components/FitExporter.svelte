<script lang="ts">
    import Button from '../../../components/design/buttons/Button.svelte';
    import { workoutRecording, RecordingStatus, getRecordingData, getStartTime } from '../_stores/workoutRecording';
    import { FitWriter } from '@markw65/fit-file-writer';

    function generateAndDownloadFit() {
        const dataPoints = getRecordingData();
        const startTime = getStartTime();

        if (!dataPoints.length || !startTime) {
            alert('No workout data to export');
            return;
        }

        try {
            // Create FIT file writer
            const fitWriter = new FitWriter();

            // Calculate workout statistics
            const lastDataPoint = dataPoints[dataPoints.length - 1];
            if (!lastDataPoint) return;

            const totalDuration = lastDataPoint.timestamp;
            const avgPower = dataPoints.reduce((sum, dp) => sum + dp.power, 0) / dataPoints.length;
            const maxPower = Math.max(...dataPoints.map((dp) => dp.power));
            const avgHeartRate =
                dataPoints.filter((dp) => dp.heartRate > 0).reduce((sum, dp) => sum + dp.heartRate, 0) /
                    dataPoints.filter((dp) => dp.heartRate > 0).length || 0;
            const maxHeartRate = Math.max(...dataPoints.map((dp) => dp.heartRate));
            const avgCadence =
                dataPoints.filter((dp) => dp.cadence > 0).reduce((sum, dp) => sum + dp.cadence, 0) /
                    dataPoints.filter((dp) => dp.cadence > 0).length || 0;
            const totalDistance = lastDataPoint.distance;

            // Write file_id message
            fitWriter.writeMessage(
                'file_id',
                {
                    type: 'activity',
                    manufacturer: 'development',
                    product: 0,
                    time_created: fitWriter.time(startTime),
                    serial_number: 0,
                },
                null,
                true,
            );

            // Write event (start)
            fitWriter.writeMessage('event', {
                event: 'timer',
                event_type: 'start',
                timestamp: fitWriter.time(startTime),
            });

            // Write all data points as records
            dataPoints.forEach((dataPoint, index) => {
                const recordTimestamp = new Date(startTime.getTime() + dataPoint.timestamp * 1000);
                const isLastRecord = index === dataPoints.length - 1;

                const recordData: any = {
                    timestamp: fitWriter.time(recordTimestamp),
                };

                if (dataPoint.power > 0) recordData.power = Math.round(dataPoint.power);
                if (dataPoint.heartRate > 0) recordData.heart_rate = Math.round(dataPoint.heartRate);
                if (dataPoint.cadence > 0) recordData.cadence = Math.round(dataPoint.cadence);
                if (dataPoint.speed > 0) recordData.speed = dataPoint.speed;
                if (dataPoint.distance > 0) recordData.distance = Math.round(dataPoint.distance);

                fitWriter.writeMessage('record', recordData, null, isLastRecord);
            });

            // Write event (stop)
            const endTime = new Date(startTime.getTime() + totalDuration * 1000);
            fitWriter.writeMessage('event', {
                event: 'timer',
                event_type: 'stop_all',
                timestamp: fitWriter.time(endTime),
            });

            // Write lap (one lap for entire workout)
            const lapData: any = {
                sport: 'cycling',
                start_time: fitWriter.time(startTime),
                timestamp: fitWriter.time(endTime),
                total_elapsed_time: totalDuration,
                total_timer_time: totalDuration,
                avg_power: Math.round(avgPower),
                max_power: Math.round(maxPower),
                total_distance: Math.round(totalDistance),
                event: 'lap',
                event_type: 'stop',
                lap_trigger: 'session_end',
            };

            if (avgHeartRate > 0) {
                lapData.avg_heart_rate = Math.round(avgHeartRate);
                lapData.max_heart_rate = Math.round(maxHeartRate);
            }
            if (avgCadence > 0) {
                lapData.avg_cadence = Math.round(avgCadence);
            }

            fitWriter.writeMessage('lap', lapData, null, true);

            // Write session
            const sessionData: any = {
                sport: 'cycling',
                sub_sport: 'virtual_activity',
                start_time: fitWriter.time(startTime),
                timestamp: fitWriter.time(endTime),
                total_elapsed_time: totalDuration,
                total_timer_time: totalDuration,
                avg_power: Math.round(avgPower),
                max_power: Math.round(maxPower),
                total_distance: Math.round(totalDistance),
                event: 'session',
                event_type: 'stop',
                trigger: 'activity_end',
            };

            if (avgHeartRate > 0) {
                sessionData.avg_heart_rate = Math.round(avgHeartRate);
                sessionData.max_heart_rate = Math.round(maxHeartRate);
            }
            if (avgCadence > 0) {
                sessionData.avg_cadence = Math.round(avgCadence);
            }

            fitWriter.writeMessage('session', sessionData, null, true);

            // Write activity
            fitWriter.writeMessage(
                'activity',
                {
                    timestamp: fitWriter.time(endTime),
                    num_sessions: 1,
                    type: 'manual',
                    event: 'activity',
                    event_type: 'stop',
                },
                null,
                true,
            );

            // Get the FIT file data
            const fitData = fitWriter.finish();

            // Create blob and download
            const uint8Array = new Uint8Array(fitData.buffer as ArrayBuffer);
            const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Format filename with date
            const dateStr = startTime.toISOString().split('T')[0];
            const timeStr = startTime.toTimeString().split(' ')[0]?.replace(/:/g, '-') || '';
            a.download = `workout_${dateStr}_${timeStr}.fit`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
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
        {#if $workoutRecording.dataPointCount > 0}
            ({$workoutRecording.dataPointCount} data points)
        {/if}
    </Button>

    {#if $workoutRecording.status === RecordingStatus.Recording}
        <span class="ml-3 text-sm text-green-500">● Recording</span>
    {:else if $workoutRecording.status === RecordingStatus.Paused}
        <span class="ml-3 text-sm text-yellow-500">⏸ Paused</span>
    {:else if $workoutRecording.status === RecordingStatus.Completed}
        <span class="ml-3 text-sm text-blue-500">✓ Ready to export</span>
    {/if}
</div>
