import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { authCopy } from '@/auth/auth-copy';
import { useAuth } from '@/auth/auth-provider';
import { AuthScreen } from '@/components/auth/auth-screen';
import { InlineAlert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/field';
import { AppText } from '@/components/ui/text';
import {
  twoFactorSchema,
  type TwoFactorFormValues,
} from '@/lib/validation/auth';
import { useTheme } from '@/theme';

export default function TwoFactorScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const {
    status,
    isTwoFactorPending,
    isVerifyingTwoFactor,
    verifyTwoFactor,
    cancelTwoFactor,
  } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: { code: '' },
    mode: 'onSubmit',
  });

  if (status === 'authenticated') {
    return null;
  }

  if (!isTwoFactorPending) {
    return <Redirect href="/login" />;
  }

  const onSubmit = handleSubmit(async ({ code }) => {
    setError(null);
    const result = await verifyTwoFactor(code.trim());
    if (result.status === 'error') {
      setError(result.error.message);
    }
  });

  const startOver = () => {
    cancelTwoFactor();
    router.replace('/login');
  };

  return (
    <AuthScreen
      title={authCopy.twoFactorTitle}
      subtitle={authCopy.twoFactorSubtitle}
    >
      <View style={{ gap: spacing.lg }}>
        <Controller
          control={control}
          name="code"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextField
              testID="two-factor-code"
              label={authCopy.twoFactorLabel}
              placeholder={authCopy.twoFactorPlaceholder}
              hint={authCopy.twoFactorHint}
              error={errors.code?.message}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={32}
              editable={!isVerifyingTwoFactor}
              returnKeyType="done"
              onSubmitEditing={() => void onSubmit()}
            />
          )}
        />

        {error ? (
          <InlineAlert
            tone="danger"
            message={error}
            testID="two-factor-error"
          />
        ) : null}

        <Button
          testID="two-factor-submit"
          label={authCopy.twoFactorCta}
          loadingLabel={authCopy.twoFactorLoading}
          loading={isVerifyingTwoFactor}
          onPress={() => void onSubmit()}
          fullWidth
        />

        <Pressable
          accessibilityRole="button"
          onPress={startOver}
          hitSlop={8}
          style={styles.startOver}
        >
          <AppText color={colors.link} weight="semibold">
            {authCopy.twoFactorStartOver}
          </AppText>
        </Pressable>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  startOver: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
