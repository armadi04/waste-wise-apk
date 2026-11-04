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
    <AuthScreen illustration>
      {!IS_GOOGLE_CONFIGURED ? (
        <InlineAlert
          tone="warning"
          message={configMessage}
          testID="auth-config-warning"
        />
      ) : null}

      <GoogleSignInButton
        label={authCopy.cta}
        loadingLabel={authCopy.loading}
        onPress={() => void handleSignIn()}
        loading={isSigningIn}
        disabled={!IS_GOOGLE_CONFIGURED}
      />

      <View style={[styles.reassurance, { gap: spacing.sm }]}>
        <ShieldCheck size={16} color={colors.mutedForeground} />
        <AppText
          variant="caption"
          color={colors.mutedForeground}
          style={{ flex: 1 }}
        >
          {authCopy.reassurance}
        </AppText>
      </View>

      {error ? (
        <InlineAlert tone="danger" message={error} testID="auth-error" />
      ) : null}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  reassurance: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
