import { ActivityIndicator, Pressable, View } from 'react-native';

import { GoogleIcon } from '@/components/ui/google-icon';
import { AppText } from '@/components/ui/text';
import { useTheme } from '@/theme';

/**
 * "Continue with Google" button following Google's sign-in branding: neutral
 * light/dark fill with an outline, the full-colour G mark (no badge), pill shape.
 */
export function GoogleSignInButton({
  label,
  loadingLabel,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  loadingLabel: string;
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  const { colors, radius, spacing, fontFamily } = useTheme();
  const inactive = disabled || loading;
  const foreground = disabled
    ? colors.disabledForeground
    : colors.googleButtonForeground;

  return (
    <Pressable
      testID="google-sign-in-button"
      accessibilityRole="button"
      accessibilityLabel={loading ? loadingLabel : label}
      accessibilityHint="Opens the Google account picker"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: disabled
          ? colors.disabledBorder
          : colors.googleButtonBorder,
        backgroundColor: disabled
          ? colors.disabledBackground
          : pressed
            ? colors.googleButtonPressed
            : colors.googleButtonBackground,
      })}
    >
      {loading ? (
        <ActivityIndicator size="small" color={foreground} />
      ) : (
        <View style={{ opacity: disabled ? 0.38 : 1 }}>
          <GoogleIcon size={20} />
        </View>
      )}
      <AppText
        variant="button"
        color={foreground}
        style={{ fontFamily: fontFamily.semibold }}
      >
        {loading ? loadingLabel : label}
      </AppText>
    </Pressable>
  );
}
