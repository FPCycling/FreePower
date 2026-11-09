import { describe, expect, it } from 'vitest';
import { extractCoachNote } from './intervalsIcuMapper';

describe('extractCoachNote', () => {
    it('returns the prose before the first step block', () => {
        const description = [
            'Only if Thursday readiness is Go. Otherwise ride AE-1 Z2 60.',
            '',
            'Warmup',
            '- 5m 55%',
            '',
            'Set 1 6x',
            '- 30s 120%',
            '- 15s 50%',
        ].join('\n');

        expect(extractCoachNote(description)).toBe('Only if Thursday readiness is Go. Otherwise ride AE-1 Z2 60.');
    });

    it('keeps NOTE lines and multiple paragraphs', () => {
        const description = 'NOTE: Legs heavy? Cap at 65%.\n\nEasy aerobic.\nKeep it conversational.\n\n- 40m 62-68%';

        expect(extractCoachNote(description)).toBe(
            'NOTE: Legs heavy? Cap at 65%.\n\nEasy aerobic.\nKeep it conversational.',
        );
    });

    it('returns undefined when the description is only steps', () => {
        expect(extractCoachNote('- 10m Z1\n- 40m Z2')).toBeUndefined();
        expect(extractCoachNote(undefined)).toBeUndefined();
        expect(extractCoachNote('')).toBeUndefined();
    });
});
