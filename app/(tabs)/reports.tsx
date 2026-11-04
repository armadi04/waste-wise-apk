import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';

import { errorMessage } from '@/api/errors';
import { ReportListItem } from '@/components/reports/report-list-item';
import { Button } from '@/components/ui/button';
import { Screen, ScreenHeader } from '@/components/ui/layout';
import { Segmented } from '@/components/ui/segmented';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { useReports } from '@/hooks/use-reports';
import { REPORT_FILTER_LABEL } from '@/lib/reports';
import { useTheme } from '@/theme';
import type { ReportFilter } from '@/types/domain';

const FILTER_OPTIONS = (
  ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'] as const
).map((value) => ({ value, label: REPORT_FILTER_LABEL[value] }));

export default function ReportsScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<ReportFilter>('ALL');
  const reports = useReports(filter);

  const items = reports.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <Screen contentContainerStyle={{ padding: 0 }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md }}>
        <ScreenHeader
          title="My Reports"
          subtitle="Every report you have submitted."
          right={
            <Button
              label="New"
              icon={<Plus size={17} color={colors.primaryForeground} />}
              onPress={() => router.push('/reports/create')}
            />
          }
        />
        <Segmented
          options={FILTER_OPTIONS}
          value={filter}
          onChange={setFilter}
          scrollable
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
        <View style={{ padding: spacing.lg }}>
          <EmptyState
            title="No reports found"
            description="Try another status filter or create a new report."
            actionLabel="Create report"
            onAction={() => router.push('/reports/create')}
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.huge,
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
      )}
    </Screen>
  );
}
