import { describe, expect, it } from 'bun:test';

import { mediaViewUrl } from '@/lib/media-url';
import {
  REPORT_STATUS_LABEL,
  REPORT_STATUS_TONE,
  WASTE_CATEGORY_LABEL,
  WASTE_CATEGORY_TONE,
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
  });

  it('has labels and tones for every waste category', () => {
    const categories: WasteCategory[] = [
      'ORGANIC_WASTE',
      'PLASTIC_WASTE',
      'PAPER_WASTE',
    ];
    for (const category of categories) {
      expect(WASTE_CATEGORY_LABEL[category]).toBeTruthy();
      expect(WASTE_CATEGORY_TONE[category]).toBeTruthy();
    }
  });

  it('builds media URLs from the API origin instead of backend APP_URL', () => {
    const media = { id: 42, url: 'http://localhost:3001/api/v1/media/42/view' } as Media;
    expect(mediaViewUrl(media)).toMatch(/\/api\/v1\/media\/42\/view$/);
    expect(mediaViewUrl(null)).toBeNull();
  });
});
