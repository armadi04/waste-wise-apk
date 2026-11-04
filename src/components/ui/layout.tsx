import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  View,
  type RefreshControlProps,
  type ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { AppText } from './text';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  /** Sticky bottom bar, rendered below the content with the bottom inset. */
  footer?: ReactNode;
}

export function Screen({
  children,
  scroll,
  refreshControl,
  contentContainerStyle,
  style,
  footer,
}: ScreenProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        {
          padding: spacing.lg,
          gap: spacing.lg,
          paddingBottom: footer ? spacing.xxl : spacing.huge,
        },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        { flex: 1, padding: spacing.lg, gap: spacing.lg },
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
    >
      {content}
      {footer ? (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.borderSubtle,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.md + insets.bottom,
            gap: spacing.sm,
          }}
        >
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  right,
  onBack,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
}) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        paddingBottom: spacing.sm,
      }}
    >
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          hitSlop={12}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.muted,
          }}
        >
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="pageTitle">{title}</AppText>
        {subtitle ? (
          <AppText color={colors.mutedForeground}>{subtitle}</AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  const { spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
      }}
    >
      <AppText variant="sectionTitle">{title}</AppText>
      {action}
    </View>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.borderSubtle }} />;
}
