import { get } from 'svelte/store';
import type { WorkerEvent } from '../_workers/types';
import { _setWorker, currentTime, setCurrentTimeMs } from './currentWorkout';
import { RecordingStatus, getElapsedSeconds, onRecordingTick, workoutRecording } from './workoutRecording';
import { onDebugTick } from './debugMode';

let _worker: Worker | null = null;

export function initWorkoutOrchestrator(): void {
    if (typeof window === 'undefined') return;

    _worker = new Worker(new URL('../_workers/workoutClock.worker.ts', import.meta.url), { type: 'module' });

    _setWorker(_worker);

    // A new worker starts at zero. A ride in memory continues from its own clocks.
    if (get(workoutRecording).status === RecordingStatus.NotStarted) currentTime.reset();
    else currentTime.restore(get(currentTime), getElapsedSeconds() * 1000);

    _worker.onmessage = (e: MessageEvent<WorkerEvent>) => {
        const msg = e.data;
        if (msg.type === 'tick') {
            setCurrentTimeMs(msg.elapsedMs);
        } else if (msg.type === 'recordingTick') {
            onRecordingTick(msg.elapsedSeconds);
            onDebugTick();
        }
    };
}

export function destroyWorkoutOrchestrator(): void {
    _worker?.terminate();
    _worker = null;
    _setWorker(null);
}
