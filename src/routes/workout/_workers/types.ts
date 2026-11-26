export type WorkerCommand =
    | { type: 'start' }
    | { type: 'pause' }
    | { type: 'reset' }
    | { type: 'add'; ms: number }
    | { type: 'restore'; elapsedMs: number; recordingElapsedMs: number };

export type WorkerEvent = { type: 'tick'; elapsedMs: number } | { type: 'recordingTick'; elapsedSeconds: number };
