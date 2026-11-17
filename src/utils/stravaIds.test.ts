import { describe, expect, it } from 'vitest';
import { readStravaId } from './stravaIds';

const BIG_ID = '9007199254740993'; // 2^53 + 1, JSON.parse rounds it

describe('readStravaId', () => {
    it('prefers the _str field', () => {
        const raw = `{"id":${BIG_ID},"id_str":"${BIG_ID}"}`;
        expect(readStravaId(JSON.parse(raw), 'id', raw)).toBe(BIG_ID);
    });

    it('reads a large ID without a _str field from the raw body', () => {
        const raw = `{"id":1,"id_str":"1","activity_id": ${BIG_ID},"status":"ready"}`;
        expect(readStravaId(JSON.parse(raw), 'activity_id', raw)).toBe(BIG_ID);
    });

    it('returns undefined when the ID is null', () => {
        const raw = '{"id":1,"activity_id":null}';
        expect(readStravaId(JSON.parse(raw), 'activity_id', raw)).toBeUndefined();
    });

    it('falls back to the parsed value without a raw body', () => {
        expect(readStravaId({ id: 12345 }, 'id')).toBe('12345');
        expect(readStravaId(undefined, 'id')).toBeUndefined();
    });
});
