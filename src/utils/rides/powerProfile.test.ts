import { describe, expect, it } from 'vitest';
import { POWER_PROFILE_BARS, powerProfile, profileSteps } from './powerProfile';

function points(...powers: number[]) {
    return powers.map((power) => ({ power }));
}

describe('powerProfile', () => {
    it('is empty for a ride with no points', () => {
        expect(powerProfile([])).toEqual([]);
    });

    it('keeps one bar for each point of a short ride', () => {
        expect(powerProfile(points(100, 150, 200))).toEqual([100, 150, 200]);
    });

    it('averages the points of each slice', () => {
        expect(powerProfile(points(100, 200, 300, 301), 2)).toEqual([150, 301]);
    });

    it('uses all the points when the slices are not equal', () => {
        expect(powerProfile(points(100, 100, 200, 300, 300), 2)).toEqual([100, 267]);
    });

    it('limits a long ride to the maximum number of bars', () => {
        const profile = powerProfile(Array.from({ length: 3601 }, () => ({ power: 180 })));

        expect(profile).toHaveLength(POWER_PROFILE_BARS);
        expect(new Set(profile)).toEqual(new Set([180]));
    });
});

describe('profileSteps', () => {
    it('converts watts to a percentage of the FTP', () => {
        expect(profileSteps([100, 250], 200)).toEqual([
            { percentFtp: 50, duration: 1 },
            { percentFtp: 125, duration: 1 },
        ]);
    });

    it('is empty for a ride with no profile', () => {
        expect(profileSteps(undefined, 200)).toEqual([]);
    });
});
