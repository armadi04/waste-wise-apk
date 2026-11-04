import { View, type ViewStyle } from 'react-native';

import type { Tone } from '@/lib/reports';
import { useTheme } from '@/theme';

import { AppText } from './text';

interface BadgeProps {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
}

export function Badge({ label, tone = 'default', style }: BadgeProps) {
  const { colors, radius, spacing } = useTheme();
  const toneStyle: Record<Tone, { bg: string; fg: string; border: string }> = {
    default: {
      bg: colors.muted,
      fg: colors.mutedForeground,
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
  const current = toneStyle[tone];
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: current.border,
          backgroundColor: current.bg,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
        },
        style,
      ]}
    >
      <AppText variant="caption" color={current.fg} weight="semibold">
        {label}
      </AppText>
    </View>
  );
}
