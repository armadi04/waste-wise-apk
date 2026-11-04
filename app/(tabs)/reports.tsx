import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCheck, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  View,
} from 'react-native';

import { errorMessage } from '@/api/errors';
import { ReportListItem } from '@/components/reports/report-list-item';
import { Fab } from '@/components/ui/fab';
import { Screen, ScreenHeader } from '@/components/ui/layout';
import { SearchField } from '@/components/ui/search-field';
import { Segmented } from '@/components/ui/segmented';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { AppText } from '@/components/ui/text';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useReports, useReportStats } from '@/hooks/use-reports';
import {
  groupByDay,
  parseReportFilter,
  REPORT_FILTER_LABEL,
} from '@/lib/reports';
import { useTheme } from '@/theme';
import type { ReportFilter, ReportStats } from '@/types/domain';

const FILTERS = [
  'ALL',
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'REJECTED',
] as const;

const FAB_CLEARANCE = 56 + 48;

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
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query.trim(), 300);
  const reports = useReports(filter, search);
  const stats = useReportStats();

  if (params.status !== seenStatus) {
    setSeenStatus(params.status);
    const next = parseReportFilter(params.status);
    if (next) setFilter(next);
  }

  const items = useMemo(
    () => reports.data?.pages.flatMap((page) => page.data) ?? [],
    [reports.data],
  );
  const sections = useMemo(() => groupByDay(items), [items]);
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

  const openCreate = () => router.push('/reports/create');
  const fab = (
    <Fab
      label="New report"
      icon={<Plus size={20} color={colors.primaryForeground} />}
      onPress={openCreate}
    />
  );

  const emptyState = search ? (
    <EmptyState
      variant="plain"
      fill
      showAnimation={false}
      title={`No reports match "${search}"`}
      description="Try a different word or clear the search."
      actionLabel="Clear search"
      onAction={() => setQuery('')}
    />
  ) : (
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
  );

  return (
    <Screen contentContainerStyle={{ padding: 0, gap: 0 }}>
      <View style={{ paddingTop: spacing.lg, gap: spacing.md }}>
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
          <ScreenHeader title="My Reports" subtitle={subtitle} />
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Search descriptions"
            accessibilityLabel="Search reports"
          />
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
          <Skeleton height={100} />
          <Skeleton height={100} />
          <Skeleton height={100} />
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
          {emptyState}
          {fab}
        </>
      ) : (
        <>
          <SectionList
            sections={sections}
            keyExtractor={(item) => String(item.id)}
            stickySectionHeadersEnabled={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              paddingBottom: FAB_CLEARANCE + spacing.lg,
            }}
            renderSectionHeader={({ section }) => (
              <AppText
                variant="caption"
                weight="semibold"
                color={colors.mutedForeground}
                accessibilityRole="header"
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  marginTop: spacing.lg,
                  marginBottom: spacing.sm,
                }}
              >
                {section.title}
              </AppText>
            )}
            ItemSeparatorComponent={() => (
              <View style={{ height: spacing.sm }} />
            )}
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
              ) : !reports.hasNextPage ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: spacing.xs,
                    paddingVertical: spacing.xl,
                  }}
                >
                  <CheckCheck size={16} color={colors.mutedForeground} />
                  <AppText variant="caption" color={colors.mutedForeground}>
                    You&apos;re all caught up
                  </AppText>
                </View>
              ) : undefined
            }
          />
          {fab}
        </>
      )}
    </Screen>
  );
}
