import { describe, expect, it } from 'bun:test';

import { capitalize, greeting, roundCoordinate } from '@/lib/format';
import { parseReportFilter } from '@/lib/reports';

describe('greeting', () => {
  it('maps hours to the right part of day', () => {
    expect(greeting(new Date(2026, 0, 1, 4))).toBe('Good evening');
    expect(greeting(new Date(2026, 0, 1, 5))).toBe('Good morning');
    expect(greeting(new Date(2026, 0, 1, 12))).toBe('Good afternoon');
    expect(greeting(new Date(2026, 0, 1, 18))).toBe('Good evening');
  });
});

describe('capitalize', () => {
  it('uppercases the first letter', () => {
    expect(capitalize('user')).toBe('User');
    expect(capitalize('')).toBe('');
  });
});

describe('parseReportFilter', () => {
  it('accepts known filters and rejects the rest', () => {
    expect(parseReportFilter('PENDING')).toBe('PENDING');
    expect(parseReportFilter('ALL')).toBe('ALL');
    expect(parseReportFilter('bogus')).toBeNull();
    expect(parseReportFilter(undefined)).toBeNull();
  });
});

describe('roundCoordinate', () => {
  it('limits coordinates to 6 decimal places', () => {
    expect(roundCoordinate(-6.2000001234567)).toBe(-6.2);
    expect(roundCoordinate(106.8456789123)).toBe(106.845679);
  });
});
