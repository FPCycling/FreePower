import type { WorkerEvent } from '../_workers/types';
import { _setWorker, setCurrentTimeMs } from './currentWorkout';
import { onRecordingTick } from './workoutRecording';
import { onDebugTick } from './debugMode';

let _worker: Worker | null = null;

export function initWorkoutOrchestrator(): void {
    if (typeof window === 'undefined') return;

    _worker = new Worker(new URL('../_workers/workoutClock.worker.ts', import.meta.url), { type: 'module' });

    _setWorker(_worker);

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
