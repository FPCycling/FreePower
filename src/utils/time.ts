import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';

dayjs.extend(duration);
export function formatMs(milliseconds: number) {
    const durationMs = dayjs.duration(milliseconds);

    if (durationMs.hours() > 0) return durationMs.format('H:mm:ss');
    return durationMs.format('mm:ss');
}

export function formatTime(seconds: number) {
    const durationSec = dayjs.duration(seconds, 'seconds');

    if (durationSec.hours() > 0) return durationSec.format('H:mm:ss');
    return durationSec.format('mm:ss');
}
