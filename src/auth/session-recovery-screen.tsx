import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authCopy } from '@/auth/auth-copy';
import { Button } from '@/components/ui/button';
import { AppText } from '@/components/ui/text';
import { useTheme } from '@/theme';

async function runAction(
  action: () => Promise<void>,
  setBusy: (value: boolean) => void,
): Promise<void> {
  setBusy(true);
  try {
    await action();
  } finally {
    setBusy(false);
  }
}

export function SessionRecoveryScreen({
  onRetry,
  onSignOut,
}: {
  onRetry: () => Promise<void>;
  onSignOut: () => Promise<void>;
}) {
  const { colors, spacing } = useTheme();
  const [retrying, setRetrying] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={[styles.root, { backgroundColor: colors.background }]}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          gap: spacing.xl,
          padding: spacing.xl,
        }}
      >
        <View style={{ gap: spacing.sm }}>
          <AppText variant="pageTitle" accessibilityRole="header">
            {authCopy.recoveryTitle}
          </AppText>
          <AppText color={colors.mutedForeground}>
            {authCopy.recoveryBody}
          </AppText>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Button
            label={authCopy.retry}
            loadingLabel={authCopy.retryLoading}
            loading={retrying}
            disabled={signingOut}
            fullWidth
            onPress={() => void runAction(onRetry, setRetrying)}
          />
          <Button
            label={authCopy.signOut}
            loadingLabel={authCopy.signOutLoading}
            loading={signingOut}
            disabled={retrying}
            variant="outline"
            fullWidth
            onPress={() => void runAction(onSignOut, setSigningOut)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
