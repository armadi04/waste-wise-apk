import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCheck, SlidersHorizontal, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  View,
} from 'react-native';

import { errorMessage } from '@/api/errors';
import { useTabBarInset } from '@/components/navigation/tab-bar-inset';
import { ReportListItem } from '@/components/reports/report-list-item';
import {
  countExtraFilters,
  EMPTY_EXTRA_FILTERS,
  ReportFiltersSheet,
  type ReportExtraFilters,
} from '@/components/reports/report-filters-sheet';
import { Screen, ScreenHeader } from '@/components/ui/layout';
import { SearchField } from '@/components/ui/search-field';
import { Segmented } from '@/components/ui/segmented';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { AppText } from '@/components/ui/text';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useReports, useReportStats } from '@/hooks/use-reports';
import {
  DATE_PRESET_LABEL,
  dateRangeFor,
  groupByDay,
  parseReportFilter,
  parseWasteCategory,
  REPORT_FILTER_LABEL,
  WASTE_CATEGORY_LABEL,
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

function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  const { colors, radius, spacing } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Remove filter ${label}`}
      onPress={onRemove}
      hitSlop={{ top: 8, bottom: 8 }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        minHeight: 32,
        paddingLeft: spacing.md,
        paddingRight: spacing.sm,
        borderRadius: radius.pill,
        backgroundColor: pressed
          ? colors.selectedHover
          : colors.selectedBackground,
      })}
    >
      <AppText
        variant="caption"
        weight="semibold"
        color={colors.selectedForeground}
      >
        {label}
      </AppText>
      <X size={14} color={colors.selectedForeground} />
    </Pressable>
  );
}

export default function ReportsScreen() {
  const { colors, radius, spacing } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string; category?: string }>();
  const [filter, setFilter] = useState<ReportFilter>(
    parseReportFilter(params.status) ?? 'ALL',
  );
  const [seenStatus, setSeenStatus] = useState(params.status);
  const [extra, setExtra] = useState<ReportExtraFilters>(() => ({
    ...EMPTY_EXTRA_FILTERS,
    category: parseWasteCategory(params.category),
  }));
  const [seenCategory, setSeenCategory] = useState(params.category);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query.trim(), 300);
  const listFilters = useMemo(
    () => ({
      ...(extra.category ? { category: extra.category } : {}),
      ...dateRangeFor(extra.date),
    }),
    [extra],
  );
  const reports = useReports(filter, search, listFilters);
  const extraCount = countExtraFilters(extra);
  const stats = useReportStats();
  const tabBarInset = useTabBarInset();

  if (params.status !== seenStatus) {
    setSeenStatus(params.status);
    const next = parseReportFilter(params.status);
    if (next) setFilter(next);
  }
  if (params.category !== seenCategory) {
    setSeenCategory(params.category);
    const next = parseWasteCategory(params.category);
    if (next) setExtra((current) => ({ ...current, category: next }));
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

  const emptyState =
    extraCount > 0 && !search ? (
      <EmptyState
        variant="plain"
        fill
        showAnimation={false}
        title="No reports match these filters"
        description="Try a wider date range or another category."
        actionLabel="Clear filters"
        onAction={() => setExtra(EMPTY_EXTRA_FILTERS)}
      />
    ) : search ? (
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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
            }}
          >
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder="Search descriptions"
              accessibilityLabel="Search reports"
              style={{ flex: 1 }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                extraCount ? `Filters, ${extraCount} active` : 'Filters'
              }
              onPress={() => setFiltersOpen(true)}
              style={({ pressed }) => ({
                width: 48,
                height: 48,
                borderRadius: radius.md,
                borderWidth: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: extraCount
                  ? colors.selectedBorder
                  : colors.borderSubtle,
                backgroundColor: extraCount
                  ? colors.selectedBackground
                  : pressed
                    ? colors.surfaceHover
                    : colors.inputBackground,
              })}
            >
              <SlidersHorizontal
                size={20}
                color={
                  extraCount ? colors.selectedForeground : colors.foreground
                }
              />
              {extraCount ? (
                <View
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    minWidth: 20,
                    height: 20,
                    paddingHorizontal: 5,
                    borderRadius: radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.primary,
                  }}
                >
                  <AppText
                    variant="caption"
                    weight="semibold"
                    color={colors.primaryForeground}
                  >
                    {extraCount}
                  </AppText>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>
        <Segmented
          options={options}
          value={filter}
          onChange={setFilter}
          scrollable
          inset={spacing.lg}
        />
        {extraCount ? (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing.sm,
              paddingHorizontal: spacing.lg,
            }}
          >
            {extra.category ? (
              <ActiveFilterChip
                label={WASTE_CATEGORY_LABEL[extra.category]}
                onRemove={() =>
                  setExtra((current) => ({ ...current, category: null }))
                }
              />
            ) : null}
            {extra.date !== 'any' ? (
              <ActiveFilterChip
                label={DATE_PRESET_LABEL[extra.date]}
                onRemove={() =>
                  setExtra((current) => ({ ...current, date: 'any' }))
                }
              />
            ) : null}
          </View>
        ) : null}
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
        <View style={{ flex: 1, paddingBottom: tabBarInset }}>
          {emptyState}
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          stickySectionHeadersEnabled={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: tabBarInset || spacing.huge,
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
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
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
      )}
      {filtersOpen ? (
        <ReportFiltersSheet
          visible
          value={extra}
          onClose={() => setFiltersOpen(false)}
          onApply={(next) => {
            setExtra(next);
            setFiltersOpen(false);
          }}
        />
      ) : null}
    </Screen>
  );
}
