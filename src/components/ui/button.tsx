import {
  ActivityIndicator,
  Pressable,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './text';

type Variant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'danger-outline'
  | 'inverse';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  loadingLabel?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  loadingLabel,
  disabled,
  icon,
  fullWidth,
  style,
  accessibilityLabel,
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
        : variant === 'inverse'
          ? colors.brandForeground
          : variant === 'secondary'
            ? colors.selectedBackground
            : 'transparent';

  const foreground = isDisabled
    ? colors.disabledForeground
    : variant === 'danger'
      ? colors.dangerSolidForeground
      : variant === 'inverse'
        ? colors.brand
        : variant === 'danger-outline'
          ? colors.danger
          : variant === 'primary'
            ? colors.primaryForeground
            : variant === 'secondary'
              ? colors.selectedForeground
              : colors.foreground;

  const borderColor = isDisabled
    ? colors.disabledBorder
    : variant === 'outline'
      ? colors.borderControl
      : variant === 'danger-outline'
        ? colors.dangerBorder
        : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? (loading ? (loadingLabel ?? label) : label)
      }
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
          borderWidth:
            variant === 'outline' || variant === 'danger-outline' ? 1 : 0,
          borderColor,
          backgroundColor:
            pressed && !isDisabled
              ? variant === 'primary'
                ? colors.primaryPressed
                : variant === 'danger'
                  ? colors.dangerBorder
                  : variant === 'inverse'
                    ? colors.brandMutedForeground
                    : variant === 'danger-outline'
                      ? colors.dangerBackground
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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
          <ActivityIndicator size="small" color={foreground} />
          {loadingLabel ? (
            <AppText
              variant="button"
              color={foreground}
              style={{ fontFamily: fontFamily.semibold }}
            >
              {loadingLabel}
            </AppText>
          ) : null}
        </View>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
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
