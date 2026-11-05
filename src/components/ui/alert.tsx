import { View } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './text';

type AlertTone = 'danger' | 'warning' | 'info';

const toneTokens = {
  danger: {
    background: 'dangerBackground',
    border: 'dangerBorder',
    foreground: 'dangerForeground',
  },
  warning: {
    background: 'warningBackground',
    border: 'warningBorder',
    foreground: 'warningForeground',
  },
  info: {
    background: 'infoBackground',
    border: 'infoBorder',
    foreground: 'infoForeground',
  },
} as const;

export function InlineAlert({
  tone = 'danger',
  title,
  message,
  testID,
}: {
  tone?: AlertTone;
  title?: string;
  message: string;
  testID?: string;
}) {
  const { colors, radius, spacing } = useTheme();
  const tokens = toneTokens[tone];

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID={testID}
      style={{
        gap: spacing.xs,
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors[tokens.border],
        backgroundColor: colors[tokens.background],
      }}
    >
      {title ? (
        <AppText color={colors[tokens.foreground]} weight="semibold">
          {title}
        </AppText>
      ) : null}
      <AppText color={colors[tokens.foreground]}>{message}</AppText>
    </View>
  );
}
