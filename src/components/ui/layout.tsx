import { ArrowLeft } from 'lucide-react-native';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type RefreshControlProps,
  type ScrollViewInstance,
  type ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useTabBarInset } from '@/components/navigation/tab-bar-inset';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';
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
  const tabBarInset = useTabBarInset();
  const keyboardVisible = useKeyboardVisible();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const scrollY = useRef(0);

  // Keep the focused input (e.g. a growing multiline description) visible
  // above the keyboard instead of leaving it hidden underneath.
  const revealFocusedInput = useCallback(() => {
    const view = scrollRef.current;
    const input = TextInput.State.currentlyFocusedInput();
    if (!view || !input) return;
    view.measureInWindow((_vx, viewY, _vw, viewHeight) => {
      input.measureInWindow((_ix, inputY, _iw, inputHeight) => {
        const overflow =
          inputY + inputHeight + spacing.lg - (viewY + viewHeight);
        if (overflow > 0) {
          view.scrollTo({ y: scrollY.current + overflow, animated: true });
        }
      });
    });
  }, [spacing.lg]);

  useEffect(() => {
    if (!scroll) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const show = Keyboard.addListener('keyboardDidShow', () => {
      // Wait for KeyboardAvoidingView to shrink the scroll view first.
      timer = setTimeout(revealFocusedInput, 120);
    });
    return () => {
      show.remove();
      if (timer) clearTimeout(timer);
    };
  }, [scroll, revealFocusedInput]);

  const content = scroll ? (
    <ScrollView
      ref={scrollRef}
      onScroll={(event) => {
        scrollY.current = event.nativeEvent.contentOffset.y;
      }}
      scrollEventThrottle={16}
      onContentSizeChange={() => {
        if (keyboardVisible) revealFocusedInput();
      }}
      contentContainerStyle={[
        {
          padding: spacing.lg,
          gap: spacing.lg,
          paddingBottom: footer ? spacing.xxl : tabBarInset || spacing.huge,
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
      {/* Edge-to-edge Android no longer resizes the window for the IME. */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        {content}
        {/* Hide the sticky footer while typing so the field stays readable. */}
        {footer && !keyboardVisible ? (
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
      </KeyboardAvoidingView>
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
