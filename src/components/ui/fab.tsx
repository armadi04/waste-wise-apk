import { Pressable } from 'react-native';
import type { ReactNode } from 'react';

import { useTheme } from '@/theme';

import { AppText } from './text';

export function Fab({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon?: ReactNode;
  onPress: () => void;
}) {
  const { colors, radius, spacing } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        position: 'absolute',
        right: spacing.lg,
        bottom: spacing.lg,
        minHeight: 56,
        paddingHorizontal: spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderRadius: radius.lg,
        backgroundColor: pressed ? colors.primaryPressed : colors.primary,
        shadowColor: colors.shadow,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      })}
    >
      {icon}
      <AppText variant="button" color={colors.primaryForeground}>
        {label}
      </AppText>
    </Pressable>
  );
}
