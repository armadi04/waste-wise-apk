import { View, type ViewStyle } from 'react-native';

import { toneColors, type Tone } from '@/lib/reports';
import { useTheme } from '@/theme';

import { AppText } from './text';

interface BadgeProps {
  label: string;
  tone?: Tone;
  /** Leading dot in the tone's solid color; pairs with the label. */
  dot?: boolean;
  style?: ViewStyle;
}

export function Badge({ label, tone = 'default', dot, style }: BadgeProps) {
  const { colors, radius, spacing } = useTheme();
  const current = toneColors(colors, tone);
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs + 2,
          borderRadius: radius.pill,
          backgroundColor: current.bg,
          paddingHorizontal: spacing.sm + 2,
          paddingVertical: 3,
        },
        style,
      ]}
    >
      {dot ? (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: current.solid,
          }}
        />
      ) : null}
      <AppText variant="caption" color={current.fg} weight="semibold">
        {label}
      </AppText>
    </View>
  );
}
