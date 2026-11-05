import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import logo from '@/assets/brand/logo.png';
import { authCopy } from '@/auth/auth-copy';
import { BrandBackdrop } from '@/components/ui/brand-backdrop';
import { AppText } from '@/components/ui/text';

import { AuthIllustration } from './auth-illustration';
import { useTheme } from '@/theme';

const HERO_BOTTOM_SPACE = 48;
const HERO_COPY_WIDTH = 330;

export function AuthHero({
  title = authCopy.title,
  subtitle = authCopy.subtitle,
  illustration = false,
}: {
  title?: string;
  subtitle?: string;
  /** Show the decorative hero illustration (login only). */
  illustration?: boolean;
}) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.hero,
        {
          gap: spacing.xxxl,
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.xxl,
        },
      ]}
    >
      <BrandBackdrop />

      <View style={[styles.brandRow, { gap: spacing.md }]}>
        <View
          testID="auth-logo"
          accessible={false}
          style={[styles.logoTile, { backgroundColor: colors.brandForeground }]}
        >
          <Image
            source={logo}
            contentFit="contain"
            accessible={false}
            style={styles.logo}
          />
        </View>
        <View style={styles.brandText}>
          <AppText variant="cardTitle" color={colors.accent} weight="semibold">
            {authCopy.brand}
          </AppText>
          <AppText
            variant="caption"
            color={colors.brandMutedForeground}
            style={{ letterSpacing: 1.2 }}
          >
            {authCopy.tagline}
          </AppText>
        </View>
      </View>

      {illustration ? <AuthIllustration /> : null}

      <View style={[styles.copy, { gap: spacing.sm }]}>
        <AppText
          variant="display"
          color={colors.brandForeground}
          accessibilityRole="header"
          style={{ letterSpacing: -0.6 }}
        >
          {title}
        </AppText>
        <AppText
          variant="body"
          color={colors.brandMutedForeground}
          style={{ maxWidth: HERO_COPY_WIDTH }}
        >
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: HERO_BOTTOM_SPACE,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTile: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 31,
    height: 31,
  },
  brandText: {
    gap: 2,
  },
  copy: {
    maxWidth: HERO_COPY_WIDTH,
  },
});
