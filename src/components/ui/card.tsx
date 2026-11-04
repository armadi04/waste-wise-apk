import { View, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export function Card({ style, ...rest }: ViewProps & { style?: ViewStyle }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          padding: spacing.lg,
        },
        style,
      ]}
    />
  );
}
