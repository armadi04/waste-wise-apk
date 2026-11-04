import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { AuthHero } from './auth-hero';

const DOCK_RADIUS = 28;
const DOCK_OVERLAP = -24;
const DOCK_SHADOW_RADIUS = 24;
const DOCK_SHADOW_OFFSET = -8;
const DOCK_ELEVATION = 12;

export function AuthScreen({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: colors.brand }]}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <AuthHero title={title} subtitle={subtitle} />

        <View
          style={[
            styles.dock,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderSubtle,
              shadowColor: colors.shadow,
              paddingBottom: insets.bottom + spacing.xl,
            },
          ]}
        >
          <View
            style={{
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.xxl,
              gap: spacing.xl,
            }}
          >
            {children}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  dock: {
    marginTop: DOCK_OVERLAP,
    borderTopLeftRadius: DOCK_RADIUS,
    borderTopRightRadius: DOCK_RADIUS,
    borderTopWidth: 1,
    shadowOpacity: 0.12,
    shadowRadius: DOCK_SHADOW_RADIUS,
    shadowOffset: { width: 0, height: DOCK_SHADOW_OFFSET },
    elevation: DOCK_ELEVATION,
  },
});
