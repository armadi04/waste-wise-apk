import { Pressable, ScrollView } from 'react-native';

import { useTheme } from '@/theme';

import { AppText } from './text';

interface Option<T extends string> {
  label: string;
  value: T;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  scrollable,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  scrollable?: boolean;
}) {
  const { colors, radius, spacing } = useTheme();

  const content = (
    <Pressable style={{ flexDirection: 'row', gap: spacing.sm }} accessibilityRole="tablist">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={{
              paddingHorizontal: spacing.md,
              minHeight: 40,
              justifyContent: 'center',
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: active ? colors.selectedBorder : colors.borderSubtle,
              backgroundColor: active ? colors.selectedBackground : colors.surface,
            }}
          >
            <AppText
              variant="label"
              color={active ? colors.selectedForeground : colors.mutedForeground}
              weight={active ? 'semibold' : 'medium'}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </Pressable>
  );

  if (!scrollable) return content;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {content}
    </ScrollView>
  );
}
