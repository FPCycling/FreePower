export interface CalendarDay {
    key: string; // local YYYY-MM-DD
    date: Date;
    isToday: boolean;
    isPast: boolean;
    isWeekend: boolean;
}

/** Local YYYY-MM-DD (toISOString would use UTC and can be off by a day) */
export function toDateKey(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
    // Calendar arithmetic on local dates, so DST changes don't shift the day
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function startOfWeek(date: Date): Date {
    const daysSinceMonday = (date.getDay() + 6) % 7;
    return addDays(date, -daysSinceMonday);
}

/** Weeks (Monday to Sunday) starting with the week that contains `today` */
export function buildCalendarWeeks(today: Date, weekCount: number): CalendarDay[][] {
    const todayKey = toDateKey(today);
    const start = startOfWeek(today);

    return Array.from({ length: weekCount }, (_, week) =>
        Array.from({ length: 7 }, (_, weekday) => {
            const date = addDays(start, week * 7 + weekday);
            const key = toDateKey(date);
            return {
                key,
                date,
                isToday: key === todayKey,
                isPast: key < todayKey,
                isWeekend: weekday >= 5,
            };
        }),
    );
}

/** Group items by the date part of a local ISO datetime like "2026-10-29T06:30:00" */
export function groupByDateKey<T extends { start_date_local: string }>(items: T[]): Map<string, T[]> {
    const groups = new Map<string, T[]>();
    const sorted = [...items].sort((a, b) => a.start_date_local.localeCompare(b.start_date_local));

    for (const item of sorted) {
        const key = item.start_date_local.slice(0, 10);
        groups.set(key, [...(groups.get(key) ?? []), item]);
    }

    return groups;
}
