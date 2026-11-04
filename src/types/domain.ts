import type { components } from './api.generated';

export type User = components['schemas']['User'];
export type Media = components['schemas']['Media'];
export type Report = components['schemas']['Report'];
export type ReportStats = components['schemas']['ReportStatsDto'];
export type ReportStatus = Report['status'];
export type WasteCategory = NonNullable<Report['predictedCategory']>;
export type ClassificationStatus = Report['classificationStatus'];

export interface PaginationMeta {
  total: number;
  page: number;
  lastPage: number;
}

export interface PaginatedReports {
  data: Report[];
  meta: PaginationMeta;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  sessionExpiresAt: string;
}

export type MobileGoogleLoginResponse =
  | AuthSession
  | { twoFactorRequired: true; challengeToken: string };

export interface ReportListParams {
  page: number;
  limit: number;
  status?: ReportStatus;
}

export type ReportFilter = 'ALL' | ReportStatus;
