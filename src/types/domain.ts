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

export type AuthSession = components['schemas']['MobileAuthSessionDto'];

export type MobileGoogleLoginResponse =
  | components['schemas']['MobileAuthSessionDto']
  | components['schemas']['MobileTwoFactorChallengeDto'];

export type MobileTwoFactorVerifyResponse =
  components['schemas']['MobileAuthSessionDto'];

export type TwoFactorVerifyPayload =
  components['schemas']['TwoFactorVerifyDto'];

export interface ReportListParams {
  page: number;
  limit: number;
  status?: ReportStatus;
  search?: string;
}

export type ReportFilter = 'ALL' | ReportStatus;
