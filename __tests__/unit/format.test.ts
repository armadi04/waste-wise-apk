import { describe, expect, it } from 'bun:test';

import {
  capitalize,
  formatConfidence,
  formatRelativeTime,
  greeting,
  roundCoordinate,
} from '@/lib/format';
import { groupByDay, parseReportFilter } from '@/lib/reports';

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

describe('formatRelativeTime', () => {
  const now = new Date(2026, 10, 5, 15, 0, 0);
  const at = (...parts: [number, number, number, number, number, number?]) =>
    new Date(...parts);

  it('uses short relative labels for recent times', () => {
    expect(formatRelativeTime(at(2026, 10, 5, 14, 59, 30), now)).toBe(
      'Just now',
    );
    expect(formatRelativeTime(at(2026, 10, 5, 14, 1), now)).toBe('59m ago');
    expect(formatRelativeTime(at(2026, 10, 5, 9, 0), now)).toBe('6h ago');
    expect(formatRelativeTime(at(2026, 10, 4, 23, 33), now)).toBe('Yesterday');
  });

  it('falls back to dates for older items', () => {
    expect(formatRelativeTime(at(2026, 9, 1, 8, 0), now)).toBe('01 Oct');
    expect(formatRelativeTime(at(2025, 11, 31, 8, 0), now)).toBe('31 Dec 2025');
    expect(formatRelativeTime(null, now)).toBe('—');
    expect(formatRelativeTime('nope', now)).toBe('—');
  });
});

describe('groupByDay', () => {
  const now = new Date(2026, 10, 5, 15, 0, 0);

  it('groups by local day in server order', () => {
    const items = [
      { id: 3, createdAt: new Date(2026, 10, 5, 10).toISOString() },
      { id: 2, createdAt: new Date(2026, 10, 4, 23, 33).toISOString() },
      { id: 1, createdAt: new Date(2026, 9, 30, 8).toISOString() },
    ];
    const sections = groupByDay(items, now);
    expect(sections.map((s) => s.title)).toEqual([
      'Today',
      'Yesterday',
      '30 Oct 2026',
    ]);
    expect(sections.map((s) => s.data.map((i) => i.id))).toEqual([
      [3],
      [2],
      [1],
    ]);
  });

  it('returns no sections for no items', () => {
    expect(groupByDay([], now)).toEqual([]);
  });
});

describe('formatConfidence', () => {
  it('never overstates the stored confidence', () => {
    expect(formatConfidence(0.9999)).toBe('99.9%');
    expect(formatConfidence(0.9997380375862122)).toBe('99.9%');
    expect(formatConfidence(0.5385528802871704)).toBe('53.8%');
  });

  it('keeps exact values and float-edge values intact', () => {
    expect(formatConfidence(1)).toBe('100.0%');
    expect(formatConfidence(0)).toBe('0.0%');
    expect(formatConfidence(0.57)).toBe('57.0%');
    expect(formatConfidence(0.7574)).toBe('75.7%');
  });

  it('shows a dash when there is no confidence', () => {
    expect(formatConfidence(null)).toBe('—');
    expect(formatConfidence(undefined)).toBe('—');
    expect(formatConfidence(Number.NaN)).toBe('—');
  });
});
