/// <reference lib="webworker" />

import type { WorkerCommand, WorkerEvent } from './types';

let baseElapsed = 0;
let runStartWallTime: number | null = null;
let interval: ReturnType<typeof setInterval> | null = null;
let lastRecordingSecond = -1;

function getElapsed(): number {
    if (runStartWallTime !== null) {
        return baseElapsed + (Date.now() - runStartWallTime);
    }
    return baseElapsed;
}

function tick(): void {
    const elapsedMs = getElapsed();
    self.postMessage({ type: 'tick', elapsedMs } as WorkerEvent);

    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    if (elapsedSeconds > lastRecordingSecond) {
        lastRecordingSecond = elapsedSeconds;
        self.postMessage({ type: 'recordingTick', elapsedSeconds } as WorkerEvent);
    }
}

self.addEventListener('message', (e: MessageEvent<WorkerCommand>) => {
    const cmd = e.data;

    switch (cmd.type) {
        case 'start':
            if (runStartWallTime === null) {
                runStartWallTime = Date.now();
                interval = setInterval(tick, 100);
            }
            break;

        case 'pause':
            if (runStartWallTime !== null) {
                baseElapsed = getElapsed();
                runStartWallTime = null;
            }
            if (interval !== null) {
                clearInterval(interval);
                interval = null;
            }
            break;

        case 'reset':
            if (interval !== null) {
                clearInterval(interval);
                interval = null;
            }
            baseElapsed = 0;
            runStartWallTime = null;
            lastRecordingSecond = -1;
            self.postMessage({ type: 'tick', elapsedMs: 0 } as WorkerEvent);
            break;

        case 'add':
            baseElapsed += cmd.ms;
            tick();
            break;
    }
});
