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
  category?: WasteCategory;
  /** Inclusive start date, YYYY-MM-DD. */
  from?: string;
  /** Inclusive end date, YYYY-MM-DD. */
  to?: string;
}

/** Optional list filters beyond status and search. */
export type ReportListFilters = Pick<
  ReportListParams,
  'category' | 'from' | 'to'
>;

export type UpdateReportPayload = components['schemas']['UpdateReportDto'];

export type ReportFilter = 'ALL' | ReportStatus;

export type AppNotification = components['schemas']['Notification'];
export type NotificationType = AppNotification['type'];

export type PaginatedNotifications =
  components['schemas']['PaginatedNotificationResponse'];

export type TimeZoneConfig = components['schemas']['TimeZoneConfigResponseDto'];
export type TimeZonePreference =
  components['schemas']['TimeZonePreferenceResponseDto'];

export type TwoFactorStatus = components['schemas']['TwoFactorStatusDto'];
export type TwoFactorSetup = components['schemas']['TwoFactorEnrollmentDto'];
export type RecoveryCodes = components['schemas']['RecoveryCodesDto'];

export type OwnSession = components['schemas']['OwnSessionResponse'];
