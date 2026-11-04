import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { GoogleIcon } from '@/components/ui/google-icon';
import { useTheme } from '@/theme';

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
  const { colors, radius } = useTheme();

  return (
    <Button
      testID="google-sign-in-button"
      label={label}
      loadingLabel={loadingLabel}
      loading={loading}
      disabled={disabled}
      onPress={onPress}
      fullWidth
      accessibilityHint="Opens the Google account picker"
      icon={
        <View
          style={[styles.mark, { backgroundColor: colors.primaryForeground }]}
        >
          <GoogleIcon size={17} />
        </View>
      }
      style={{ borderRadius: radius.lg, minHeight: 56 }}
    />
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
