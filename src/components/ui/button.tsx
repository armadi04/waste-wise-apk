import {
  ActivityIndicator,
  Pressable,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './text';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  fullWidth,
  style,
  ...rest
}: ButtonProps) {
  const { colors, radius, spacing, fontFamily } = useTheme();
  const isDisabled = disabled || loading;

  const background = isDisabled
    ? colors.disabledBackground
    : variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.dangerSolid
        : variant === 'secondary'
          ? colors.selectedBackground
          : 'transparent';

  const foreground = isDisabled
    ? colors.disabledForeground
    : variant === 'danger'
      ? colors.dangerSolidForeground
      : variant === 'primary'
        ? colors.primaryForeground
        : variant === 'secondary'
          ? colors.selectedForeground
          : colors.foreground;

  const borderColor = isDisabled
    ? colors.disabledBorder
    : variant === 'outline'
      ? colors.borderControl
      : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      {...rest}
      style={({ pressed }) => [
        {
          minHeight: 48,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: spacing.sm,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor,
          backgroundColor: pressed && !isDisabled
            ? variant === 'primary'
              ? colors.primaryPressed
              : variant === 'danger'
                ? colors.dangerBorder
                : variant === 'secondary'
                  ? colors.selectedHover
                  : colors.surfaceHover
            : background,
          opacity: fullWidth ? 1 : undefined,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={foreground} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {icon}
          <AppText
            variant="button"
            color={foreground}
            style={{ fontFamily: fontFamily.semibold }}
          >
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}
