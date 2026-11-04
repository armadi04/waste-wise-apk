import api from './client';
import type {
  PaginatedReports,
  Report,
  ReportListParams,
  ReportStatus,
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

export async function getReportStats(): Promise<import('@/types/domain').ReportStats> {
  const { data } = await api.get('/stats/reports');
  return data;
}

export type { ReportStatus };
