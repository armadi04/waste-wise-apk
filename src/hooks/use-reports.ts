import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  createReport,
  getReport,
  getReportStats,
  listReports,
  type CreateReportInput,
} from '@/api/reports.api';
import type { ReportFilter } from '@/types/domain';

export function useReportStats() {
  return useQuery({
    queryKey: queryKeys.stats.reports,
    queryFn: getReportStats,
    staleTime: 15_000,
  });
}

export function useReports(filter: ReportFilter, search = '') {
  const status = filter === 'ALL' ? undefined : filter;
  const term = search.trim();
  return useInfiniteQuery({
    queryKey: queryKeys.reports.list(status, term),
    queryFn: ({ pageParam }) =>
      listReports({
        page: pageParam,
        limit: 20,
        status,
        search: term || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.lastPage
        ? lastPage.meta.page + 1
        : undefined,
    staleTime: 15_000,
  });
}

export function useReportDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.reports.detail(id),
    queryFn: () => getReport(id),
    enabled: Number.isInteger(id) && id > 0,
    staleTime: 15_000,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReportInput) => createReport(input),
    onSuccess: async (report) => {
      queryClient.setQueryData(queryKeys.reports.detail(report.id), report);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.stats.reports }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }),
      ]);
    },
  });
}
