import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  createReport,
  deleteReport,
  getReport,
  getReportStats,
  listReports,
  updateReport,
  type CreateReportInput,
} from '@/api/reports.api';
import type {
  ReportFilter,
  ReportListFilters,
  UpdateReportPayload,
} from '@/types/domain';

export function useReportStats() {
  return useQuery({
    queryKey: queryKeys.stats.reports,
    queryFn: getReportStats,
    staleTime: 15_000,
  });
}

export function useReports(
  filter: ReportFilter,
  search = '',
  filters: ReportListFilters = {},
) {
  const status = filter === 'ALL' ? undefined : filter;
  const term = search.trim();
  return useInfiniteQuery({
    queryKey: queryKeys.reports.list(status, term, filters),
    queryFn: ({ pageParam }) =>
      listReports({
        page: pageParam,
        limit: 20,
        status,
        search: term || undefined,
        ...filters,
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

export function useUpdateReport(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateReportPayload) => updateReport(id, payload),
    onSuccess: async (report) => {
      queryClient.setQueryData(queryKeys.reports.detail(report.id), report);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.stats.reports }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }),
      ]);
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteReport(id),
    onSuccess: async (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.reports.detail(id) });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.stats.reports }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }),
      ]);
    },
  });
}
