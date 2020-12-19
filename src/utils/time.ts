import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);
export function toTimeFormat(milliseconds: number) {
    const durationMs = dayjs.duration(milliseconds);

    if (durationMs.hours() > 0) return durationMs.format('H:mm:ss');
    return durationMs.format('mm:ss');
}
