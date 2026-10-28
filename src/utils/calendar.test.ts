import { describe, expect, it } from 'vitest';
import { buildCalendarWeeks, groupByDateKey, toDateKey } from './calendar';

describe('toDateKey', () => {
    it('uses the local date, not UTC', () => {
        // 23:30 local is already the next day in UTC for timezones west of UTC
        expect(toDateKey(new Date(2026, 9, 28, 23, 30))).toBe('2026-10-28');
    });
});

describe('buildCalendarWeeks', () => {
    // Wednesday
    const today = new Date(2026, 9, 28, 15, 0);
    const weeks = buildCalendarWeeks(today, 4);
    const days = weeks.flat();

    it('starts on the Monday of the current week', () => {
        expect(weeks).toHaveLength(4);
        expect(weeks.every((week) => week.length === 7)).toBe(true);
        expect(days[0]!.key).toBe('2026-10-26');
        expect(days.at(-1)!.key).toBe('2026-11-22');
    });

    it('marks today, past days and weekends', () => {
        expect(days.filter((d) => d.isToday).map((d) => d.key)).toEqual(['2026-10-28']);
        expect(days.filter((d) => d.isPast).map((d) => d.key)).toEqual(['2026-10-26', '2026-10-27']);
        expect(weeks[0]!.filter((d) => d.isWeekend).map((d) => d.key)).toEqual(['2026-10-31', '2026-11-01']);
    });

    it('has consecutive days across month ends and DST changes', () => {
        const keys = days.map((d) => d.key);
        // DST ends Nov 1, 2026 in North America
        expect(keys.slice(5, 8)).toEqual(['2026-10-31', '2026-11-01', '2026-11-02']);
        expect(new Set(keys).size).toBe(28);
    });

    it('starts on today when today is a Monday', () => {
        expect(buildCalendarWeeks(new Date(2026, 10, 2), 1)[0]![0]!.key).toBe('2026-11-02');
    });

    it('starts on the previous Monday when today is a Sunday', () => {
        expect(buildCalendarWeeks(new Date(2026, 10, 1), 1)[0]![0]!.key).toBe('2026-10-26');
    });
});

describe('groupByDateKey', () => {
    it('groups by local date and sorts by start time', () => {
        const groups = groupByDateKey([
            { id: 2, start_date_local: '2026-10-29T17:00:00' },
            { id: 1, start_date_local: '2026-10-29T06:30:00' },
            { id: 3, start_date_local: '2026-10-31T09:00:00' },
        ]);

        expect(groups.get('2026-10-29')!.map((w) => w.id)).toEqual([1, 2]);
        expect(groups.get('2026-10-31')!.map((w) => w.id)).toEqual([3]);
        expect(groups.get('2026-10-30')).toBeUndefined();
    });
});
