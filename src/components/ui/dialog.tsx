import type { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { toneColors, type Tone } from '@/lib/reports';
import { useTheme } from '@/theme';

import { Button } from './button';
import { AppText } from './text';

export interface DialogProps {
  visible: boolean;
  title: string;
  message?: string;
  /** Icon shown in a tone-tinted circle above the title. */
  icon?: (color: string) => ReactNode;
  /** `danger` styles the confirm action as destructive. */
  tone?: Extract<Tone, 'default' | 'danger' | 'info' | 'warning'>;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  loadingLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Themed confirmation dialog replacing the native `Alert`, which ignores the
 * app theme and fonts. Back button, scrim tap and Cancel all call `onCancel`
 * (disabled while `loading`).
 */
export function Dialog({
  visible,
  title,
  message,
  icon,
  tone = 'default',
  confirmLabel,
  cancelLabel = 'Cancel',
  loading = false,
  loadingLabel,
  onConfirm,
  onCancel,
}: DialogProps) {
  const { colors, radius, spacing } = useTheme();
  const toneStyle = toneColors(colors, tone === 'default' ? 'info' : tone);
  const dismiss = () => {
    if (!loading) onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={dismiss}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          padding: spacing.xxl,
        }}
      >
        <Pressable
          accessibilityLabel="Close dialog"
          accessibilityRole="button"
          onPress={dismiss}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: colors.scrim,
          }}
        />
        <View
          accessibilityViewIsModal
          accessibilityRole="alert"
          style={{
            alignSelf: 'center',
            width: '100%',
            maxWidth: 400,
            padding: spacing.xxl,
            gap: spacing.lg,
            borderRadius: radius.xl,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            backgroundColor: colors.surface,
            shadowColor: colors.shadow,
            shadowOpacity: 0.3,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
            elevation: 12,
          }}
        >
          <View style={{ alignItems: 'center', gap: spacing.sm }}>
            {icon ? (
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: toneStyle.bg,
                  marginBottom: spacing.xs,
                }}
              >
                {icon(toneStyle.fg)}
              </View>
            ) : null}
            <AppText
              variant="sectionTitle"
              accessibilityRole="header"
              style={{ textAlign: 'center' }}
            >
              {title}
            </AppText>
            {message ? (
              <AppText
                color={colors.mutedForeground}
                style={{ textAlign: 'center' }}
              >
                {message}
              </AppText>
            ) : null}
          </View>
          <View style={{ gap: spacing.sm }}>
            <Button
              label={confirmLabel}
              variant={tone === 'danger' ? 'danger' : 'primary'}
              fullWidth
              loading={loading}
              loadingLabel={loadingLabel}
              onPress={onConfirm}
            />
            <Button
              label={cancelLabel}
              variant="ghost"
              fullWidth
              disabled={loading}
              onPress={dismiss}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
