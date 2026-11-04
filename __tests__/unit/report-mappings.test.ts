import { describe, expect, it } from 'bun:test';

import { mediaViewUrl } from '@/lib/media-url';
import { lightColors } from '@/theme/tokens';
import {
  REPORT_STATUS_LABEL,
  REPORT_STATUS_TONE,
  WASTE_CATEGORY_LABEL,
  categoryColor,
} from '@/lib/reports';
import type { Media, ReportStatus, WasteCategory } from '@/types/domain';

describe('report display mappings', () => {
  it('has labels and tones for every report status', () => {
    const statuses: ReportStatus[] = [
      'PENDING',
      'IN_PROGRESS',
      'COMPLETED',
      'REJECTED',
    ];
    for (const status of statuses) {
      expect(REPORT_STATUS_LABEL[status]).toBeTruthy();
      expect(REPORT_STATUS_TONE[status]).toBeTruthy();
    }
    expect(REPORT_STATUS_TONE.PENDING).toBe('warning');
    expect(REPORT_STATUS_TONE.COMPLETED).toBe('success');
    expect(REPORT_STATUS_TONE.IN_PROGRESS).toBe('progress');
  });

  it('has labels and tones for every waste category', () => {
    const categories: WasteCategory[] = [
      'ORGANIC_WASTE',
      'PLASTIC_WASTE',
      'PAPER_WASTE',
    ];
    for (const category of categories) {
      expect(WASTE_CATEGORY_LABEL[category]).toBeTruthy();
      expect(categoryColor(lightColors, category)).toBeTruthy();
      expect(categoryColor(lightColors, category)).not.toBe(
        categoryColor(lightColors, null),
      );
    }
  });

  it('builds media URLs from the API origin instead of backend APP_URL', () => {
    const media = {
      id: 42,
      url: 'http://localhost:3001/api/v1/media/42/view',
    } as Media;
    expect(mediaViewUrl(media)).toMatch(/\/api\/v1\/media\/42\/view$/);
    expect(mediaViewUrl(null)).toBeNull();
  });
});

describe('parseWasteCategory', () => {
  it('accepts known categories only', async () => {
    const { parseWasteCategory } = await import('@/lib/reports');
    expect(parseWasteCategory('PAPER_WASTE')).toBe('PAPER_WASTE');
    expect(parseWasteCategory('GLASS')).toBeNull();
    expect(parseWasteCategory(undefined)).toBeNull();
  });
});

describe('dateRangeFor', () => {
  it('maps presets to inclusive local days', async () => {
    const { dateRangeFor } = await import('@/lib/reports');
    const now = new Date(2026, 10, 5, 0, 30);
    expect(dateRangeFor('any', now)).toEqual({});
    expect(dateRangeFor('today', now)).toEqual({
      from: '2026-11-05',
      to: '2026-11-05',
    });
    expect(dateRangeFor('7d', now)).toEqual({
      from: '2026-10-30',
      to: '2026-11-05',
    });
    expect(dateRangeFor('30d', now).from).toBe('2026-10-07');
    expect(dateRangeFor('year', now).from).toBe('2026-01-01');
  });
});
