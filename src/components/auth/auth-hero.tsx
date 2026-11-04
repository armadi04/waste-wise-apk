import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import logo from '@/assets/brand/logo.png';
import { authCopy } from '@/auth/auth-copy';
import { AppText } from '@/components/ui/text';
import { useTheme } from '@/theme';

const HERO_BOTTOM_SPACE = 48;
const HERO_COPY_WIDTH = 330;

function AuthBackdrop() {
  const { colors } = useTheme();

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 400 640"
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <LinearGradient id="authGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.brand} />
            <Stop offset="1" stopColor={colors.brandPressed} />
          </LinearGradient>
          <RadialGradient id="authGlow" cx="0.82" cy="0.12" r="0.72">
            <Stop offset="0" stopColor={colors.primary} stopOpacity={0.34} />
            <Stop offset="1" stopColor={colors.brand} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Rect width="400" height="640" fill="url(#authGradient)" />
        <Rect width="400" height="640" fill="url(#authGlow)" />

        <G
          fill="none"
          stroke={colors.brandForeground}
          strokeWidth={1.2}
          opacity={0.11}
        >
          <Circle cx={348} cy={92} r={176} />
          <Circle cx={348} cy={92} r={112} />
          <Path d="M-60 432c82-112 192-164 302-164s220 52 302 164" />
          <Path d="M-60 472c82-112 192-164 302-164s220 52 302 164" />
        </G>

        <G fill={colors.brandForeground} opacity={0.1}>
          <Circle cx={44} cy={58} r={1.5} />
          <Circle cx={108} cy={104} r={1} />
          <Circle cx={182} cy={48} r={1.2} />
          <Circle cx={246} cy={126} r={1} />
          <Circle cx={316} cy={72} r={1.4} />
          <Circle cx={366} cy={148} r={1} />
          <Circle cx={70} cy={178} r={1.1} />
        </G>
      </Svg>
    </View>
  );
}

export function AuthHero({
  title = authCopy.title,
  subtitle = authCopy.subtitle,
}: {
  title?: string;
  subtitle?: string;
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
      <AuthBackdrop />

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
