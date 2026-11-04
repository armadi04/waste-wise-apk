import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { authCopy } from '@/auth/auth-copy';
import { AppText } from '@/components/ui/text';
import { useTheme } from '@/theme';

const HERO_BOTTOM_SPACE = 56;
const HERO_COPY_WIDTH = 320;

function AuthHeaderPattern() {
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
        viewBox="0 0 400 280"
        preserveAspectRatio="xMidYMid slice"
      >
        <G fill={colors.brandForeground} opacity={0.08}>
          <Circle cx={34} cy={44} r={1.4} />
          <Circle cx={92} cy={82} r={1} />
          <Circle cx={144} cy={32} r={1.2} />
          <Circle cx={214} cy={68} r={0.9} />
          <Circle cx={278} cy={38} r={1.4} />
          <Circle cx={334} cy={94} r={1.1} />
          <Circle cx={372} cy={54} r={0.9} />
          <Circle cx={54} cy={126} r={1} />
          <Circle cx={306} cy={142} r={1.2} />
          <Path d="M0 280V248h44v-24c0-13 10-23 23-23s23 10 23 23v24h52v-38c0-18 14-32 32-32s32 14 32 32v38h60v-30c0-15 12-27 27-27s27 12 27 27v30h60v-20c0-11 9-20 20-20s20 9 20 20v20Z" />
        </G>
        <G
          fill="none"
          stroke={colors.brandForeground}
          strokeWidth={1.2}
          opacity={0.13}
        >
          <Path d="M118 280V154c0-54 36-88 82-88s82 34 82 88v126" />
          <Path d="M154 280V172c0-35 22-58 46-58s46 23 46 58v108" />
        </G>
      </Svg>
    </View>
  );
}

export function AuthHero() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top,
          paddingHorizontal: spacing.xxl,
        },
      ]}
    >
      <AuthHeaderPattern />
      <View
        style={[styles.content, { gap: spacing.sm, paddingTop: spacing.sm }]}
      >
        <AppText
          variant="cardTitle"
          color={colors.accent}
          weight="semibold"
          style={{ letterSpacing: 0.4 }}
        >
          {authCopy.brand}
        </AppText>
        <AppText
          variant="display"
          color={colors.brandForeground}
          accessibilityRole="header"
          style={{ textAlign: 'center', letterSpacing: -0.4 }}
        >
          {authCopy.title}
        </AppText>
        <AppText
          variant="body"
          color={colors.brandMutedForeground}
          style={{
            maxWidth: HERO_COPY_WIDTH,
            textAlign: 'center',
          }}
        >
          {authCopy.subtitle}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: HERO_BOTTOM_SPACE,
  },
  content: {
    alignItems: 'center',
  },
});
