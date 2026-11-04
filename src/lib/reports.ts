import type { ReportStatus, WasteCategory } from '@/types/domain';

export type Tone = 'default' | 'info' | 'success' | 'warning' | 'danger';

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
};

export const REPORT_STATUS_TONE: Record<ReportStatus, Tone> = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
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
