import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';
import { darkColors } from '@/theme/tokens';

const BIN_WIDTH = 30;
const BIN_HEIGHT = 38;
const GROUND_Y = 214;

function Bin({ x, color }: { x: number; color: string }) {
  const { colors } = useTheme();
  const top = GROUND_Y - BIN_HEIGHT;
  return (
    <G>
      <Rect
        x={x - 3}
        y={top - 7}
        width={BIN_WIDTH + 6}
        height={6}
        rx={3}
        fill={color}
      />
      <Rect
        x={x + BIN_WIDTH / 2 - 5}
        y={top - 11}
        width={10}
        height={4}
        rx={2}
        fill={color}
      />
      <Rect
        x={x}
        y={top}
        width={BIN_WIDTH}
        height={BIN_HEIGHT}
        rx={5}
        fill={color}
      />
      <G
        stroke={colors.brand}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.35}
      >
        <Line x1={x + 9} y1={top + 9} x2={x + 9} y2={top + 29} />
        <Line x1={x + 15} y1={top + 9} x2={x + 15} y2={top + 29} />
        <Line x1={x + 21} y1={top + 9} x2={x + 21} y2={top + 29} />
      </G>
    </G>
  );
}

/**
 * Decorative hero art: a phone scanning a bottle, an AI sparkle, and the three
 * category bins. The auth hero is always a dark brand surface (both themes), so
 * the bins use the dark-theme category hues for consistent contrast.
 */
export function AuthIllustration() {
  const { colors } = useTheme();
  const corner = {
    stroke: colors.primary,
    strokeWidth: 3,
    strokeLinecap: 'round' as const,
    fill: 'none',
  };

  return (
    <View
      testID="auth-illustration"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={styles.box}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 320 240"
        preserveAspectRatio="xMidYMid meet"
      >
        <Circle
          cx={160}
          cy={116}
          r={100}
          fill={colors.brandForeground}
          opacity={0.07}
        />
        <Circle
          cx={160}
          cy={116}
          r={68}
          fill={colors.brandForeground}
          opacity={0.06}
        />

        <Line
          x1={20}
          y1={GROUND_Y}
          x2={300}
          y2={GROUND_Y}
          stroke={colors.brandForeground}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.25}
        />

        <G
          fill="none"
          stroke={colors.brandForeground}
          strokeWidth={2}
          strokeDasharray="3 6"
          strokeLinecap="round"
          opacity={0.45}
        >
          <Path d="M116 182 C 98 192, 88 196, 92 168" />
          <Path d="M204 182 C 222 192, 240 190, 268 166" />
        </G>

        <Bin x={34} color={darkColors.categoryOrganic} />
        <Bin x={72} color={darkColors.categoryPlastic} />
        <Bin x={256} color={darkColors.categoryPaper} />

        <G transform="rotate(-6 160 118)">
          <Rect
            x={110}
            y={28}
            width={100}
            height={178}
            rx={18}
            fill={colors.brandPressed}
            stroke={colors.brandForeground}
            strokeOpacity={0.5}
            strokeWidth={2}
          />
          <Rect
            x={118}
            y={42}
            width={84}
            height={150}
            rx={11}
            fill={colors.brandForeground}
            opacity={0.94}
          />
          <Rect
            x={146}
            y={33}
            width={28}
            height={4}
            rx={2}
            fill={colors.brandForeground}
            opacity={0.4}
          />

          <Path d="M130 74 v-10 h10" {...corner} />
          <Path d="M180 64 h10 v10" {...corner} />
          <Path d="M130 142 v10 h10" {...corner} />
          <Path d="M180 152 h10 v-10" {...corner} />

          <Rect
            x={154}
            y={78}
            width={12}
            height={7}
            rx={2}
            fill={colors.brand}
          />
          <Path
            d="M155 86 h10 v5 c0 2 5 4 5 10 v34 a7 7 0 0 1 -7 7 h-6 a7 7 0 0 1 -7 -7 v-34 c0 -6 5 -8 5 -10 z"
            fill={colors.brand}
            opacity={0.88}
          />
          <Rect
            x={150}
            y={110}
            width={20}
            height={12}
            rx={2}
            fill={colors.brandForeground}
            opacity={0.55}
          />

          <Rect
            x={124}
            y={121}
            width={72}
            height={10}
            fill={colors.primary}
            opacity={0.16}
          />
          <Line
            x1={124}
            y1={126}
            x2={196}
            y2={126}
            stroke={colors.primary}
            strokeWidth={2}
          />

          <Rect
            x={132}
            y={164}
            width={56}
            height={16}
            rx={8}
            fill={colors.brand}
            opacity={0.14}
          />
          <Circle cx={142} cy={172} r={3.5} fill={darkColors.categoryPlastic} />
          <Rect
            x={150}
            y={169}
            width={30}
            height={6}
            rx={3}
            fill={colors.brand}
            opacity={0.45}
          />
        </G>

        <Path
          d="M232 34 C234 45 237 48 248 50 C237 52 234 55 232 66 C230 55 227 52 216 50 C227 48 230 45 232 34 Z"
          fill={colors.brandForeground}
        />
        <Path
          d="M252 76 C253 81 254 82 259 83 C254 84 253 85 252 90 C251 85 250 84 245 83 C250 82 251 81 252 76 Z"
          fill={colors.brandForeground}
          opacity={0.7}
        />
        <Path
          d="M84 58 C85 63 86 64 91 65 C86 66 85 67 84 72 C83 67 82 66 77 65 C82 64 83 63 84 58 Z"
          fill={colors.brandForeground}
          opacity={0.5}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    minHeight: 120,
    maxHeight: 280,
    alignSelf: 'stretch',
  },
});
