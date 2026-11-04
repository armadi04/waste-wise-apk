import { useRouter } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { authCopy } from '@/auth/auth-copy';
import { useAuth } from '@/auth/auth-provider';
import { AuthScreen } from '@/components/auth/auth-screen';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { InlineAlert } from '@/components/ui/alert';
import { AppText } from '@/components/ui/text';
import { IS_GOOGLE_CONFIGURED } from '@/lib/config';
import { useTheme } from '@/theme';

export default function LoginScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { signInWithGoogle, isSigningIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const configMessage = __DEV__
    ? authCopy.devConfigWarning
    : authCopy.configUnavailable;

  const handleSignIn = async () => {
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result.status === 'error') {
        setError(result.error.message);
        return;
      }
      if (result.status === 'two-factor-required') {
        router.push('/two-factor');
      }
    } catch {
      setError(authCopy.errorFallback);
    }
  };

  return (
    <AuthScreen>
      <View style={{ gap: spacing.sm }}>
        <AppText variant="sectionTitle">{authCopy.sheetTitle}</AppText>
        <AppText color={colors.mutedForeground}>{authCopy.sheetBody}</AppText>
      </View>

      {!IS_GOOGLE_CONFIGURED ? (
        <InlineAlert
          tone="warning"
          message={configMessage}
          testID="auth-config-warning"
        />
      ) : null}

      <View style={{ gap: spacing.sm }}>
        <GoogleSignInButton
          label={authCopy.cta}
          loadingLabel={authCopy.loading}
          onPress={() => void handleSignIn()}
          loading={isSigningIn}
          disabled={!IS_GOOGLE_CONFIGURED}
        />
        <AppText variant="caption" color={colors.mutedForeground}>
          {authCopy.newHere}
        </AppText>
      </View>

      {error ? (
        <InlineAlert tone="danger" message={error} testID="auth-error" />
      ) : null}

      <View style={[styles.trustRow, { gap: spacing.sm }]}>
        <ShieldCheck size={16} color={colors.mutedForeground} />
        <AppText
          variant="caption"
          color={colors.mutedForeground}
          style={{ flex: 1 }}
        >
          {authCopy.trust}
        </AppText>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  trustRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
