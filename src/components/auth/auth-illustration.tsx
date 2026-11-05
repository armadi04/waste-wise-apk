import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import { useTheme } from '@/theme';
import { darkColors } from '@/theme/tokens';

import {
  buildScene,
  SCENE_GRADIENTS,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  type ScenePalette,
} from './illustration/scene';

/**
 * Decorative isometric hero art: a floating island with a phone scanning a
 * bottle, an AI result card, and the three category bins. The auth hero is a
 * dark brand surface in both themes, so the bins use the dark category hues.
 */
export function AuthIllustration() {
  const { colors } = useTheme();
  const palette = useMemo<ScenePalette>(
    () => ({
      brand: colors.brand,
      brandPressed: colors.brandPressed,
      brandForeground: colors.brandForeground,
      primary: colors.primary,
      success: darkColors.success,
      shadow: colors.shadow,
      organic: darkColors.categoryOrganic,
      plastic: darkColors.categoryPlastic,
      paper: darkColors.categoryPaper,
    }),
    [colors],
  );
  const shapes = useMemo(() => buildScene(palette), [palette]);
  const gradients = useMemo(() => SCENE_GRADIENTS(palette), [palette]);

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
        viewBox={`0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          {gradients.map((g) => {
            const stops = g.stops.map((st) => (
              <Stop
                key={st.offset}
                offset={st.offset}
                stopColor={st.color}
                stopOpacity={st.opacity}
              />
            ));
            return g.type === 'linear' ? (
              <LinearGradient
                key={g.id}
                id={g.id}
                x1={g.coords[0]}
                y1={g.coords[1]}
                x2={g.coords[2]}
                y2={g.coords[3]}
              >
                {stops}
              </LinearGradient>
            ) : (
              <RadialGradient
                key={g.id}
                id={g.id}
                cx={g.coords[0]}
                cy={g.coords[1]}
                r={g.coords[2]}
              >
                {stops}
              </RadialGradient>
            );
          })}
        </Defs>
        {shapes.map((shape, index) => {
          if (shape.kind === 'polygon') {
            return (
              <Polygon
                key={index}
                points={shape.points}
                fill={shape.fill}
                opacity={shape.opacity}
              />
            );
          }
          if (shape.kind === 'ellipse') {
            return (
              <Ellipse
                key={index}
                cx={shape.cx}
                cy={shape.cy}
                rx={shape.rx}
                ry={shape.ry}
                fill={shape.fill}
                opacity={shape.opacity}
              />
            );
          }
          return (
            <Path
              key={index}
              d={shape.d}
              fill={shape.fill ?? 'none'}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
              strokeDasharray={shape.dash}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={shape.opacity}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    minHeight: 140,
    maxHeight: 320,
    alignSelf: 'stretch',
  },
});
