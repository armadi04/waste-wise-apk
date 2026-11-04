import { StyleSheet, View } from 'react-native';
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

import { useTheme } from '@/theme';

export function BrandBackdrop() {
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
          <LinearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.brand} />
            <Stop offset="1" stopColor={colors.brandPressed} />
          </LinearGradient>
          <RadialGradient id="brandGlow" cx="0.82" cy="0.12" r="0.72">
            <Stop offset="0" stopColor={colors.primary} stopOpacity={0.34} />
            <Stop offset="1" stopColor={colors.brand} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Rect width="400" height="640" fill="url(#brandGradient)" />
        <Rect width="400" height="640" fill="url(#brandGlow)" />

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
