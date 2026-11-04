import { ShieldCheck } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/auth-provider';
import { authCopy } from '@/auth/auth-copy';
import { AuthHero } from '@/components/auth/auth-hero';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { InlineAlert } from '@/components/ui/alert';
import { AppText } from '@/components/ui/text';
import { IS_GOOGLE_CONFIGURED } from '@/lib/config';
import { useTheme } from '@/theme';

const SHEET_RADIUS = 30;
const SHEET_OVERLAP = -32;
const SHEET_SHADOW_RADIUS = 24;
const SHEET_SHADOW_OFFSET = -8;
const SHEET_ELEVATION = 12;

export default function LoginScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
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
      }
    } catch {
      setError(authCopy.errorFallback);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.brand }]}>
      <StatusBar style="light" />
      <AuthHero />

      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.background,
            borderColor: colors.borderSubtle,
            shadowColor: colors.shadow,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={[
            styles.sheetContent,
            {
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.xl,
              gap: spacing.xl,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: spacing.xl }}>
            <View style={{ gap: spacing.sm }}>
              <AppText variant="sectionTitle">{authCopy.sheetTitle}</AppText>
              <AppText color={colors.mutedForeground}>
                {authCopy.sheetBody}
              </AppText>
            </View>

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
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    marginTop: SHEET_OVERLAP,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    borderTopWidth: 1,
    overflow: 'hidden',
    shadowOpacity: 0.1,
    shadowRadius: SHEET_SHADOW_RADIUS,
    shadowOffset: { width: 0, height: SHEET_SHADOW_OFFSET },
    elevation: SHEET_ELEVATION,
  },
  sheetContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 8,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
