import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkerCommand, WorkerEvent } from './types';

let send: (command: WorkerCommand) => void;
let events: WorkerEvent[];

beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    events = [];
    vi.stubGlobal('self', {
        addEventListener: (_type: string, listener: (e: { data: WorkerCommand }) => void) => {
            send = (command) => listener({ data: command });
        },
        postMessage: (event: WorkerEvent) => events.push(event),
    });
    await import('./workoutClock.worker');
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

const recordedSeconds = () => events.flatMap((e) => (e.type === 'recordingTick' ? [e.elapsedSeconds] : []));
const lastElapsedMs = () => events.findLast((e) => e.type === 'tick')?.elapsedMs;

describe('workout clock restore', () => {
    it('shows the restored plan position while paused', () => {
        send({ type: 'restore', elapsedMs: 90_000, recordingElapsedMs: 60_000 });

        expect(lastElapsedMs()).toBe(90_000);
        expect(recordedSeconds()).toEqual([]);
    });

    it('continues both clocks after the restored values', () => {
        send({ type: 'restore', elapsedMs: 90_000, recordingElapsedMs: 60_000 });
        send({ type: 'start' });
        vi.advanceTimersByTime(2000);

        // Second 60 is on disk already, so the first new point is second 61.
        expect(recordedSeconds()).toEqual([61, 62]);
        expect(lastElapsedMs()).toBe(92_000);
    });

    it('stops a running clock', () => {
        send({ type: 'start' });
        vi.advanceTimersByTime(3000);
        send({ type: 'restore', elapsedMs: 10_000, recordingElapsedMs: 10_000 });
        events = [];
        vi.advanceTimersByTime(3000);

        expect(events).toEqual([]);
    });
});
