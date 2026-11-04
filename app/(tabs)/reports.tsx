import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from 'react-native';

import { errorMessage } from '@/api/errors';
import { ReportListItem } from '@/components/reports/report-list-item';
import { Fab } from '@/components/ui/fab';
import { Screen, ScreenHeader } from '@/components/ui/layout';
import { Segmented } from '@/components/ui/segmented';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useReports, useReportStats } from '@/hooks/use-reports';
import { parseReportFilter, REPORT_FILTER_LABEL } from '@/lib/reports';
import { useTheme } from '@/theme';
import type { ReportFilter, ReportStats } from '@/types/domain';

const FILTERS = [
  'ALL',
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'REJECTED',
] as const;

function filterCount(
  stats: ReportStats | undefined,
  filter: ReportFilter,
): number | undefined {
  if (!stats) return undefined;
  switch (filter) {
    case 'ALL':
      return stats.total;
    case 'PENDING':
      return stats.pending;
    case 'IN_PROGRESS':
      return stats.inProgress;
    case 'COMPLETED':
      return stats.completed;
    default:
      return stats.rejected;
  }
}

export default function ReportsScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string }>();
  const [filter, setFilter] = useState<ReportFilter>(
    parseReportFilter(params.status) ?? 'ALL',
  );
  const [seenStatus, setSeenStatus] = useState(params.status);
  const reports = useReports(filter);
  const stats = useReportStats();

  if (params.status !== seenStatus) {
    setSeenStatus(params.status);
    const next = parseReportFilter(params.status);
    if (next) setFilter(next);
  }

  const items = reports.data?.pages.flatMap((page) => page.data) ?? [];
  const options = FILTERS.map((value) => ({
    value,
    label: REPORT_FILTER_LABEL[value],
    count: filterCount(stats.data, value),
  }));
  const total = stats.data?.total;
  const subtitle =
    total === undefined
      ? 'Every report you have submitted.'
      : total === 0
        ? 'No reports yet.'
        : `${total} ${total === 1 ? 'report' : 'reports'} submitted.`;

  return (
    <Screen contentContainerStyle={{ padding: 0 }}>
      <View
        style={{
          paddingTop: spacing.lg,
          gap: spacing.md,
        }}
      >
        <View style={{ paddingHorizontal: spacing.lg }}>
          <ScreenHeader title="My Reports" subtitle={subtitle} />
        </View>
        <Segmented
          options={options}
          value={filter}
          onChange={setFilter}
          scrollable
          inset={spacing.lg}
        />
      </View>

      {reports.isLoading ? (
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Skeleton height={92} />
          <Skeleton height={92} />
          <Skeleton height={92} />
        </View>
      ) : reports.isError ? (
        <View style={{ padding: spacing.lg }}>
          <ErrorState
            message={errorMessage(reports.error)}
            onRetry={() => void reports.refetch()}
          />
        </View>
      ) : items.length === 0 ? (
        <>
          <EmptyState
            variant="plain"
            fill
            title={
              filter === 'ALL'
                ? 'No reports yet'
                : `No ${REPORT_FILTER_LABEL[filter].toLowerCase()} reports`
            }
            description={
              filter === 'ALL'
                ? 'Snap a photo of waste and AI will classify it.'
                : 'Reports appear here when their status changes.'
            }
            actionLabel={filter === 'ALL' ? undefined : 'Show all'}
            onAction={filter === 'ALL' ? undefined : () => setFilter('ALL')}
          />
          <Fab
            label="New report"
            icon={<Plus size={20} color={colors.primaryForeground} />}
            onPress={() => router.push('/reports/create')}
          />
        </>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.md,
              paddingBottom: 56 + spacing.xxxl + spacing.lg,
              gap: spacing.sm,
            }}
            renderItem={({ item }) => (
              <ReportListItem
                report={item}
                onPress={() =>
                  router.push({
                    pathname: '/reports/[id]',
                    params: { id: String(item.id) },
                  })
                }
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={reports.isRefetching && !reports.isFetchingNextPage}
                onRefresh={() => void reports.refetch()}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            onEndReached={() => {
              if (reports.hasNextPage && !reports.isFetchingNextPage) {
                void reports.fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              reports.isFetchingNextPage ? (
                <View style={{ padding: spacing.lg, alignItems: 'center' }}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : undefined
            }
          />
          <Fab
            label="New report"
            icon={<Plus size={20} color={colors.primaryForeground} />}
            onPress={() => router.push('/reports/create')}
          />
        </>
      )}
    </Screen>
  );
}
