import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme';

type Variant =
  | 'display'
  | 'pageTitle'
  | 'sectionTitle'
  | 'cardTitle'
  | 'body'
  | 'label'
  | 'button'
  | 'caption'
  | 'metadata';

interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: string;
  weight?: 'regular' | 'medium' | 'semibold';
}

export function AppText({
  variant = 'body',
  color,
  weight,
  style,
  ...rest
}: AppTextProps) {
  const { colors, typography, fontFamily } = useTheme();
  const variantStyle = typography[variant];
  const font =
    weight === 'regular'
      ? fontFamily.regular
      : weight === 'medium'
        ? fontFamily.medium
        : weight === 'semibold'
          ? fontFamily.semibold
          : variantStyle.fontWeight === '600'
            ? fontFamily.semibold
            : variantStyle.fontWeight === '500'
              ? fontFamily.medium
              : fontFamily.regular;

  return (
    <Text
      {...rest}
      style={[
        variantStyle as TextStyle,
        { color: color ?? colors.foreground, fontFamily: font },
        style,
      ]}
    />
  );
}
