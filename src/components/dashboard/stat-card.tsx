import { View } from 'react-native';

import { Card } from '@/components/ui/card';
import { AppText } from '@/components/ui/text';
import type { Tone } from '@/lib/reports';
import { useTheme } from '@/theme';

export function StatCard({
  label,
  value,
  tone = 'default',
  icon,
}: {
  label: string;
  value: number | string;
  tone?: Tone;
  icon?: React.ReactNode;
}) {
  const { colors, spacing, radius } = useTheme();
  const tones: Record<Tone, { bg: string; fg: string; border: string }> = {
    default: {
      bg: colors.muted,
      fg: colors.foreground,
      border: colors.borderSubtle,
    },
    info: {
      bg: colors.infoBackground,
      fg: colors.infoForeground,
      border: colors.infoBorder,
    },
    success: {
      bg: colors.successBackground,
      fg: colors.successForeground,
      border: colors.successBorder,
    },
    warning: {
      bg: colors.warningBackground,
      fg: colors.warningForeground,
      border: colors.warningBorder,
    },
    danger: {
      bg: colors.dangerBackground,
      fg: colors.dangerForeground,
      border: colors.dangerBorder,
    },
  };
  const current = tones[tone];

  return (
    <Card
      style={{ flex: 1, minWidth: 150, gap: spacing.sm, padding: spacing.md }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <AppText
          variant="caption"
          color={colors.mutedForeground}
          style={{ flex: 1 }}
        >
          {label}
        </AppText>
        {icon ? (
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: radius.md,
              backgroundColor: current.bg,
              borderWidth: 1,
              borderColor: current.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </View>
        ) : null}
      </View>
      <AppText variant="pageTitle">{value}</AppText>
    </Card>
  );
}
