import { useState } from 'react';
import { View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/field';
import { AppText } from '@/components/ui/text';
import { twoFactorSchema } from '@/lib/validation/auth';
import { useTheme } from '@/theme';

/** Asks for an authenticator or recovery code before a sensitive 2FA action. */
export function CodePromptSheet({
  visible,
  title,
  description,
  confirmLabel,
  danger,
  loading,
  error,
  onSubmit,
  onClose,
}: {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  loading: boolean;
  error: string | null;
  onSubmit: (code: string) => void;
  onClose: () => void;
}) {
  const { colors, spacing } = useTheme();
  const [code, setCode] = useState('');
  const [invalid, setInvalid] = useState<string | null>(null);

  const submit = () => {
    const parsed = twoFactorSchema.safeParse({ code });
    if (!parsed.success) {
      setInvalid(parsed.error.issues[0]?.message ?? 'Enter a valid code');
      return;
    }
    setInvalid(null);
    onSubmit(parsed.data.code);
  };

  return (
    <BottomSheet
      visible={visible}
      title={title}
      onClose={loading ? () => undefined : onClose}
      footer={
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button
            label="Cancel"
            variant="outline"
            disabled={loading}
            onPress={onClose}
            style={{ flex: 1 }}
          />
          <Button
            label={confirmLabel}
            variant={danger ? 'danger' : 'primary'}
            loading={loading}
            onPress={submit}
            style={{ flex: 2 }}
          />
        </View>
      }
    >
      <AppText color={colors.mutedForeground}>{description}</AppText>
      <TextField
        label="Authentication code"
        value={code}
        onChangeText={setCode}
        placeholder="6-digit code or recovery code"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={32}
        error={invalid ?? error}
        editable={!loading}
        onSubmitEditing={submit}
      />
    </BottomSheet>
  );
}
