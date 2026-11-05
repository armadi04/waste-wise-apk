import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  RotateCw,
  XCircle,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/layout';
import { AppText } from '@/components/ui/text';
import {
  REPORT_STATUS_LABEL,
  REPORT_STATUS_TONE,
  REPORT_STATUSES,
  toneColors,
} from '@/lib/reports';
import { useTheme } from '@/theme';
import type { ReportStats, ReportStatus } from '@/types/domain';

const ICONS: Record<
  ReportStatus,
  ComponentType<{ size?: number; color?: string }>
> = {
  PENDING: Clock3,
  IN_PROGRESS: RotateCw,
  COMPLETED: CheckCircle2,
  REJECTED: XCircle,
};

function countFor(stats: ReportStats, status: ReportStatus): number {
  switch (status) {
    case 'PENDING':
      return stats.pending ?? 0;
    case 'IN_PROGRESS':
      return stats.inProgress ?? 0;
    case 'COMPLETED':
      return stats.completed ?? 0;
    default:
      return stats.rejected ?? 0;
  }
}

export function StatusBreakdown({
  stats,
  onSelect,
}: {
  stats: ReportStats;
  onSelect: (status: ReportStatus) => void;
}) {
  const { colors, radius, spacing } = useTheme();
  const rows = REPORT_STATUSES.map((status) => ({
    status,
    count: countFor(stats, status),
    tone: toneColors(colors, REPORT_STATUS_TONE[status]),
  }));
  const sum = rows.reduce((acc, row) => acc + row.count, 0);
  const summary = rows
    .map((row) => `${row.count} ${REPORT_STATUS_LABEL[row.status]}`)
    .join(', ');

  return (
    <Card style={{ gap: spacing.md }}>
      <SectionHeader title="By status" />
      <View
        accessible
        accessibilityLabel={summary}
        style={{
          flexDirection: 'row',
          height: 10,
          gap: 2,
          borderRadius: radius.pill,
          overflow: 'hidden',
          backgroundColor: colors.muted,
        }}
      >
        {sum > 0
          ? rows
              .filter((row) => row.count > 0)
              .map((row) => (
                <View
                  key={row.status}
                  style={{ flex: row.count, backgroundColor: row.tone.solid }}
                />
              ))
          : null}
      </View>
      <View>
        {rows.map((row) => {
          const Icon = ICONS[row.status];
          return (
            <Pressable
              key={row.status}
              accessibilityRole="button"
              accessibilityLabel={`${REPORT_STATUS_LABEL[row.status]}: ${row.count} reports`}
              onPress={() => onSelect(row.status)}
              style={({ pressed }) => ({
                minHeight: 52,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                paddingHorizontal: spacing.xs,
                borderRadius: radius.md,
                backgroundColor: pressed ? colors.surfaceHover : 'transparent',
              })}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: radius.md,
                  backgroundColor: row.tone.bg,
                  borderWidth: 1,
                  borderColor: row.tone.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={18} color={row.tone.fg} />
              </View>
              <AppText style={{ flex: 1 }}>
                {REPORT_STATUS_LABEL[row.status]}
              </AppText>
              <AppText
                variant="cardTitle"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {row.count}
              </AppText>
              <ChevronRight size={18} color={colors.mutedForeground} />
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}
