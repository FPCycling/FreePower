export type WorkerCommand = { type: 'start' } | { type: 'pause' } | { type: 'reset' } | { type: 'add'; ms: number };

export type WorkerEvent = { type: 'tick'; elapsedMs: number } | { type: 'recordingTick'; elapsedSeconds: number };
