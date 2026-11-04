import { useRouter } from 'expo-router';
import {
  CheckCircle2,
  Clock3,
  FileWarning,
  Plus,
  RotateCw,
  XCircle,
} from 'lucide-react-native';
import { RefreshControl, View } from 'react-native';

import { useAuth } from '@/auth/auth-provider';
import { StatCard } from '@/components/dashboard/stat-card';
import { ReportListItem } from '@/components/reports/report-list-item';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen, ScreenHeader, SectionHeader } from '@/components/ui/layout';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/states';
import { AppText } from '@/components/ui/text';
import { useReportStats } from '@/hooks/use-reports';
import { errorMessage } from '@/api/errors';
import { useTheme } from '@/theme';

export default function DashboardScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const stats = useReportStats();

  const openReport = (id: number) =>
    router.push({ pathname: '/reports/[id]', params: { id: String(id) } });

  const firstName = user?.fullname?.split(' ')[0] || 'there';

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
      <ScreenHeader
        title={`Hello, ${firstName}`}
        subtitle="Here is what is happening with your waste reports."
        right={
          <Button
            label="New"
            icon={<Plus size={17} color={colors.primaryForeground} />}
            onPress={() => router.push('/reports/create')}
          />
        }
      />

      {stats.isLoading ? (
        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Skeleton height={110} />
            <Skeleton height={110} />
          </View>
          <Skeleton height={110} />
          <Skeleton height={200} />
        </View>
      ) : stats.isError ? (
        <ErrorState
          message={errorMessage(stats.error)}
          onRetry={() => void stats.refetch()}
        />
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
            <StatCard
              label="Total Reports"
              value={stats.data?.total ?? 0}
              icon={<FileWarning size={18} color={colors.foreground} />}
            />
            <StatCard
              label="Pending"
              value={stats.data?.pending ?? 0}
              tone="warning"
              icon={<Clock3 size={18} color={colors.warningForeground} />}
            />
            <StatCard
              label="In Progress"
              value={stats.data?.inProgress ?? 0}
              tone="info"
              icon={<RotateCw size={18} color={colors.infoForeground} />}
            />
            <StatCard
              label="Completed"
              value={stats.data?.completed ?? 0}
              tone="success"
              icon={<CheckCircle2 size={18} color={colors.successForeground} />}
            />
            <StatCard
              label="Rejected"
              value={stats.data?.rejected ?? 0}
              tone="danger"
              icon={<XCircle size={18} color={colors.dangerForeground} />}
            />
          </View>

          <Card style={{ gap: spacing.md }}>
            <SectionHeader
              title="Recent Reports"
              action={
                <Button
                  label="View all"
                  variant="ghost"
                  onPress={() => router.push('/reports')}
                />
              }
            />
            {stats.data?.recentReports.length ? (
              <View style={{ gap: spacing.sm }}>
                {stats.data.recentReports.map((report) => (
                  <ReportListItem
                    key={report.id}
                    report={report}
                    onPress={() => openReport(report.id)}
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                title="No reports yet"
                description="Create your first report and let AI classify the waste."
                actionLabel="Create report"
                onAction={() => router.push('/reports/create')}
              />
            )}
          </Card>

          <AppText variant="caption" color={colors.mutedForeground}>
            Statistics only include reports owned by your account.
          </AppText>
        </>
      )}
    </Screen>
  );
}
