/**
 * FIT File Generation Utilities
 *
 * Extracts FIT file generation logic for reuse across download and upload features
 */

import { FitWriter } from '@markw65/fit-file-writer';

// Re-export the type from workoutRecording for convenience
export type { WorkoutDataPoint as DataPoint } from '../routes/workout/_stores/workoutRecording';
import type { WorkoutDataPoint } from '../routes/workout/_stores/workoutRecording';

export interface WorkoutStats {
    totalDuration: number;
    avgPower: number;
    maxPower: number;
    avgHeartRate: number;
    maxHeartRate: number;
    avgCadence: number;
    totalDistance: number;
}

/**
 * Calculate statistics from workout data points
 */
export function calculateWorkoutStats(dataPoints: WorkoutDataPoint[]): WorkoutStats {
    const lastDataPoint = dataPoints[dataPoints.length - 1];

    const totalDuration = lastDataPoint?.timestamp || 0;
    const avgPower = dataPoints.reduce((sum, dp) => sum + dp.power, 0) / dataPoints.length;
    const maxPower = Math.max(...dataPoints.map((dp) => dp.power));

    const hrPoints = dataPoints.filter((dp) => dp.heartRate > 0);
    const avgHeartRate =
        hrPoints.length > 0 ? hrPoints.reduce((sum, dp) => sum + dp.heartRate, 0) / hrPoints.length : 0;
    const maxHeartRate = Math.max(...dataPoints.map((dp) => dp.heartRate));

    const cadencePoints = dataPoints.filter((dp) => dp.cadence > 0);
    const avgCadence =
        cadencePoints.length > 0 ? cadencePoints.reduce((sum, dp) => sum + dp.cadence, 0) / cadencePoints.length : 0;

    const totalDistance = lastDataPoint?.distance || 0;

    return {
        totalDuration,
        avgPower,
        maxPower,
        avgHeartRate,
        maxHeartRate,
        avgCadence,
        totalDistance,
    };
}

/**
 * Generate a FIT file blob from workout data
 */
export function generateFitFile(dataPoints: WorkoutDataPoint[], startTime: Date): Blob {
    if (!dataPoints.length || !startTime) {
        throw new Error('No workout data to export');
    }

    const fitWriter = new FitWriter();
    const stats = calculateWorkoutStats(dataPoints);

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
    const endTime = new Date(startTime.getTime() + stats.totalDuration * 1000);
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
        total_elapsed_time: stats.totalDuration,
        total_timer_time: stats.totalDuration,
        avg_power: Math.round(stats.avgPower),
        max_power: Math.round(stats.maxPower),
        total_distance: Math.round(stats.totalDistance),
        event: 'lap',
        event_type: 'stop',
        lap_trigger: 'session_end',
    };

    if (stats.avgHeartRate > 0) {
        lapData.avg_heart_rate = Math.round(stats.avgHeartRate);
        lapData.max_heart_rate = Math.round(stats.maxHeartRate);
    }
    if (stats.avgCadence > 0) {
        lapData.avg_cadence = Math.round(stats.avgCadence);
    }

    fitWriter.writeMessage('lap', lapData, null, true);

    // Write session
    const sessionData: any = {
        sport: 'cycling',
        sub_sport: 'virtual_activity',
        start_time: fitWriter.time(startTime),
        timestamp: fitWriter.time(endTime),
        total_elapsed_time: stats.totalDuration,
        total_timer_time: stats.totalDuration,
        avg_power: Math.round(stats.avgPower),
        max_power: Math.round(stats.maxPower),
        total_distance: Math.round(stats.totalDistance),
        event: 'session',
        event_type: 'stop',
        trigger: 'activity_end',
    };

    if (stats.avgHeartRate > 0) {
        sessionData.avg_heart_rate = Math.round(stats.avgHeartRate);
        sessionData.max_heart_rate = Math.round(stats.maxHeartRate);
    }
    if (stats.avgCadence > 0) {
        sessionData.avg_cadence = Math.round(stats.avgCadence);
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

    // Create blob
    // Note: fitData is a DataView whose ArrayBuffer may contain more
    // data than just the fit file. We need to use byteOffset and byteLength
    const uint8Array = new Uint8Array(fitData.buffer, fitData.byteOffset, fitData.byteLength) as any;
    return new Blob([uint8Array], { type: 'application/octet-stream' });
}

/**
 * Download a FIT file blob
 */
export function downloadFitFile(blob: Blob, startTime: Date): void {
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
}
