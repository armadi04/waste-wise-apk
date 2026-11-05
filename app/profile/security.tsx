import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  ExternalLink,
  KeyRound,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react-native';
import { useState } from 'react';
import { Linking, RefreshControl, View } from 'react-native';

import { errorMessage } from '@/api/errors';
import { CodePromptSheet } from '@/components/security/code-prompt-sheet';
import { RecoveryCodes } from '@/components/security/recovery-codes';
import { InlineAlert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/field';
import { Screen, ScreenHeader } from '@/components/ui/layout';
import { ErrorState, Skeleton } from '@/components/ui/states';
import { AppText } from '@/components/ui/text';
import {
  useDisableTwoFactor,
  useEnableTwoFactor,
  useRegenerateRecoveryCodes,
  useStartTwoFactorSetup,
  useTwoFactorStatus,
} from '@/hooks/use-two-factor';
import { groupSecret } from '@/lib/two-factor';
import { twoFactorSchema } from '@/lib/validation/auth';
import { useTheme } from '@/theme';
import type { TwoFactorSetup } from '@/types/domain';

type Prompt = 'disable' | 'regenerate' | null;

function SetupStep({
  setup,
  onEnabled,
  onCancel,
}: {
  setup: TwoFactorSetup;
  onEnabled: (codes: string[]) => void;
  onCancel: () => void;
}) {
  const { colors, radius, spacing } = useTheme();
  const enable = useEnableTwoFactor();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [openFailed, setOpenFailed] = useState(false);

  const openAuthenticator = async () => {
    try {
      await Linking.openURL(setup.otpauthUrl);
      setOpenFailed(false);
    } catch {
      setOpenFailed(true);
    }
  };

  const confirm = async () => {
    const parsed = twoFactorSchema.safeParse({ code });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Enter a valid code');
      return;
    }
    setError(null);
    try {
      const result = await enable.mutateAsync(parsed.data.code);
      onEnabled(result.recoveryCodes);
    } catch (failure) {
      setError(errorMessage(failure));
    }
  };

  return (
    <Card style={{ gap: spacing.lg }}>
      <AppText variant="cardTitle" accessibilityRole="header">
        1. Add WasteWise to your authenticator
      </AppText>
      <Button
        label="Open in authenticator app"
        fullWidth
        icon={<ExternalLink size={16} color={colors.primaryForeground} />}
        onPress={() => void openAuthenticator()}
      />
      {openFailed ? (
        <InlineAlert
          tone="warning"
          message="No authenticator app opened. Install Google Authenticator or Microsoft Authenticator, or enter the key below manually."
        />
      ) : null}
      <View style={{ alignItems: 'center', gap: spacing.sm }}>
        <AppText variant="caption" color={colors.mutedForeground}>
          Or scan this QR code from another device
        </AppText>
        <View
          style={{
            padding: spacing.sm,
            borderRadius: radius.md,
            backgroundColor: colors.brandForeground,
          }}
        >
          <Image
            source={{ uri: setup.qrDataUrl }}
            style={{ width: 176, height: 176 }}
            contentFit="contain"
            accessibilityLabel="Two-factor setup QR code"
          />
        </View>
      </View>
      <View style={{ gap: spacing.xs }}>
        <AppText variant="caption" color={colors.mutedForeground}>
          Setup key (long-press to copy)
        </AppText>
        <AppText
          selectable
          accessibilityLabel={`Setup key ${setup.secret}`}
          style={{
            fontFamily: 'monospace',
            padding: spacing.md,
            borderRadius: radius.md,
            backgroundColor: colors.muted,
          }}
        >
          {groupSecret(setup.secret)}
        </AppText>
      </View>

      <AppText variant="cardTitle" accessibilityRole="header">
        2. Enter the 6-digit code
      </AppText>
      <TextField
        label="Authentication code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={32}
        error={error}
        editable={!enable.isPending}
        onSubmitEditing={() => void confirm()}
      />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Button
          label="Cancel"
          variant="outline"
          disabled={enable.isPending}
          onPress={onCancel}
          style={{ flex: 1 }}
        />
        <Button
          label="Verify and turn on"
          loading={enable.isPending}
          onPress={() => void confirm()}
          style={{ flex: 2 }}
        />
      </View>
    </Card>
  );
}

export default function SecurityScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const status = useTwoFactorStatus();
  const startSetup = useStartTwoFactorSetup();
  const disable = useDisableTwoFactor();
  const regenerate = useRegenerateRecoveryCodes();

  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [prompt, setPrompt] = useState<Prompt>(null);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  const begin = async () => {
    setSetupError(null);
    try {
      setSetup(await startSetup.mutateAsync());
    } catch (failure) {
      setSetupError(errorMessage(failure));
    }
  };

  const submitPrompt = async (code: string) => {
    setPromptError(null);
    try {
      if (prompt === 'disable') {
        await disable.mutateAsync(code);
      } else {
        const result = await regenerate.mutateAsync(code);
        setCodes(result.recoveryCodes);
      }
      setPrompt(null);
    } catch (failure) {
      setPromptError(errorMessage(failure));
    }
  };

  const enabled = status.data?.enabled ?? false;

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl
          refreshing={status.isRefetching}
          onRefresh={() => void status.refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <ScreenHeader
        title="Security"
        subtitle="Protect your account with a second step at sign-in."
        onBack={() => router.back()}
      />

      {codes ? (
        <RecoveryCodes codes={codes} onDone={() => setCodes(null)} />
      ) : setup ? (
        <SetupStep
          setup={setup}
          onCancel={() => setSetup(null)}
          onEnabled={(issued) => {
            setSetup(null);
            setCodes(issued);
          }}
        />
      ) : status.isLoading ? (
        <Skeleton height={180} />
      ) : status.isError ? (
        <ErrorState
          message={errorMessage(status.error)}
          onRetry={() => void status.refetch()}
        />
      ) : (
        <Card style={{ gap: spacing.lg }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
            }}
          >
            {enabled ? (
              <ShieldCheck size={28} color={colors.success} />
            ) : (
              <ShieldOff size={28} color={colors.mutedForeground} />
            )}
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="cardTitle">Two-factor authentication</AppText>
              <AppText variant="caption" color={colors.mutedForeground}>
                {enabled
                  ? `${status.data?.recoveryCodesRemaining ?? 0} recovery codes left`
                  : 'Ask for a code from your authenticator app at sign-in.'}
              </AppText>
            </View>
            <Badge
              label={enabled ? 'On' : 'Off'}
              tone={enabled ? 'success' : 'default'}
              dot
            />
          </View>
          {setupError ? (
            <InlineAlert message={setupError} testID="setup-error" />
          ) : null}
          {enabled ? (
            <View style={{ gap: spacing.sm }}>
              <Button
                label="New recovery codes"
                variant="outline"
                fullWidth
                icon={<KeyRound size={16} color={colors.foreground} />}
                onPress={() => {
                  setPromptError(null);
                  setPrompt('regenerate');
                }}
              />
              <Button
                label="Turn off two-factor"
                variant="danger-outline"
                fullWidth
                icon={<ShieldOff size={16} color={colors.danger} />}
                onPress={() => {
                  setPromptError(null);
                  setPrompt('disable');
                }}
              />
            </View>
          ) : (
            <Button
              label="Set up two-factor"
              fullWidth
              loading={startSetup.isPending}
              icon={<ShieldCheck size={16} color={colors.primaryForeground} />}
              onPress={() => void begin()}
            />
          )}
        </Card>
      )}

      {prompt ? (
        <CodePromptSheet
          visible
          title={
            prompt === 'disable'
              ? 'Turn off two-factor?'
              : 'Replace recovery codes?'
          }
          description={
            prompt === 'disable'
              ? 'Enter a code from your authenticator app or a recovery code. Sign-in will no longer ask for a code.'
              : 'Your current recovery codes stop working. Enter a code to confirm.'
          }
          confirmLabel={prompt === 'disable' ? 'Turn off' : 'Replace codes'}
          danger={prompt === 'disable'}
          loading={disable.isPending || regenerate.isPending}
          error={promptError}
          onSubmit={(code) => void submitPrompt(code)}
          onClose={() => setPrompt(null)}
        />
      ) : null}
    </Screen>
  );
}
