import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '@/theme';

import { Button } from './button';
import { AppLottie } from './lottie';
import { AppText } from './text';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxxl,
        gap: spacing.md,
      }}
    >
      <ActivityIndicator color={colors.primary} size="large" />
      <AppText color={colors.mutedForeground}>{label}</AppText>
    </View>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  showAnimation = true,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  showAnimation?: boolean;
}) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxxl,
        gap: spacing.sm,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.borderSubtle,
        borderRadius: radius.lg,
      }}
    >
      {showAnimation ? (
        <AppLottie
          source={require('../../assets/lottie/empty.json')}
          size={150}
        />
      ) : null}
      <AppText variant="sectionTitle" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      <AppText color={colors.mutedForeground} style={{ textAlign: 'center' }}>
        {description}
      </AppText>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          style={{ marginTop: spacing.sm }}
        />
      ) : null}
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View
      style={{
        padding: spacing.lg,
        gap: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.dangerBorder,
        backgroundColor: colors.dangerBackground,
      }}
    >
      <AppText color={colors.dangerForeground} weight="semibold">
        Something went wrong
      </AppText>
      <AppText color={colors.dangerForeground}>{message}</AppText>
      {onRetry ? (
        <Button label="Try again" variant="outline" onPress={onRetry} />
      ) : null}
    </View>
  );
}

export function Skeleton({ height = 80 }: { height?: number }) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={{
        height,
        borderRadius: radius.md,
        backgroundColor: colors.muted,
      }}
    />
  );
}
