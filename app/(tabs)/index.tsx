import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { Pressable, RefreshControl, View } from 'react-native';

import { errorMessage } from '@/api/errors';
import { useAuth } from '@/auth/auth-provider';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown';
import { StatusBreakdown } from '@/components/dashboard/status-breakdown';
import { ReportListItem } from '@/components/reports/report-list-item';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Screen, SectionHeader } from '@/components/ui/layout';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { AppText } from '@/components/ui/text';
import { useUnreadNotificationCount } from '@/hooks/use-notifications';
import { useReportStats } from '@/hooks/use-reports';
import { greeting } from '@/lib/format';
import { useTheme } from '@/theme';

export default function DashboardScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const stats = useReportStats();
  const unread = useUnreadNotificationCount().data ?? 0;
  const unreadLabel = unread > 99 ? '99+' : String(unread);

  const openReport = (id: number) =>
    router.push({ pathname: '/reports/[id]', params: { id: String(id) } });

  const firstName = user?.fullname?.split(' ')[0] || 'there';
  const recent = stats.data?.recentReports.slice(0, 3) ?? [];

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl
          refreshing={stats.isRefetching}
          onRefresh={() => void stats.refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <AppText color={colors.mutedForeground}>{greeting()},</AppText>
          <AppText variant="pageTitle" numberOfLines={1}>
            {firstName}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            unread ? `Notifications, ${unreadLabel} unread` : 'Notifications'
          }
          onPress={() => router.push('/notifications')}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            backgroundColor: pressed ? colors.surfaceHover : colors.surface,
          })}
        >
          <Bell size={20} color={colors.foreground} />
          {unread ? (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 20,
                height: 20,
                paddingHorizontal: 5,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.dangerSolid,
                borderWidth: 2,
                borderColor: colors.background,
              }}
            >
              <AppText
                variant="caption"
                weight="semibold"
                color={colors.dangerSolidForeground}
                style={{ fontSize: 10, lineHeight: 12 }}
              >
                {unreadLabel}
              </AppText>
            </View>
          ) : null}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => router.push('/profile')}
          hitSlop={8}
        >
          <Avatar media={user?.avatar} name={user?.fullname} size={48} />
        </Pressable>
      </View>

      {stats.isLoading ? (
        <View style={{ gap: spacing.md }}>
          <Skeleton height={168} />
          <Skeleton height={220} />
          <Skeleton height={92} />
          <Skeleton height={92} />
        </View>
      ) : stats.isError || !stats.data ? (
        <ErrorState
          message={errorMessage(stats.error)}
          onRetry={() => void stats.refetch()}
        />
      ) : (
        <>
          <DashboardHero
            total={stats.data.total}
            onReport={() => router.push('/reports/create')}
          />
          <StatusBreakdown
            stats={stats.data}
            onSelect={(status) =>
              router.push({ pathname: '/reports', params: { status } })
            }
          />
          <CategoryBreakdown
            stats={stats.data}
            onSelect={(category) =>
              router.push({ pathname: '/reports', params: { category } })
            }
          />
          <View style={{ gap: spacing.sm }}>
            <SectionHeader
              title="Recent reports"
              action={
                recent.length ? (
                  <Button
                    label="View all"
                    variant="ghost"
                    onPress={() => router.push('/reports')}
                  />
                ) : undefined
              }
            />
            {recent.length ? (
              recent.map((report) => (
                <ReportListItem
                  key={report.id}
                  report={report}
                  onPress={() => openReport(report.id)}
                />
              ))
            ) : (
              <EmptyState
                variant="plain"
                title="No reports yet"
                description="Tap Report waste and let AI classify it."
              />
            )}
          </View>
        </>
      )}
    </Screen>
  );
}
