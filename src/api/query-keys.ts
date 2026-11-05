import type { ReportListFilters, ReportStatus } from '@/types/domain';

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
    profile: ['auth', 'profile'] as const,
    twoFactor: ['auth', 'two-factor'] as const,
  },
  stats: {
    reports: ['stats', 'reports'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: ['notifications', 'list'] as const,
    unread: ['notifications', 'unread'] as const,
  },
  sessions: { mine: ['sessions', 'mine'] as const },
  timeZone: {
    config: ['time-zone', 'config'] as const,
    preference: ['time-zone', 'preference'] as const,
  },
  reports: {
    all: ['reports'] as const,
    list: (
      status?: ReportStatus,
      search?: string,
      filters: ReportListFilters = {},
    ) =>
      [
        'reports',
        'list',
        status ?? 'ALL',
        search ?? '',
        filters.category ?? '',
        filters.from ?? '',
        filters.to ?? '',
      ] as const,
    detail: (id: number) => ['reports', 'detail', id] as const,
  },
} as const;
