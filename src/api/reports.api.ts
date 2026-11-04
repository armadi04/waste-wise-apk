import api from './client';
import type {
  PaginatedReports,
  Report,
  ReportListParams,
  ReportStatus,
  UpdateReportPayload,
} from '@/types/domain';

export async function listReports(
  params: ReportListParams,
): Promise<PaginatedReports> {
  const { data } = await api.get<PaginatedReports>('/reports', {
    params: {
      page: params.page,
      limit: params.limit,
      sort: 'createdAt',
      direction: 'DESC',
      ...(params.status ? { status: params.status } : {}),
      ...(params.search ? { search: params.search } : {}),
      ...(params.category ? { category: params.category } : {}),
      ...(params.from ? { from: params.from } : {}),
      ...(params.to ? { to: params.to } : {}),
    },
  });
  return data;
}

export async function getReport(id: number): Promise<Report> {
  const { data } = await api.get<Report>(`/reports/${id}`);
  return data;
}

export interface CreateReportInput {
  description: string;
  mediaId: number;
  latitude: number;
  longitude: number;
}

export async function createReport(input: CreateReportInput): Promise<Report> {
  const { data } = await api.post<Report>('/reports', input);
  return data;
}

export async function updateReport(
  id: number,
  payload: UpdateReportPayload,
): Promise<Report> {
  const { data } = await api.patch<Report>(`/reports/${id}`, payload);
  return data;
}

export async function deleteReport(id: number): Promise<void> {
  await api.delete(`/reports/${id}`);
}

export async function getReportStats(): Promise<
  import('@/types/domain').ReportStats
> {
  const { data } = await api.get('/stats/reports');
  return data;
}

export type { ReportStatus };
