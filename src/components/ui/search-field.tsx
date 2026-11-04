import { Search, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, TextInput, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search',
  accessibilityLabel = 'Search',
  style,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
}) {
  const { colors, radius, spacing, fontFamily } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          minHeight: 48,
          paddingLeft: spacing.md,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: focused ? colors.inputBorderFocus : colors.borderSubtle,
          backgroundColor: colors.inputBackground,
        },
        style,
      ]}
    >
      <Search size={18} color={colors.mutedForeground} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inputPlaceholder}
        selectionColor={colors.primary}
        accessibilityLabel={accessibilityLabel}
        returnKeyType="search"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          minHeight: 46,
          color: colors.inputForeground,
          fontFamily: fontFamily.regular,
          fontSize: 16,
          paddingVertical: 0,
        }}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={() => onChangeText('')}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.pill,
            backgroundColor: pressed ? colors.surfaceHover : 'transparent',
          })}
        >
          <X size={18} color={colors.mutedForeground} />
        </Pressable>
      ) : (
        <View style={{ width: spacing.sm }} />
      )}
    </View>
  );
}
