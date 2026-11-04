import type { ReportListFilters, ReportStatus } from '@/types/domain';

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
    profile: ['auth', 'profile'] as const,
  },
  stats: {
    reports: ['stats', 'reports'] as const,
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
