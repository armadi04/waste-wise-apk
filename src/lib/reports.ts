import { format } from 'date-fns';

import { formatDayTitle } from '@/lib/format';
import type { ThemeColors } from '@/theme/tokens';
import type { ReportFilter, ReportStatus, WasteCategory } from '@/types/domain';

export type Tone =
  'default' | 'info' | 'progress' | 'success' | 'warning' | 'danger';

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
};

export const REPORT_STATUS_TONE: Record<ReportStatus, Tone> = {
  PENDING: 'warning',
  IN_PROGRESS: 'progress',
  COMPLETED: 'success',
  REJECTED: 'danger',
};

export const WASTE_CATEGORY_LABEL: Record<WasteCategory, string> = {
  ORGANIC_WASTE: 'Organic Waste',
  PLASTIC_WASTE: 'Plastic Waste',
  PAPER_WASTE: 'Paper Waste',
};

export const WASTE_CATEGORY_TONE: Record<WasteCategory, Tone> = {
  ORGANIC_WASTE: 'success',
  PLASTIC_WASTE: 'info',
  PAPER_WASTE: 'warning',
};

export const REPORT_FILTER_LABEL = {
  ALL: 'All',
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
} as const;

export const CLASSIFICATION_ERROR_LABEL: Record<string, string> = {
  ML_UNAVAILABLE: 'The AI service is unavailable. No category was saved.',
  ML_REJECTED_IMAGE: 'The AI service rejected this photo.',
  ML_INVALID_RESPONSE: 'The AI service returned an invalid result.',
  MEDIA_UNAVAILABLE: 'The report photo could not be read by the AI service.',
};

export const REPORT_STATUSES: readonly ReportStatus[] = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'REJECTED',
];

export const REPORT_FILTERS: readonly ReportFilter[] = [
  'ALL',
  ...REPORT_STATUSES,
];

export function parseReportFilter(value: unknown): ReportFilter | null {
  return typeof value === 'string' &&
    (REPORT_FILTERS as readonly string[]).includes(value)
    ? (value as ReportFilter)
    : null;
}

export interface ToneColors {
  bg: string;
  fg: string;
  border: string;
  solid: string;
}

export function toneColors(colors: ThemeColors, tone: Tone): ToneColors {
  switch (tone) {
    case 'info':
      return {
        bg: colors.infoBackground,
        fg: colors.infoForeground,
        border: colors.infoBorder,
        solid: colors.info,
      };
    case 'progress':
      return {
        bg: colors.progressBackground,
        fg: colors.progressForeground,
        border: colors.progressBorder,
        solid: colors.progress,
      };
    case 'success':
      return {
        bg: colors.successBackground,
        fg: colors.successForeground,
        border: colors.successBorder,
        solid: colors.success,
      };
    case 'warning':
      return {
        bg: colors.warningBackground,
        fg: colors.warningForeground,
        border: colors.warningBorder,
        solid: colors.warning,
      };
    case 'danger':
      return {
        bg: colors.dangerBackground,
        fg: colors.dangerForeground,
        border: colors.dangerBorder,
        solid: colors.danger,
      };
    default:
      return {
        bg: colors.muted,
        fg: colors.mutedForeground,
        border: colors.borderSubtle,
        solid: colors.mutedForeground,
      };
  }
}

export interface DaySection<T> {
  key: string;
  title: string;
  data: T[];
}

/**
 * Groups items into local calendar days, keeping the incoming (server) order.
 * Items with an unparseable date fall into an "Unknown date" section.
 */
export function groupByDay<T extends { createdAt: string }>(
  items: readonly T[],
  now: Date = new Date(),
): DaySection<T>[] {
  const sections: DaySection<T>[] = [];
  const byKey = new Map<string, DaySection<T>>();
  for (const item of items) {
    const date = new Date(item.createdAt);
    const valid = !Number.isNaN(date.getTime());
    const key = valid ? format(date, 'yyyy-MM-dd') : 'unknown';
    let section = byKey.get(key);
    if (!section) {
      section = {
        key,
        title: valid ? formatDayTitle(date, now) : 'Unknown date',
        data: [],
      };
      byKey.set(key, section);
      sections.push(section);
    }
    section.data.push(item);
  }
  return sections;
}
